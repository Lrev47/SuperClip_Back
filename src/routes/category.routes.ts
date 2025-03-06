import { Router } from 'express';
import { createCategory, getAllCategories, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes (all routes require authentication)
router.post('/', authenticate as any, createCategory as any);
router.get('/', authenticate as any, getAllCategories as any);
router.put('/:id', authenticate as any, updateCategory as any);
router.delete('/:id', authenticate as any, deleteCategory as any);

export default router; 