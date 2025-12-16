import { Request, Response } from 'express';
import Bid from '../models/Bid.js';
import Listing from '../models/Listing.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import MessageThread from '../models/MessageThread.js';

export const getBidsByListing = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const userRole = req.userRole;
    const bids = await Bid.find({ listingId })
      .populate('bidder', 'company email')
      .sort({ timestamp: -1 });

    // Hide bidder information for non-admin users
    const isAdmin = userRole === 'admin';
    const anonymizedBids = bids.map((bid: any) => {
      const bidObj = bid.toObject();
      if (!isAdmin && bidObj.bidder) {
        bidObj.bidder = {
          _id: bidObj.bidder._id,
          company: 'Buyer',
          email: '',
        };
      }
      return bidObj;
    });

    res.json(anonymizedBids);
  } catch (error: any) {
    console.error('Get bids error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyBids = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    const isAdmin = userRole === 'admin';

    if (userRole === 'buyer') {
      // Buyers see their own bids
      const bids = await Bid.find({ bidder: userId })
        .populate('listingId')
        .populate('bidder', 'company email')
        .sort({ timestamp: -1 });
      
      // Anonymize bidder info for non-admin users
      const anonymizedBids = bids.map((bid: any) => {
        const bidObj = bid.toObject();
        if (!isAdmin && bidObj.bidder) {
          bidObj.bidder = {
            _id: bidObj.bidder._id,
            company: 'Buyer',
            email: '',
          };
        }
        return bidObj;
      });
      
      res.json(anonymizedBids);
    } else if (userRole === 'generator') {
      // Sellers see bids on their listings
      const myListings = await Listing.find({ seller: userId }).select('_id');
      const listingIds = myListings.map((l) => l._id);
      const bids = await Bid.find({ listingId: { $in: listingIds } })
        .populate('listingId')
        .populate('bidder', 'company email')
        .sort({ timestamp: -1 });
      
      // Anonymize bidder info for non-admin users
      const anonymizedBids = bids.map((bid: any) => {
        const bidObj = bid.toObject();
        if (!isAdmin && bidObj.bidder) {
          bidObj.bidder = {
            _id: bidObj.bidder._id,
            company: 'Buyer',
            email: '',
          };
        }
        return bidObj;
      });
      
      res.json(anonymizedBids);
    } else {
      res.status(403).json({ message: 'Invalid role' });
    }
  } catch (error: any) {
    console.error('Get my bids error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const placeBid = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can place bids' });
    }

    const { listingId, amount } = req.body;

    if (!listingId || !amount) {
      return res.status(400).json({ message: 'Listing ID and amount are required' });
    }

    // Check if listing exists and is open
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'open') {
      return res.status(400).json({ message: 'Can only bid on open listings' });
    }

    // Check if user is not bidding on their own listing
    if (listing.seller.toString() === userId) {
      return res.status(400).json({ message: 'Cannot bid on your own listing' });
    }

    // Create bid
    const bid = new Bid({
      listingId,
      bidder: userId,
      amount,
      status: 'pending',
    });

    await bid.save();
    await bid.populate('bidder', 'company email');
    await bid.populate('listingId');

    // Create notification for seller
    const bidder = await User.findById(userId);
    if (bidder) {
      const notification = new Notification({
        userId: listing.seller,
        type: 'bid',
        title: 'New bid received',
        detail: `${bidder.company} placed a bid of ${amount} TND/ton on ${listing.title}.`,
        relatedId: bid._id,
      });
      await notification.save();
    }

    res.status(201).json(bid);
  } catch (error: any) {
    console.error('Place bid error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const acceptBid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== 'generator') {
      return res.status(403).json({ message: 'Only sellers can accept bids' });
    }

    const bid = await Bid.findById(id).populate('listingId');
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const listing = bid.listingId as any;
    if (listing.seller.toString() !== userId) {
      return res.status(403).json({ message: 'You can only accept bids on your own listings' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Bid is not pending' });
    }

    // Update bid status
    bid.status = 'accepted';
    await bid.save();

    // Update listing status
    listing.status = 'reserved';
    await listing.save();

    // Decline all other bids on this listing
    await Bid.updateMany(
      { listingId: listing._id, _id: { $ne: bid._id } },
      { status: 'declined' }
    );

    // Create transaction
    const transaction = new Transaction({
      listingId: listing._id,
      bidId: bid._id,
      seller: userId,
      buyer: bid.bidder,
      value: bid.amount * listing.quantityTons,
      stage: 'negotiation',
    });
    await transaction.save();

    // Auto-create message thread for buyer and seller
    const existingThread = await MessageThread.findOne({
      participants: { $all: [userId, bid.bidder] },
      listingId: listing._id,
    });

    if (!existingThread) {
      const thread = new MessageThread({
        participants: [userId, bid.bidder],
        listingId: listing._id,
        lastMessage: `Transaction started for ${listing.title}`,
        lastTimestamp: new Date(),
      });
      await thread.save();
    }

    // Create notifications
    const buyer = await User.findById(bid.bidder);
    if (buyer) {
      const notification = new Notification({
        userId: bid.bidder,
        type: 'bid',
        title: 'Bid accepted',
        detail: `Your bid on ${listing.title} has been accepted. You can now message the seller.`,
        relatedId: transaction._id,
      });
      await notification.save();
    }

    await bid.populate('bidder', 'company email');

    res.json(bid);
  } catch (error: any) {
    console.error('Accept bid error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const declineBid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== 'generator') {
      return res.status(403).json({ message: 'Only sellers can decline bids' });
    }

    const bid = await Bid.findById(id).populate('listingId');
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const listing = bid.listingId as any;
    if (listing.seller.toString() !== userId) {
      return res.status(403).json({ message: 'You can only decline bids on your own listings' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Bid is not pending' });
    }

    // Update bid status
    bid.status = 'declined';
    await bid.save();

    // Create notification for buyer
    const buyer = await User.findById(bid.bidder);
    if (buyer) {
      const notification = new Notification({
        userId: bid.bidder,
        type: 'bid',
        title: 'Bid declined',
        detail: `Your bid on ${listing.title} has been declined.`,
        relatedId: bid._id,
      });
      await notification.save();
    }

    await bid.populate('bidder', 'company email');

    res.json(bid);
  } catch (error: any) {
    console.error('Decline bid error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

