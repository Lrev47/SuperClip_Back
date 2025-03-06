import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes
router.post('/register', register as any);
router.post('/login', login as any);
router.get('/me', authenticate as any, getMe as any);

export default router; 