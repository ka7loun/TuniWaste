import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface JwtPayload {
  id: string;
  role: string;
}

// Store user socket connections: userId -> socketId
const userSockets = new Map<string, string>();

export const initializeSocketServer = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.IO
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log(`✅ User ${userId} connected via Socket.IO`);

    // Store the socket connection for this user
    userSockets.set(userId, socket.id);

    // Join user to their personal room (for direct messaging)
    socket.join(`user:${userId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User ${userId} disconnected from Socket.IO`);
      userSockets.delete(userId);
    });

    // Handle joining a thread room (for real-time updates in a specific conversation)
    socket.on('join-thread', (threadId: string) => {
      socket.join(`thread:${threadId}`);
      console.log(`User ${userId} joined thread ${threadId}`);
    });

    // Handle leaving a thread room
    socket.on('leave-thread', (threadId: string) => {
      socket.leave(`thread:${threadId}`);
      console.log(`User ${userId} left thread ${threadId}`);
    });
  });

  return io;
};

// Helper function to emit a message to a specific user
export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any): void => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper function to emit a message to all users in a thread
export const emitToThread = (io: SocketIOServer, threadId: string, event: string, data: any): void => {
  io.to(`thread:${threadId}`).emit(event, data);
};

// Helper function to check if a user is online
export const isUserOnline = (userId: string): boolean => {
  return userSockets.has(userId);
};







