import { Router } from 'express';
import { createPrompt, getAllPrompts, getPromptById, updatePrompt, deletePrompt } from '../controllers/prompt.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes (all routes require authentication)
router.post('/', authenticate as any, createPrompt as any);
router.get('/', authenticate as any, getAllPrompts as any);
router.get('/:id', authenticate as any, getPromptById as any);
router.put('/:id', authenticate as any, updatePrompt as any);
router.delete('/:id', authenticate as any, deletePrompt as any);

export default router; 