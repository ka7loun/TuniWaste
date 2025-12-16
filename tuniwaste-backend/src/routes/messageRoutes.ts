import express from 'express';
import {
  getThreads,
  getThreadMessages,
  createThread,
  sendMessage,
  markMessageAsRead,
  markThreadAsRead,
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/threads', authenticateToken, getThreads);
router.get('/threads/:threadId', authenticateToken, getThreadMessages);
router.post('/threads', authenticateToken, createThread);
router.post('/', authenticateToken, sendMessage);
router.put('/:id/read', authenticateToken, markMessageAsRead);
router.put('/threads/:threadId/read', authenticateToken, markThreadAsRead);

export default router;

