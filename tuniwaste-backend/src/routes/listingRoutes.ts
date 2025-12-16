import express from 'express';
import {
  getListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
} from '../controllers/listingController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (with auth for filtering)
router.get('/', authenticateToken, getListings);
router.get('/my', authenticateToken, getMyListings);
router.get('/:id', authenticateToken, getListingById);

// Protected routes (seller only)
router.post('/', authenticateToken, createListing);
router.put('/:id', authenticateToken, updateListing);
router.delete('/:id', authenticateToken, deleteListing);

export default router;

