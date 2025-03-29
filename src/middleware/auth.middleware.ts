import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../server';

/**
 * Interface for authenticated request with user data
 */
interface IAuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

/**
 * Interface for JWT payload with user ID
 */
interface IJwtPayload {
  id: string;
  [key: string]: unknown;
}

/**
 * Type guard to check if a value is a valid JWT payload with ID
 */
function isValidPayload(payload: unknown): payload is IJwtPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    typeof payload.id === 'string' &&
    payload.id !== ''
  );
}

/**
 * Authentication middleware that verifies JWT tokens
 */
export function authenticate(
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // 1. Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    // 2. Validate Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid authentication format. Use Bearer token.',
      });
      return;
    }

    // 3. Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Empty token provided',
      });
      return;
    }

    // 4. Get JWT secret from environment variables
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      res.status(500).json({
        status: 'error',
        message: 'Server authentication configuration error',
      });
      return;
    }

    try {
      // 5. Verify token
      const payload = jwt.verify(token, jwtSecret);

      // 6. Validate payload structure
      if (!isValidPayload(payload)) {
        res.status(401).json({
          status: 'error',
          message: 'Invalid token format',
        });
        return;
      }

      // 7. Start the process of validating the user
      void verifyUserAndProceed(payload.id, req, res, next);
    } catch (tokenError) {
      // Handle specific JWT errors
      if (tokenError instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          status: 'error',
          message: 'Token has expired. Please log in again.',
        });
        return;
      }
      
      if (tokenError instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          status: 'error',
          message: 'Invalid token. Please log in again.',
        });
        return;
      }
      
      // For other token errors
      res.status(401).json({
        status: 'error',
        message: 'Authentication failed',
      });
      return;
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Verifies that a user exists and proceeds with the request
 */
async function verifyUserAndProceed(
  userId: string,
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'User no longer exists',
      });
      return;
    }
    
    // Set user info on request object
    req.user = { id: user.id };
    
    // Proceed to the next middleware
    next();
  } catch (error) {
    next(error);
  }
} 