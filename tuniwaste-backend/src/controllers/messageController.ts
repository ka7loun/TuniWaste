import { Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import MessageThread from '../models/MessageThread.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { emitToThread, emitToUser } from '../socket/socketServer.js';

export const getThreads = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const threads = await MessageThread.find({ participants: userId })
      .populate('participants', 'company email')
      .populate('listingId', 'title')
      .sort({ lastTimestamp: -1 });

    // Calculate unread counts for each thread
    const threadsWithUnread = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await Message.countDocuments({
          threadId: thread._id,
          sender: { $ne: userId },
          readBy: { $ne: userId },
        });

        const lastMessage = await Message.findOne({ threadId: thread._id })
          .sort({ timestamp: -1 })
          .populate('sender', 'company');

        const otherParticipant = thread.participants.find((p: any) => p._id.toString() !== userId);
        const isAdmin = (req as any).userRole === 'admin';
        const counterpartName = isAdmin 
          ? (otherParticipant?.company || 'User')
          : (otherParticipant?.role === 'generator' ? 'Seller' : 'Buyer');

        return {
          id: thread._id,
          counterpart: counterpartName,
          role: otherParticipant?.role || 'buyer',
          unread: unreadCount,
          lastMessage: lastMessage?.body || thread.lastMessage,
          lastTimestamp: lastMessage?.timestamp || thread.lastTimestamp,
        };
      })
    );

    res.json(threadsWithUnread);
  } catch (error: any) {
    console.error('Get threads error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getThreadMessages = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    const userId = req.userId;

    // Verify user is a participant
    const thread = await MessageThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (!thread.participants.some((p) => p.toString() === userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ threadId })
      .populate('sender', 'company email role')
      .sort({ timestamp: 1 });

    // Hide sender information for non-admin users
    const isAdmin = (req as any).userRole === 'admin';
    const anonymizedMessages = messages.map((message: any) => {
      const messageObj = message.toObject();
      if (!isAdmin && messageObj.sender) {
        const senderRole = messageObj.sender.role || 'buyer';
        messageObj.sender = {
          _id: messageObj.sender._id,
          company: senderRole === 'generator' ? 'Seller' : 'Buyer',
          email: '',
          role: senderRole,
        };
      }
      return messageObj;
    });

    res.json(anonymizedMessages);
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createThread = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { otherUserId, listingId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    // Check if thread already exists
    const existingThread = await MessageThread.findOne({
      participants: { $all: [userId, otherUserId] },
      listingId: listingId || null,
    });

    if (existingThread) {
      return res.json(existingThread);
    }

    // Create new thread
    const thread = new MessageThread({
      participants: [userId, otherUserId],
      listingId: listingId || undefined,
    });

    await thread.save();
    await thread.populate('participants', 'company email');
    if (listingId) {
      await thread.populate('listingId', 'title');
    }

    res.status(201).json(thread);
  } catch (error: any) {
    console.error('Create thread error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { threadId, body, attachments } = req.body;

    console.log('📨 Send message request:', { userId, threadId, body: body?.substring(0, 50) });

    if (!userId) {
      console.error('❌ No userId in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!threadId || !body) {
      console.error('❌ Missing threadId or body:', { threadId, hasBody: !!body });
      return res.status(400).json({ message: 'Thread ID and message body are required' });
    }

    // Verify user is a participant
    const thread = await MessageThread.findById(threadId);
    if (!thread) {
      console.error('❌ Thread not found:', threadId);
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (!thread.participants.some((p) => p.toString() === userId)) {
      console.error('❌ User not a participant:', { userId, participants: thread.participants });
      return res.status(403).json({ message: 'Access denied: You are not a participant in this thread' });
    }

    // STEP 1: PERSIST MESSAGE TO MONGODB (Primary action - always happens first)
    console.log('💾 Saving message to MongoDB...');
    const message = new Message({
      threadId,
      sender: userId,
      body: body.trim(),
      attachments: attachments || [],
    });

    await message.save();
    console.log('✅ Message saved to MongoDB:', message._id);

    // Update thread last message
    thread.lastMessage = body.trim();
    thread.lastTimestamp = message.timestamp;
    await thread.save();
    console.log('✅ Thread updated');

    // Populate sender information for response
    await message.populate('sender', 'company email');
    console.log('✅ Message populated with sender info');

    // Transform message to plain object for response (Mongoose documents don't serialize well)
    const messageResponse = {
      _id: message._id.toString(),
      threadId: message.threadId.toString(),
      sender: {
        _id: (message.sender as any)._id.toString(),
        company: (message.sender as any).company,
        email: (message.sender as any).email,
      },
      body: message.body,
      timestamp: message.timestamp.toISOString(),
      attachments: message.attachments || [],
      createdAt: message.createdAt.toISOString(),
    };

    // STEP 2: BROADCAST VIA WEBSOCKET (Real-time push to online recipients)
    const io: SocketIOServer = (req.app as any).io;
    if (io) {
      console.log('🔌 Broadcasting message via WebSocket...');
      // Find the other participant(s) in the thread
      const otherParticipants = thread.participants.filter((p) => p.toString() !== userId);

      // Emit to all users in the thread room (real-time update)
      emitToThread(io, threadId, 'new-message', messageResponse);
      console.log('✅ Emitted to thread room:', threadId);

      // Also emit to individual users (for notifications)
      for (const participantId of otherParticipants) {
        emitToUser(io, participantId.toString(), 'message-received', {
          threadId: threadId,
          message: messageResponse,
        });
        console.log('✅ Emitted to user:', participantId.toString());
      }
    } else {
      console.warn('⚠️ Socket.IO not available - message saved but not broadcast');
    }

    // Create notification for other participant (fallback for offline users)
    const otherParticipantId = thread.participants.find((p) => p.toString() !== userId);
    if (otherParticipantId) {
      const sender = await User.findById(userId);
      const notification = new Notification({
        userId: otherParticipantId,
        type: 'message',
        title: 'New message',
        detail: `You have a new message from ${sender?.company || 'User'}.`,
        relatedId: message._id,
      });
      await notification.save();
    }

    // Return properly formatted response
    console.log('✅ Sending response to client');
    res.status(201).json(messageResponse);
  } catch (error: any) {
    console.error('❌ Send message error:', error);
    console.error('Error stack:', error.stack);
    // Don't expose internal error details in production
    res.status(500).json({ 
      message: 'Server error while sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Add user to readBy if not already there
    if (!message.readBy.some((id) => id.toString() === userId)) {
      message.readBy.push(userId as any);
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error: any) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markThreadAsRead = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    const userId = req.userId;

    // Verify user is a participant
    const thread = await MessageThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (!thread.participants.some((p) => p.toString() === userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all messages in thread as read
    await Message.updateMany(
      { threadId, sender: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    res.json({ message: 'Thread marked as read' });
  } catch (error: any) {
    console.error('Mark thread as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

