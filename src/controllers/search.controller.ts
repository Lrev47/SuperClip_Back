import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';
import { 
  UnauthorizedError, 
  BadRequestError 
} from '../utils/errors.util';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Search prompts by query string
 */
export const searchPrompts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { query } = req.query;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!query || typeof query !== 'string') {
    throw new BadRequestError('Search query is required');
  }

  // Search prompts by title, content, or description
  const prompts = await prisma.prompt.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  res.status(200).json({
    status: 'success',
    results: prompts.length,
    data: { prompts }
  });
}); 