import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

// Middleware to check if user is employer
export const employerOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { user } = req;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Employer role required'
    });
  }

  next();
};

// Middleware to check if user is job seeker
export const seekerOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { user } = req;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (user.role !== 'seeker') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Job seeker role required'
    });
  }

  next();
};