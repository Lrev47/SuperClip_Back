import { Response } from 'express';
import { prisma } from '../index';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { 
  NotFoundError, 
  UnauthorizedError, 
  BadRequestError 
} from '../utils/errors.util';
import { asyncHandler } from '../middleware/error.middleware';

// Create a type for the Prisma transaction client
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Create a new prompt
 */
export const createPrompt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content, description, categoryId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!title || !content || !categoryId) {
    throw new BadRequestError('Title, content, and categoryId are required');
  }

  // Use transaction to ensure data consistency
  const prompt = await prisma.$transaction(async (tx: TransactionClient) => {
    // Check if category exists and belongs to the user
    const category = await tx.category.findFirst({
      where: {
        id: categoryId,
        userId
      }
    });

    if (!category) {
      throw new NotFoundError('Category not found or does not belong to the user');
    }

    // Create the prompt
    return await tx.prompt.create({
      data: {
        title,
        content,
        description,
        categoryId,
        userId
      }
    });
  });

  res.status(201).json({
    status: 'success',
    data: {
      prompt
    }
  });
});

/**
 * Get all prompts for the authenticated user
 */
export const getAllPrompts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { categoryId, page = '1', limit = '10', sortBy = 'updatedAt', order = 'desc' } = req.query;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // Parse pagination parameters
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  
  if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
    throw new BadRequestError('Invalid pagination parameters');
  }

  // Construct where clause based on query params
  const whereClause: any = { userId };
  
  // Add category filter if provided
  if (categoryId) {
    whereClause.categoryId = categoryId as string;
  }

  // Ensure the sortBy field is valid
  const validSortFields = ['title', 'createdAt', 'updatedAt'];
  if (!validSortFields.includes(sortBy as string)) {
    throw new BadRequestError(`Invalid sort field. Valid options are: ${validSortFields.join(', ')}`);
  }

  // Ensure the order is valid
  const validOrderOptions = ['asc', 'desc'];
  if (!validOrderOptions.includes(order as string)) {
    throw new BadRequestError(`Invalid order option. Valid options are: ${validOrderOptions.join(', ')}`);
  }

  // Get total count for pagination
  const total = await prisma.prompt.count({
    where: whereClause
  });

  // Get prompts with pagination and sorting
  const prompts = await prisma.prompt.findMany({
    where: whereClause,
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      [sortBy as string]: order
    },
    skip: (pageNum - 1) * limitNum,
    take: limitNum
  });

  // Return with pagination metadata
  res.status(200).json({
    status: 'success',
    results: prompts.length,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    },
    data: {
      prompts
    }
  });
});

/**
 * Get a specific prompt by ID
 */
export const getPromptById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // Find the prompt
  const prompt = await prisma.prompt.findFirst({
    where: {
      id,
      userId
    },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!prompt) {
    throw new NotFoundError('Prompt not found');
  }

  res.status(200).json({
    status: 'success',
    data: {
      prompt
    }
  });
});

/**
 * Update a prompt
 */
export const updatePrompt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, description, categoryId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // Use transaction for consistency
  const updatedPrompt = await prisma.$transaction(async (tx: TransactionClient) => {
    // Check if prompt exists and belongs to the user
    const existingPrompt = await tx.prompt.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingPrompt) {
      throw new NotFoundError('Prompt not found or does not belong to the user');
    }

    // If category is being updated, verify it exists and belongs to the user
    if (categoryId && categoryId !== existingPrompt.categoryId) {
      const category = await tx.category.findFirst({
        where: {
          id: categoryId,
          userId
        }
      });

      if (!category) {
        throw new NotFoundError('Category not found or does not belong to the user');
      }
    }

    // Update the prompt
    return await tx.prompt.update({
      where: { id },
      data: {
        title,
        content,
        description,
        categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  });

  res.status(200).json({
    status: 'success',
    data: {
      prompt: updatedPrompt
    }
  });
});

/**
 * Delete a prompt
 */
export const deletePrompt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // Check if prompt exists and belongs to the user
  const existingPrompt = await prisma.prompt.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingPrompt) {
    throw new NotFoundError('Prompt not found or does not belong to the user');
  }

  // Delete the prompt
  await prisma.prompt.delete({
    where: { id }
  });

  res.status(200).json({
    status: 'success',
    message: 'Prompt deleted successfully'
  });
}); 