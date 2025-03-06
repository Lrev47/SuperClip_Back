import { Router } from 'express';
import { exportToCSV } from '../controllers/export.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes (all routes require authentication)
router.get('/csv', authenticate as any, exportToCSV as any);

export default router; 