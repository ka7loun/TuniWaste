import express from 'express';
import { getUsers } from '../controllers/userController.js';

const router = express.Router();

// Test endpoint to view all users (for development only!)
router.get('/users', getUsers);

export default router;

