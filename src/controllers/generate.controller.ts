import { Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';
import { 
  NotFoundError, 
  UnauthorizedError, 
  BadRequestError,
  AppError 
} from '../utils/errors.util';
import { asyncHandler } from '../middleware/error.middleware';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a prompt using OpenAI
 */
export const generatePrompt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { input, categoryId } = req.body;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!input) {
    throw new BadRequestError('Input is required for prompt generation');
  }

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new AppError('OpenAI API key is not configured', 500);
  }

  // Check if category exists and belongs to the user
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId
      }
    });

    if (!category) {
      throw new NotFoundError('Category not found or does not belong to the user');
    }
  }

  // Generate prompt using OpenAI
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant that generates high-quality prompts." },
      { role: "user", content: input }
    ],
    model: "gpt-3.5-turbo",
  });

  const generatedContent = completion.choices[0]?.message?.content || 'No content generated';

  // Create a title from the first line or first few words
  let title = generatedContent.split('\n')[0].trim();
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }

  // Create the prompt in the database if categoryId is provided
  let savedPrompt = null;
  if (categoryId) {
    savedPrompt = await prisma.prompt.create({
      data: {
        title,
        content: generatedContent,
        description: `Generated from: ${input}`,
        categoryId,
        userId
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      generatedPrompt: generatedContent,
      savedPrompt: savedPrompt
    }
  });
}); 