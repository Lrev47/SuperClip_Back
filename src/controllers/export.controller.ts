import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';
import { 
  NotFoundError, 
  UnauthorizedError, 
  BadRequestError 
} from '../utils/errors.util';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Interface for Prompt with included Category
 */
interface PromptWithCategory {
  id: string;
  title: string;
  content: string;
  description: string | null;
  categoryId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    name: string;
  };
}

/**
 * Export prompts to CSV
 */
export const exportToCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { categoryId } = req.query;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // Construct where clause based on query params
  const whereClause: any = { userId };
  
  // Add category filter if provided
  if (categoryId) {
    whereClause.categoryId = categoryId as string;
  }

  // Fetch prompts with categories
  const prompts = await prisma.prompt.findMany({
    where: whereClause,
    include: {
      category: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }) as PromptWithCategory[];

  if (prompts.length === 0) {
    throw new NotFoundError('No prompts found to export');
  }

  // Generate CSV content
  const csvHeader = 'Title,Content,Description,Category,Created At,Updated At\n';
  const csvRows = prompts.map((prompt: PromptWithCategory) => {
    const title = prompt.title.replace(/"/g, '""');
    const content = prompt.content.replace(/"/g, '""');
    const description = prompt.description ? prompt.description.replace(/"/g, '""') : '';
    const category = prompt.category.name.replace(/"/g, '""');
    const createdAt = new Date(prompt.createdAt).toISOString();
    const updatedAt = new Date(prompt.updatedAt).toISOString();
    
    return `"${title}","${content}","${description}","${category}","${createdAt}","${updatedAt}"`;
  });
  
  const csvContent = csvHeader + csvRows.join('\n');

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=prompts_export_${Date.now()}.csv`);
  
  // Send CSV content
  res.status(200).send(csvContent);
}); 