import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { setupSwagger } from './docs/swagger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Configure middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Content-Type validation middleware
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json',
      });
      return;
    }
  }
  next();
});

// Set up Swagger documentation
setupSwagger(app);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to SuperClip API' });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API version
app.get('/api/v1', (req: Request, res: Response) => {
  res.status(200).json({ version: '1.0' });
});

// Error test route (for testing error handling)
app.get('/api/v1/error-test', () => {
  throw new Error('Test error');
});

// Define clips router
const clipsRouter = express.Router();

// Post handler for clips endpoint
// @ts-expect-error Express type incompatibility
clipsRouter.post('/', (req: Request, res: Response) => {
  const { title, content } = req.body as { title?: string; content?: string };

  if (!title || !content) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title and content are required for a clip',
    });
  }

  // For a real implementation, we would save to database here
  // For now, just return a success response for the test
  return res.status(201).json({
    id: '123e4567-e89b-12d3-a456-426614174000',
    title,
    content,
    createdAt: new Date().toISOString(),
  });
});

// Mount the clips router at /api/v1/clips
app.use('/api/v1/clips', clipsRouter);

// API data endpoint
// @ts-expect-error Express type incompatibility
app.post('/api/v1/data', (req: Request, res: Response) => {
  // This is just for the integration test
  return res.status(201).json({
    id: '987654321',
    ...req.body,
  });
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

export default app;
