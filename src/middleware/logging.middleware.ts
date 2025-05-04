import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as logger from '../utils/logger';

// Extend Request interface for TypeScript
export interface RequestWithId extends Request {
  requestId?: string;
  startTime?: number;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  error?: Error;
}

/**
 * Middleware that assigns a unique ID to each request and logs request details
 */
export const requestLogger = (req: RequestWithId, res: Response, next: NextFunction): void => {
  // Generate a unique request ID
  req.requestId = uuidv4();

  // Record start time for performance tracking
  req.startTime = Date.now();

  // Log when the response finishes
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || 0);

    // Extract relevant request information
    const logData = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      duration: `${duration}ms`,
      // Include user ID if available but avoid logging sensitive data
      userId: req.user?.id,
    };

    // Log request completion with appropriate level based on status code
    const message = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duration}ms`;
    logger.info(message, logData);
  });

  next();
};

/**
 * Redact sensitive data from logs
 */
const redactSensitiveData = (data: any): any => {
  if (!data) return data;

  if (typeof data === 'object' && !Array.isArray(data)) {
    const redacted = { ...data };
    // List of sensitive fields to redact
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard', 'ssn'];

    Object.keys(redacted).forEach(key => {
      // Redact sensitive fields
      if (sensitiveFields.includes(key)) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        // Recursively redact nested objects
        redacted[key] = redactSensitiveData(redacted[key]);
      }
    });

    return redacted;
  }

  return data;
};

/**
 * Middleware that logs errors before they're handled by error middleware
 */
export const errorLogger = (req: RequestWithId, res: Response, next: NextFunction): void => {
  // Extract the error if attached to the request
  const { error } = req;

  if (error) {
    // Log the error with appropriate context
    logger.error(error.message, {
      error,
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
      // Include request body with sensitive data redacted
      body: redactSensitiveData(req.body),
    });
  }

  // Pass the error along to the next error handler
  next(error);
};
