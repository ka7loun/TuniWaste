import { Request, Response } from 'express';
import Listing from '../models/Listing.js';
import User from '../models/User.js';

export const getListings = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { category, location, status, minQuantity } = req.query;

    console.log('getListings called:');
    console.log('- userId:', userId);
    console.log('- userRole:', userRole);
    console.log('- query params:', { category, location, status, minQuantity });

    const user = userId ? await User.findById(userId) : null;

    // Build filter
    const filter: any = {};

    // Role-based filtering
    if (userRole === 'generator') {
      // Sellers see only their own listings
      filter.seller = userId;
      console.log('Generator filter: seller =', userId);
    } else if (userRole === 'buyer') {
      // Buyers see only open listings
      filter.status = 'open';
      console.log('Buyer filter: status = open');
    }

    // Additional filters
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (minQuantity) {
      filter.quantityTons = { $gte: Number(minQuantity) };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    console.log('Final filter:', JSON.stringify(filter, null, 2));

    const listings = await Listing.find(filter)
      .populate('seller', 'company email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${listings.length} listings`);

    // Hide seller information for non-admin users
    const isAdmin = userRole === 'admin';
    const anonymizedListings = listings.map((listing: any) => {
      const listingObj = listing.toObject();
      if (!isAdmin && listingObj.seller) {
        listingObj.seller = {
          _id: listingObj.seller._id,
          company: 'Seller',
          email: '',
        };
      }
      return listingObj;
    });

    res.json(anonymizedListings);
  } catch (error: any) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getListingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.userRole;
    const listing = await Listing.findById(id).populate('seller', 'company email contact');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Hide seller information for non-admin users
    const isAdmin = userRole === 'admin';
    const listingObj = listing.toObject();
    if (!isAdmin && listingObj.seller) {
      listingObj.seller = {
        _id: listingObj.seller._id,
        company: 'Seller',
        email: '',
        contact: '',
      };
    }

    res.json(listingObj);
  } catch (error: any) {
    console.error('Get listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyListings = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== 'generator') {
      return res.status(403).json({ message: 'Only sellers can view their listings' });
    }

    const listings = await Listing.find({ seller: userId })
      .populate('seller', 'company email')
      .sort({ createdAt: -1 });

    // Sellers can see their own company name, but anonymize for others
    const isAdmin = req.userRole === 'admin';
    const anonymizedListings = listings.map((listing: any) => {
      const listingObj = listing.toObject();
      // Keep seller info visible to the seller themselves and admins
      if (!isAdmin && listingObj.seller && listingObj.seller._id.toString() !== userId) {
        listingObj.seller = {
          _id: listingObj.seller._id,
          company: 'Seller',
          email: '',
        };
      }
      return listingObj;
    });

    res.json(anonymizedListings);
  } catch (error: any) {
    console.error('Get my listings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createListing = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== 'generator') {
      return res.status(403).json({ message: 'Only sellers can create listings' });
    }

    const user = await User.findById(userId);
    if (!user || !user.verified) {
      return res.status(403).json({ message: 'User must be verified to create listings' });
    }

    const {
      title,
      material,
      category,
      quantityTons,
      location,
      coords,
      pricePerTon,
      certifications,
      availableFrom,
      expiresOn,
      pickupRequirements,
      documents,
      thumbnail,
    } = req.body;

    console.log('Creating listing with thumbnail:', thumbnail);
    console.log('Documents:', documents);

    const listing = new Listing({
      title,
      material,
      category,
      quantityTons,
      location,
      coords,
      seller: userId,
      status: 'open',
      pricePerTon,
      certifications: certifications || [],
      availableFrom: new Date(availableFrom),
      expiresOn: new Date(expiresOn),
      pickupRequirements: pickupRequirements || '',
      documents: documents || [],
      thumbnail: thumbnail || '',
    });

    await listing.save();
    console.log('Listing saved with ID:', listing._id);
    console.log('Listing thumbnail stored:', listing.thumbnail);
    
    await listing.populate('seller', 'company email');

    res.status(201).json(listing);
  } catch (error: any) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check ownership
    if (listing.seller.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update your own listings' });
    }

    // Update allowed fields
    const {
      title,
      material,
      category,
      quantityTons,
      location,
      coords,
      pricePerTon,
      certifications,
      availableFrom,
      expiresOn,
      pickupRequirements,
      documents,
      thumbnail,
    } = req.body;

    if (title) listing.title = title;
    if (material) listing.material = material;
    if (category) listing.category = category;
    if (quantityTons !== undefined) listing.quantityTons = quantityTons;
    if (location) listing.location = location;
    if (coords) listing.coords = coords;
    if (pricePerTon !== undefined) listing.pricePerTon = pricePerTon;
    if (certifications) listing.certifications = certifications;
    if (availableFrom) listing.availableFrom = new Date(availableFrom);
    if (expiresOn) listing.expiresOn = new Date(expiresOn);
    if (pickupRequirements !== undefined) listing.pickupRequirements = pickupRequirements;
    if (documents) listing.documents = documents;
    if (thumbnail !== undefined) listing.thumbnail = thumbnail;

    await listing.save();
    await listing.populate('seller', 'company email');

    res.json(listing);
  } catch (error: any) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check ownership
    if (listing.seller.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own listings' });
    }

    // Check if listing has active bids or transactions
    // In a real app, you might want to check for associated bids/transactions
    // For now, we'll allow deletion

    await Listing.findByIdAndDelete(id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error: any) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

