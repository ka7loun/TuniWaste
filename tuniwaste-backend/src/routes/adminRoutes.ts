import express from 'express';
import {
  getDashboardStats,
  getActivityTimeline,
  getAnalytics,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllListings,
  deleteListing,
  getAllTransactions,
} from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Dashboard & Analytics
router.get('/dashboard/stats', authenticateAdmin, getDashboardStats);
router.get('/dashboard/activity', authenticateAdmin, getActivityTimeline);
router.get('/dashboard/analytics', authenticateAdmin, getAnalytics);

// User Management
router.get('/users', authenticateAdmin, getAllUsers);
router.get('/users/:id', authenticateAdmin, getUserById);
router.put('/users/:id', authenticateAdmin, updateUser);
router.delete('/users/:id', authenticateAdmin, deleteUser);

// Listing Management
router.get('/listings', authenticateAdmin, getAllListings);
router.delete('/listings/:id', authenticateAdmin, deleteListing);

// Transaction Management
router.get('/transactions', authenticateAdmin, getAllTransactions);

export default router;
