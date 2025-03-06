import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';
import { 
  NotFoundError, 
  UnauthorizedError, 
  BadRequestError, 
  ConflictError 
} from '../utils/errors.util';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Interface for Category with children included
 */
interface CategoryWithChildren {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  children: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  }[];
}

/**
 * Create a new category
 */
export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, icon, color, parentId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // If parent category is specified, check if it exists and belongs to the user
  if (parentId) {
    const parentCategory = await prisma.category.findFirst({
      where: {
        id: parentId,
        userId
      }
    });

    if (!parentCategory) {
      throw new NotFoundError('Parent category not found or does not belong to the user');
    }
  }

  const category = await prisma.category.create({
    data: {
      name,
      icon,
      color,
      parentId,
      userId
    }
  });

  res.status(201).json({
    status: 'success',
    data: { category }
  });
});

/**
 * Get all categories for the authenticated user
 */
export const getAllCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // Get all categories
  const categories = await prisma.category.findMany({
    where: {
      userId
    },
    include: {
      children: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Organize into a tree structure with root categories and their children
  const rootCategories = categories.filter((category: CategoryWithChildren) => !category.parentId);
  
  res.status(200).json(rootCategories);
});

/**
 * Update a category
 */
export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, icon, color, parentId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // Check if category exists and belongs to the user
  const existingCategory = await prisma.category.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingCategory) {
    throw new NotFoundError('Category not found or does not belong to the user');
  }

  // If parent category is being changed, verify it exists and belongs to the user
  if (parentId && parentId !== existingCategory.parentId) {
    // Prevent setting a category as its own parent
    if (parentId === id) {
      throw new BadRequestError('Category cannot be its own parent');
    }

    // Prevent circular references
    let currentParent = parentId;
    while (currentParent) {
      const parent = await prisma.category.findUnique({
        where: { id: currentParent }
      });
      
      if (!parent) break;
      
      if (parent.id === id) {
        throw new ConflictError('Creating a circular reference is not allowed');
      }
      
      currentParent = parent.parentId;
    }

    // Verify parent exists and belongs to user
    const parentCategory = await prisma.category.findFirst({
      where: {
        id: parentId,
        userId
      }
    });

    if (!parentCategory) {
      throw new NotFoundError('Parent category not found or does not belong to the user');
    }
  }

  // Update the category
  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name,
      icon,
      color,
      parentId
    }
  });

  res.status(200).json(updatedCategory);
});

/**
 * Delete a category
 */
export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // Check if category exists and belongs to the user
  const existingCategory = await prisma.category.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingCategory) {
    throw new NotFoundError('Category not found or does not belong to the user');
  }

  // Delete the category (and all associated prompts due to onDelete: Cascade)
  await prisma.category.delete({
    where: { id }
  });

  res.status(200).json({ message: 'Category deleted successfully' });
}); 