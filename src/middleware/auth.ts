import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError, HttpStatus } from '../utils/error';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token from the Authorization header
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Authentication required. Please provide a valid token.'
      );
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Authentication token is missing'
      );
    }
    
    // Verify token
    const decoded = await verifyToken(token);
    
    // Attach user to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    
    next();
  } catch (error) {
    next(error);
  }
};