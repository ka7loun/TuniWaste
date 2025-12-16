import { Request, Response } from 'express';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Bid from '../models/Bid.js';
import Transaction from '../models/Transaction.js';
import Message from '../models/Message.js';
import MessageThread from '../models/MessageThread.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

// Dashboard Overview Statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    const thisYear = new Date(today);
    thisYear.setFullYear(thisYear.getFullYear() - 1);

    // Total counts
    const [
      totalUsers,
      totalListings,
      totalBids,
      totalTransactions,
      totalMessages,
      totalNotifications,
      verifiedUsers,
      activeListings,
      completedTransactions,
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Bid.countDocuments(),
      Transaction.countDocuments(),
      Message.countDocuments(),
      Notification.countDocuments(),
      User.countDocuments({ verified: true }),
      Listing.countDocuments({ status: 'open' }),
      Transaction.countDocuments({ stage: 'delivered' }),
    ]);

    // Today's counts
    const [
      usersToday,
      listingsToday,
      bidsToday,
      transactionsToday,
      messagesToday,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: today } }),
      Listing.countDocuments({ createdAt: { $gte: today } }),
      Bid.countDocuments({ createdAt: { $gte: today } }),
      Transaction.countDocuments({ createdAt: { $gte: today } }),
      Message.countDocuments({ createdAt: { $gte: today } }),
    ]);

    // This week's counts
    const [
      usersThisWeek,
      listingsThisWeek,
      bidsThisWeek,
      transactionsThisWeek,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thisWeek } }),
      Listing.countDocuments({ createdAt: { $gte: thisWeek } }),
      Bid.countDocuments({ createdAt: { $gte: thisWeek } }),
      Transaction.countDocuments({ createdAt: { $gte: thisWeek } }),
    ]);

    // This month's counts
    const [
      usersThisMonth,
      listingsThisMonth,
      bidsThisMonth,
      transactionsThisMonth,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      Listing.countDocuments({ createdAt: { $gte: thisMonth } }),
      Bid.countDocuments({ createdAt: { $gte: thisMonth } }),
      Transaction.countDocuments({ createdAt: { $gte: thisMonth } }),
    ]);

    // User role distribution
    const [generators, buyers, admins] = await Promise.all([
      User.countDocuments({ role: 'generator' }),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    // Listing status distribution
    const [openListings, reservedListings, awardedListings] = await Promise.all([
      Listing.countDocuments({ status: 'open' }),
      Listing.countDocuments({ status: 'reserved' }),
      Listing.countDocuments({ status: 'awarded' }),
    ]);

    // Transaction stage distribution
    const [
      negotiationTransactions,
      contractTransactions,
      inTransitTransactions,
      deliveredTransactions,
    ] = await Promise.all([
      Transaction.countDocuments({ stage: 'negotiation' }),
      Transaction.countDocuments({ stage: 'contract' }),
      Transaction.countDocuments({ stage: 'in-transit' }),
      Transaction.countDocuments({ stage: 'delivered' }),
    ]);

    // Bid status distribution
    const [pendingBids, acceptedBids, declinedBids] = await Promise.all([
      Bid.countDocuments({ status: 'pending' }),
      Bid.countDocuments({ status: 'accepted' }),
      Bid.countDocuments({ status: 'declined' }),
    ]);

    // Calculate total waste diverted
    const deliveredTransactionsWithListings = await Transaction.find({
      stage: 'delivered',
    }).populate('listingId', 'quantityTons');
    
    const totalWasteDiverted = deliveredTransactionsWithListings.reduce(
      (sum, t) => sum + ((t.listingId as any)?.quantityTons || 0),
      0
    );

    // Calculate total transaction value
    const totalTransactionValue = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);
    const totalValue = totalTransactionValue[0]?.total || 0;

    res.json({
      overview: {
        totalUsers,
        totalListings,
        totalBids,
        totalTransactions,
        totalMessages,
        totalNotifications,
        verifiedUsers,
        activeListings,
        completedTransactions,
        totalWasteDiverted: Math.round(totalWasteDiverted * 100) / 100,
        totalTransactionValue: Math.round(totalValue * 100) / 100,
      },
      today: {
        users: usersToday,
        listings: listingsToday,
        bids: bidsToday,
        transactions: transactionsToday,
        messages: messagesToday,
      },
      thisWeek: {
        users: usersThisWeek,
        listings: listingsThisWeek,
        bids: bidsThisWeek,
        transactions: transactionsThisWeek,
      },
      thisMonth: {
        users: usersThisMonth,
        listings: listingsThisMonth,
        bids: bidsThisMonth,
        transactions: transactionsThisMonth,
      },
      distributions: {
        users: {
          generators,
          buyers,
          admins,
        },
        listings: {
          open: openListings,
          reserved: reservedListings,
          awarded: awardedListings,
        },
        transactions: {
          negotiation: negotiationTransactions,
          contract: contractTransactions,
          inTransit: inTransitTransactions,
          delivered: deliveredTransactions,
        },
        bids: {
          pending: pendingBids,
          accepted: acceptedBids,
          declined: declinedBids,
        },
      },
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get activity timeline
export const getActivityTimeline = async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(Number(limit), 100);
    const offsetNum = Number(offset);

    // Get recent activities from all collections
    const [
      recentUsers,
      recentListings,
      recentBids,
      recentTransactions,
      recentMessages,
    ] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .select('email company role verified createdAt')
        .lean(),
      Listing.find()
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .populate('seller', 'email company')
        .select('title category status createdAt')
        .lean(),
      Bid.find()
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .populate('bidder', 'email company')
        .populate('listingId', 'title')
        .select('amount status createdAt')
        .lean(),
      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .populate('seller', 'email company')
        .populate('buyer', 'email company')
        .select('value stage createdAt')
        .lean(),
      Message.find()
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .populate('sender', 'email company')
        .select('body createdAt')
        .lean(),
    ]);

    // Combine and sort by date
    const activities: any[] = [];

    recentUsers.forEach((user) => {
      activities.push({
        type: 'user_created',
        timestamp: user.createdAt,
        data: {
          email: user.email,
          company: user.company,
          role: user.role,
          verified: user.verified,
        },
      });
    });

    recentListings.forEach((listing: any) => {
      activities.push({
        type: 'listing_created',
        timestamp: listing.createdAt,
        data: {
          title: listing.title,
          category: listing.category,
          status: listing.status,
          seller: listing.seller?.email || 'Unknown',
        },
      });
    });

    recentBids.forEach((bid: any) => {
      activities.push({
        type: 'bid_placed',
        timestamp: bid.createdAt,
        data: {
          amount: bid.amount,
          status: bid.status,
          bidder: bid.bidder?.email || 'Unknown',
          listing: bid.listingId?.title || 'Unknown',
        },
      });
    });

    recentTransactions.forEach((transaction: any) => {
      activities.push({
        type: 'transaction_created',
        timestamp: transaction.createdAt,
        data: {
          value: transaction.value,
          stage: transaction.stage,
          seller: transaction.seller?.email || 'Unknown',
          buyer: transaction.buyer?.email || 'Unknown',
        },
      });
    });

    recentMessages.forEach((message: any) => {
      activities.push({
        type: 'message_sent',
        timestamp: message.createdAt,
        data: {
          sender: message.sender?.email || 'Unknown',
          preview: message.body.substring(0, 50),
        },
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const paginatedActivities = activities.slice(offsetNum, offsetNum + limitNum);

    res.json({
      activities: paginatedActivities,
      total: activities.length,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error: any) {
    console.error('Get activity timeline error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get analytics data
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    // User growth over time
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Listing creation over time
    const listingGrowth = await Listing.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Transaction value over time
    const transactionValue = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalValue: { $sum: '$value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Category distribution
    const categoryDistribution = await Listing.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantityTons' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Top sellers by listings
    const topSellers = await Listing.aggregate([
      {
        $group: {
          _id: '$seller',
          listingCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantityTons' },
        },
      },
      { $sort: { listingCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          email: '$user.email',
          company: '$user.company',
          listingCount: 1,
          totalQuantity: 1,
        },
      },
    ]);

    // Top buyers by transactions
    const topBuyers = await Transaction.aggregate([
      {
        $group: {
          _id: '$buyer',
          transactionCount: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          email: '$user.email',
          company: '$user.company',
          transactionCount: 1,
          totalValue: 1,
        },
      },
    ]);

    res.json({
      userGrowth,
      listingGrowth,
      transactionValue,
      categoryDistribution,
      topSellers,
      topBuyers,
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User Management
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, role, verified, search } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (role) query.role = role;
    if (verified !== undefined) query.verified = verified === 'true';
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's listings, bids, transactions
    const [listings, bids, transactionsAsSeller, transactionsAsBuyer] =
      await Promise.all([
        Listing.find({ seller: id }).lean(),
        Bid.find({ bidder: id }).lean(),
        Transaction.find({ seller: id }).lean(),
        Transaction.find({ buyer: id }).lean(),
      ]);

    res.json({
      user,
      stats: {
        listings: listings.length,
        bids: bids.length,
        transactionsAsSeller: transactionsAsSeller.length,
        transactionsAsBuyer: transactionsAsBuyer.length,
      },
      listings,
      bids,
      transactions: [...transactionsAsSeller, ...transactionsAsBuyer],
    });
  } catch (error: any) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verified, role, company, contact } = req.body;

    const updateData: any = {};
    if (verified !== undefined) updateData.verified = verified;
    if (role) updateData.role = role;
    if (company) updateData.company = company;
    if (contact) updateData.contact = contact;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Listing Management
export const getAllListings = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, status, category, search } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate('seller', 'email company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(query),
    ]);

    res.json({
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get all listings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json({ message: 'Listing deleted successfully' });
  } catch (error: any) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Transaction Management
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, stage, search } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (stage) query.stage = stage;
    if (search) {
      query.$or = [
        { value: { $gte: Number(search) } },
      ];
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('seller', 'email company')
        .populate('buyer', 'email company')
        .populate('listingId', 'title category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    res.json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
