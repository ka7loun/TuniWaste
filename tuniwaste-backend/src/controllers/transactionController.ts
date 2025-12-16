import { Request, Response } from 'express';
import Transaction from '../models/Transaction.js';
import Listing from '../models/Listing.js';
import Notification from '../models/Notification.js';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const transactions = await Transaction.find({
      $or: [{ seller: userId }, { buyer: userId }],
    })
      .populate('listingId', 'title')
      .populate('seller', 'company')
      .populate('buyer', 'company')
      .populate('bidId')
      .sort({ createdAt: -1 });

    // Transform to match frontend format
    const isAdmin = (req as any).userRole === 'admin';
    const formatted = transactions.map((t) => {
      const sellerId = (t.seller as any)?._id?.toString() || (t.seller as any)?.toString();
      const buyerId = (t.buyer as any)?._id?.toString() || (t.buyer as any)?.toString();
      const isSeller = sellerId === userId;
      
      let counterpartyName: string;
      if (isAdmin) {
        counterpartyName = isSeller
          ? (t.buyer as any)?.company || 'Buyer'
          : (t.seller as any)?.company || 'Seller';
      } else {
        counterpartyName = isSeller ? 'Buyer' : 'Seller';
      }

      return {
        id: t._id,
        listingTitle: (t.listingId as any)?.title || 'Unknown',
        counterparty: counterpartyName,
        value: t.value,
        stage: t.stage,
        updatedAt: t.updatedAt,
        documents: t.documents,
      };
    });

    res.json(formatted);
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findById(id)
      .populate('listingId')
      .populate('seller', 'company email')
      .populate('buyer', 'company email')
      .populate('bidId');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify user is part of transaction
    if (
      (transaction.seller as any)._id.toString() !== userId &&
      (transaction.buyer as any)._id.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(transaction);
  } catch (error: any) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTransactionStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ message: 'Stage is required' });
    }

    const validStages = ['negotiation', 'in-transit', 'delivered'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage' });
    }

    const transaction = await Transaction.findById(id)
      .populate('seller')
      .populate('buyer')
      .populate('listingId');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify user is part of transaction
    const isSeller = (transaction.seller as any)._id.toString() === userId;
    const isBuyer = (transaction.buyer as any)._id.toString() === userId;

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update stage
    transaction.stage = stage as any;
    transaction.updatedAt = new Date();
    await transaction.save();

    // Create notification for other party
    const otherPartyId = isSeller
      ? (transaction.buyer as any)._id
      : (transaction.seller as any)._id;
    const listing = transaction.listingId as any;

    const notification = new Notification({
      userId: otherPartyId,
      type: 'system',
      title: 'Transaction stage updated',
      detail: `Transaction for ${listing?.title || 'listing'} moved to ${stage}.`,
      relatedId: transaction._id,
    });
    await notification.save();

    await transaction.populate('listingId', 'title');
    await transaction.populate('seller', 'company');
    await transaction.populate('buyer', 'company');

    res.json(transaction);
  } catch (error: any) {
    console.error('Update transaction stage error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addTransactionDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { document } = req.body;

    if (!document) {
      return res.status(400).json({ message: 'Document filename is required' });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify user is part of transaction
    const sellerId = (transaction.seller as any)?._id?.toString() || (transaction.seller as any)?.toString();
    const buyerId = (transaction.buyer as any)?._id?.toString() || (transaction.buyer as any)?.toString();
    
    if (sellerId !== userId && buyerId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add document if not already present
    if (!transaction.documents.includes(document)) {
      transaction.documents.push(document);
      await transaction.save();
    }

    res.json(transaction);
  } catch (error: any) {
    console.error('Add transaction document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

