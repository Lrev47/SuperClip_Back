import cors from 'cors';
import express, { Request, Response, json } from 'express';
import morgan from 'morgan';

import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(json({ limit: '10kb' })); // Limit JSON body size
app.use(morgan('dev'));

// Routes

// Health check route
app.get('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'ok', message: 'SuperClip API is running' });
});

// Handle undefined routes - must be after all routes
app.all('*', notFoundHandler);

// Global error handling middleware - must be last
app.use(errorHandler);

// Export app for server.ts
export { app }; 