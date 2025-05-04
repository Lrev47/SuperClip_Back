import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error class
 */
export class AppError extends Error {
  statusCode: number;

  isOperational: boolean;

  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle 404 errors for routes that don't exist
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

/**
 * Global error handler
 */
export const errorHandler = (
  err: Error & { statusCode?: number; isOperational?: boolean; errors?: Record<string, string[]> },
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log error
  console.error('ERROR 💥', err);

  // Default status code is 500 Internal Server Error
  const statusCode = err.statusCode || 500;

  const errorResponse: {
    error: string;
    message: string;
    stack?: string;
    errors?: Record<string, string[]>;
  } = {
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  };

  // Add stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  // Add validation errors if they exist
  if (err.errors) {
    errorResponse.errors = err.errors;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};
