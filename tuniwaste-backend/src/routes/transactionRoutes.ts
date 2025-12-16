import express from 'express';
import {
  getTransactions,
  getTransactionById,
  updateTransactionStage,
  addTransactionDocument,
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getTransactions);
router.get('/:id', authenticateToken, getTransactionById);
router.put('/:id/stage', authenticateToken, updateTransactionStage);
router.post('/:id/documents', authenticateToken, addTransactionDocument);

export default router;

