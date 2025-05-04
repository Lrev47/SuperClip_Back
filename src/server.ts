import http from 'http';
import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

// Set up port from environment or use default
const PORT = parseInt(process.env.PORT || '3000', 10);

// Create HTTP server
const server = http.createServer(app);

// Start the server
server.listen(PORT, (): void => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown function
export const shutDown = (exitCode = 0): void => {
  console.log('Closing HTTP server...');
  if (server && server.close && typeof server.close === 'function') {
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(exitCode);
    });
  } else {
    console.log('HTTP server not available or already closed');
    process.exit(exitCode);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(error.name, error.message);
  console.error(error.stack);

  // Graceful shutdown with error code
  shutDown(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error.name, error.message);
  console.error(error.stack);

  // Exit with error code
  process.exit(1);
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Gracefully shutting down...');
  shutDown();
});

// Handle SIGINT signal (Ctrl+C)
process.on('SIGINT', () => {
  console.log('SIGINT received. Gracefully shutting down...');
  shutDown();
});

export default server;
