import express from 'express';
import {
  getBidsByListing,
  getMyBids,
  placeBid,
  acceptBid,
  declineBid,
} from '../controllers/bidController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/listing/:listingId', authenticateToken, getBidsByListing);
router.get('/my', authenticateToken, getMyBids);
router.post('/', authenticateToken, placeBid);
router.put('/:id/accept', authenticateToken, acceptBid);
router.put('/:id/decline', authenticateToken, declineBid);

export default router;

