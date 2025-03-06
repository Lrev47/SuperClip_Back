import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../index';
import { generateToken } from '../utils/jwt.util';
import { AuthRequest } from '../middleware/auth.middleware';
import { 
  BadRequestError, 
  UnauthorizedError, 
  NotFoundError, 
  ConflictError 
} from '../utils/errors.util';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash the password
  const salt = await bcrypt.genSalt(12); // Increased from 10 for better security
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create the user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  // Return user info and token (without the password)
  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    }
  });
});

/**
 * Login a user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  // Return user info and token (without the password)
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    }
  });
});

/**
 * Get authenticated user details
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Return user info (without the password)
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  });
}); 