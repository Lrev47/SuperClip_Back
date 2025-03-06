import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth.routes';
import promptRoutes from './routes/prompt.routes';
import categoryRoutes from './routes/category.routes';
import searchRoutes from './routes/search.routes';
import exportRoutes from './routes/export.routes';
import generateRoutes from './routes/generate.routes';

// Import error handlers
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit JSON body size
app.use(morgan('dev'));

// Security headers - we could add helmet here for additional security

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/generate-prompt', generateRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SuperClip API is running' });
});

// Handle undefined routes - must be after all routes
app.all('*', notFoundHandler);

// Global error handling middleware - must be last
app.use(errorHandler);

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  
  // Graceful shutdown
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Server shut down gracefully');
  process.exit(0);
}); 