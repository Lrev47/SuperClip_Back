import { Router } from 'express';
import { generatePrompt } from '../controllers/generate.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes (all routes require authentication)
router.post('/', authenticate as any, generatePrompt as any);

export default router; 