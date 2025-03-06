// Define custom error class that extends the built-in Error class
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: string; // For database-specific error codes

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.code = code;

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes for common error types
export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden action') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  details?: any;
  
  constructor(message = 'Validation failed', details?: any) {
    super(message, 400);
    this.details = details;
  }
}

// Database-specific errors
export class DatabaseError extends AppError {
  constructor(message = 'Database error', code?: string) {
    super(message, 500, true, code);
  }
} 