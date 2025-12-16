import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from './auth.middleware.js';

/**
 * Middleware to check if user is an admin
 * Must be used after authenticateToken middleware
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.userRole !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
};

/**
 * Combined middleware: authenticate + require admin
 */
export const authenticateAdmin = [
  authenticateToken,
  requireAdmin,
];
