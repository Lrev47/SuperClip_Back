# errorHandler.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This utility provides a centralized error handling system for the application. It defines a consistent error structure, custom error classes for different scenarios, and middleware for Express to handle errors in a standardized way. The error handler ensures proper error responses with appropriate status codes and messages while providing detailed logging for troubleshooting.

## Dependencies
- External packages:
  - express (for middleware integration)
  - http-status-codes (for standardized HTTP status codes)
- Internal modules:
  - ./logger (for error logging)
  - ../types/error (for error type definitions)

## Inputs/Outputs
- **Input**: Error objects, HTTP request/response objects
- **Output**: Formatted error responses, logged error details

## Data Types
```typescript
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

// Base application error interface
export interface AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
  details?: Record<string, any>;
}

// Error response format
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, any>;
  };
}

// Error options for creating custom errors
export interface ErrorOptions {
  message?: string;
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
  details?: Record<string, any>;
  cause?: Error;
}
```

## API/Methods
### BaseError
- Description: Base error class extending the native Error object with additional properties
- Signature: `class BaseError extends Error implements AppError`
- Properties:
  - statusCode: HTTP status code
  - code: Application-specific error code
  - isOperational: Indicates if error is operational or programming
  - details: Additional error context

### createError
- Description: Factory function to create custom error instances
- Signature: `createError(options: ErrorOptions): AppError`
- Parameters:
  - options: Configuration for the error
- Returns: Configured error instance
- Usage: `throw createError({ message: 'Resource not found', statusCode: 404 })`

### Predefined Error Classes
- BadRequestError
- NotFoundError
- UnauthorizedError
- ForbiddenError
- ConflictError
- ValidationError
- InternalServerError
- DatabaseError
- ThirdPartyServiceError

### errorHandler
- Description: Express middleware for handling errors
- Signature: `errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void`
- Parameters:
  - err: Error object
  - req: Express request
  - res: Express response
  - next: Express next function
- Returns: Sends error response to client
- Usage: `app.use(errorHandler)`

### asyncHandler
- Description: Wrapper for async route handlers to catch errors
- Signature: `asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => Promise<any>`
- Parameters:
  - fn: Async route handler function
- Returns: Wrapped function that forwards errors to next()
- Usage: `router.get('/users', asyncHandler(async (req, res) => { ... }))`

### isAppError
- Description: Type guard to check if an error is an AppError
- Signature: `isAppError(error: any): error is AppError`
- Parameters:
  - error: Any error to check
- Returns: Boolean indicating if error is an AppError
- Usage: `if (isAppError(error)) { ... }`

### formatError
- Description: Formats any error into a consistent ErrorResponse format
- Signature: `formatError(error: Error | AppError): ErrorResponse`
- Parameters:
  - error: Error to format
- Returns: Standardized error response object
- Usage: `res.status(statusCode).json(formatError(error))`

## Test Specifications
### Unit Tests
- Should create different error types with correct status codes
- Should properly extend error properties
- Should maintain stack traces
- Should convert generic errors to application errors
- Should identify operational vs programming errors
- Should format errors into consistent response objects

### Integration Tests
- Should catch and handle synchronous errors in route handlers
- Should catch and handle asynchronous errors in route handlers
- Should respond with correct status codes for different error types
- Should integrate with Express error handling middleware chain
- Should log appropriate error details based on environment

## Implementation Notes
1. **Error Classification**:
   - Operational errors: Expected errors that can be handled gracefully (e.g., validation failures)
   - Programming errors: Unexpected errors that may require fixes (e.g., null references)

2. **Security Considerations**:
   - Never expose sensitive details in production error responses
   - Sanitize error messages for potential injection attacks
   - Ensure stack traces are only logged, never sent to clients in production

3. **Performance Aspects**:
   - Minimize overhead in error creation and handling
   - Avoid unnecessary deep cloning of large error objects
   - Use efficient logging for errors

4. **Best Practices**:
   - Use descriptive error codes for easier troubleshooting
   - Include relevant context in error details
   - Maintain consistency in error formatting
   - Use type guards to safely handle different error types

5. **Edge Cases**:
   - Handle errors in the error handler itself
   - Manage circular references in error objects
   - Properly serialize errors for logging

## Related Files
- src/middleware/error.middleware.ts
- src/types/error.ts
- src/app.ts (for global error handler setup)
- Service files that throw custom errors 