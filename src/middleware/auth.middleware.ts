import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.util';

/**
 * Express Request with User interface
 * This extends the Express Request interface to include user information
 * for authenticated requests
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

/**
 * Middleware to protect routes that require authentication
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required. Please provide a valid token.');
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const payload = verifyToken(token);
    if (!payload) {
      throw new UnauthorizedError('Invalid or expired token. Please login again.');
    }

    // Set the user in the request object
    req.user = {
      userId: payload.userId,
      email: payload.email
    };

    // Proceed to the protected route
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware for role-based access control
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      
      if (req.user.role && !roles.includes(req.user.role)) {
        throw new ForbiddenError('You do not have permission to perform this action');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}; 