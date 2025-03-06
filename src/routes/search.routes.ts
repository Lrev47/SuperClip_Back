import { Router } from 'express';
import { searchPrompts } from '../controllers/search.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes (all routes require authentication)
router.get('/', authenticate as any, searchPrompts as any);

export default router; 