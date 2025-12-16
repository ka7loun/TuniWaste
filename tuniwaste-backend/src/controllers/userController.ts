import { Request, Response } from 'express';
import User from '../models/User.js';

// This is a test endpoint to verify users in the database
// Remove or protect this in production!
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-passwordHash'); // Exclude password hash
    res.json({ count: users.length, users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

