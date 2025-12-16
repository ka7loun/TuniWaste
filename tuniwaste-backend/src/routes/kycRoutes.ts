import express from 'express';
import { submitKYC } from '../controllers/kycController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/kyc', authenticateToken, submitKYC);

export default router;

