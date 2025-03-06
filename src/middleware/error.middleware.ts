import { Request, Response, NextFunction } from 'express';
// Update the import to correctly access Prisma error classes
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { AppError, DatabaseError } from '../utils/errors.util';

// Define a more specific type for Prisma errors
type PrismaError = 
  | PrismaClientKnownRequestError 
  | PrismaClientValidationError 
  | Error;

// Handle Prisma database errors and convert them to our AppError format
const handlePrismaError = (error: PrismaError): AppError => {
  // Handle known Prisma request errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return new DatabaseError(
          `Duplicate field value: ${error.meta?.target}`,
          error.code
        );
      case 'P2025': // Record not found
        return new DatabaseError(
          'Record not found in the database',
          error.code
        );
      case 'P2003': // Foreign key constraint failed
        return new DatabaseError(
          'Related record not found',
          error.code
        );
      default:
        return new DatabaseError(
          `Database error: ${error.message}`,
          error.code
        );
    }
  }
  
  // Handle Prisma validation errors
  if (error instanceof PrismaClientValidationError) {
    return new DatabaseError(
      'Database validation error',
      'VALIDATION_ERROR'
    );
  }
  
  return new DatabaseError('Unexpected database error');
};

// Format error for development environment (with full details)
const sendDevError = (err: AppError, req: Request, res: Response): Response => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
    code: err.code,
    details: 'details' in err ? err.details : undefined
  });
};

// Format error for production environment (minimal details)
const sendProdError = (err: AppError, req: Request, res: Response): Response => {
  // Operational, trusted errors: send detailed message to client
  if (err.isOperational) {
    interface ErrorResponse {
      status: string;
      message: string;
      details?: unknown;
    }
    
    const response: ErrorResponse = {
      status: err.status,
      message: err.message
    };
    
    // Include validation details if available
    if ('details' in err && err.details) {
      response.details = err.details;
    }
    
    return res.status(err.statusCode).json(response);
  }
  
  // Programming or unknown errors: don't leak error details
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

// Main error handling middleware
export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let error = err instanceof AppError 
    ? err 
    : new AppError(err.message || 'Something went wrong', 500, false);

  // Check if error is from Prisma and convert it
  if (
    err instanceof PrismaClientKnownRequestError || 
    err instanceof PrismaClientValidationError
  ) {
    error = handlePrismaError(err);
  }

  // Send appropriate error response based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    sendProdError(error, req, res);
  } else {
    sendDevError(error, req, res);
  }
};

// Middleware to handle 404 errors for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
  next(error);
};

// Async handler to avoid try-catch blocks in controllers
// Define a more specific type for the controller function
type ControllerFunction = (
  req: Request | any, 
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: ControllerFunction) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 