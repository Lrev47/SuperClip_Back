import { Server } from 'http';

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables first
config();

// Import app after environment variables are loaded
import { app } from './app';

// Initialize Prisma client
export const prisma = new PrismaClient();

// Server configuration
const PORT = process.env['PORT'] ?? 3000;

// Start the server
const server: Server = app.listen(PORT, () => {
  console.warn(`Server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  
  // Graceful shutdown
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  void (async (): Promise<void> => {
    await prisma.$disconnect();
    console.warn('Server shut down gracefully');
    process.exit(0);
  })();
}); 