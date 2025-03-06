import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Get JWT configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d';

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Generate a JWT token for a user
 */
export const generateToken = (payload: TokenPayload): string => {
  // Use as any to avoid type issues while still including expiration
  return jwt.sign(
    payload, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRATION } as any
  );
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}; 