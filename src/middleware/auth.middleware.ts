import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// User role enum
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// Type for decoded JWT token
interface DecodedToken {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Extend Express Request type to include user
interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Middleware that validates JWT from Authorization header
 */
export const authenticate = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  // Check if Authorization header exists
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  // Check token format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token format',
    });
    return;
  }

  const token = parts[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as DecodedToken;

    // Set user info on request object
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Token has expired',
      });
      return;
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
    return;
  }
};

/**
 * Middleware that checks if user has required role
 */
export const authorize = (roles: UserRole[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
      return;
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};
