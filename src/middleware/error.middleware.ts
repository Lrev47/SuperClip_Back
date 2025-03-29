import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Interface for validation error objects
 */
interface IValidationErrorItem {
  msg: string;
  param: string;
  location: string;
}

/**
 * Interface for validation errors
 */
interface IValidationError {
  errors: IValidationErrorItem[];
  name: string;
}

/**
 * Interface for Prisma unique constraint errors
 */
interface IPrismaUniqueConstraintError {
  code: string;
  meta: {
    target: Record<string, unknown>;
  };
}

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
};

/**
 * Handle validation errors from express-validator
 */
const handleValidationError = (err: IValidationError): AppError => {
  const message = `Validation error: ${err.errors.map((e) => e.msg).join(', ')}`;
  return new AppError(message, 400);
};

/**
 * Handle Prisma unique constraint errors
 */
const handlePrismaUniqueConstraintError = (err: IPrismaUniqueConstraintError): AppError => {
  const field = Object.keys(err.meta.target)[0];
  const message = `Duplicate field value: ${field}. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = (): AppError => 
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError => 
  new AppError('Your token has expired! Please log in again.', 401);

/**
 * Development error response - with detailed error info
 */
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Production error response - with limited error info
 */
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

// Type guard to check if error is a validation error
const isValidationError = (err: unknown): err is IValidationError => {
  return typeof err === 'object' && 
         err !== null && 
         'errors' in err && 
         Array.isArray((err as IValidationError).errors);
};

// Type guard to check if error is a Prisma unique constraint error
const isPrismaUniqueConstraintError = (err: unknown): err is IPrismaUniqueConstraintError => {
  return typeof err === 'object' && 
         err !== null && 
         'code' in err && 
         (err as IPrismaUniqueConstraintError).code === 'P2002' &&
         'meta' in err &&
         typeof (err as IPrismaUniqueConstraintError).meta === 'object' &&
         'target' in (err as IPrismaUniqueConstraintError).meta;
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = Object.assign(new AppError(err.message, 500), err);

  // Handle specific error types
  if (isValidationError(err)) {
    error = handleValidationError(err);
  }
  if (isPrismaUniqueConstraintError(err)) {
    error = handlePrismaUniqueConstraintError(err);
  }
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send different error responses based on environment
  if (process.env['NODE_ENV'] === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
}; 