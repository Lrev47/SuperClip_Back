# error.middleware.ts

- [x] Test file made
- [x] File made
- [x] File passed the tests

## Purpose

Global error handling middleware that catches unhandled errors throughout the application, formats them into consistent responses, and provides appropriate HTTP status codes to clients.

## Dependencies

- express
- Custom error classes
- Logger utility

## Inputs/Outputs

- **Input**: Error object thrown anywhere in the application
- **Output**: Formatted HTTP error response with consistent structure

## Data Types

```typescript
// Custom error classes
class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends ApiError {
  errors: Record<string, string[]>;
  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 400);
    this.errors = errors;
  }
}

// Error response format
interface ErrorResponse {
  error: string;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}
```

## API/Methods

### errorHandler

- Description: Global error handling middleware that catches unhandled errors
- Signature: `errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void`
- Parameters:
  - err: Error object thrown in previous middleware or route handlers
  - req: Express Request object
  - res: Express Response object
  - next: Express NextFunction (not typically used in error handlers)
- Returns: Sends error response with appropriate status code

### notFoundHandler

- Description: Middleware that handles 404 (Not Found) errors for undefined routes
- Signature: `notFoundHandler(req: Request, res: Response): void`
- Parameters:
  - req: Express Request object
  - res: Express Response object
- Returns: Sends 404 response with route information

## Test Specifications

### Unit Tests

- Should format errors with consistent structure
- Should set appropriate HTTP status codes for different error types
- Should include validation errors when provided
- Should handle generic errors with 500 status code
- Should omit stack traces in production environment
- Should capture 404 errors for undefined routes

### Integration Tests

- Should catch errors thrown from route handlers
- Should catch errors thrown from other middleware
- Should return JSON format for API errors
- Should maintain original status code for ApiError instances
- Should respond with 404 for non-existent routes

## Implementation Notes

1. **Error Classification**:

   - Custom error classes for different error types
   - Consistent error response structure
   - Status code mapping for common error scenarios

2. **Environment-Specific Behavior**:

   - Include stack traces only in development environment
   - More detailed messages in development, generic messages in production
   - Logging behavior differs by environment

3. **Security Considerations**:
   - Avoid exposing sensitive information in error responses
   - Sanitize error messages to prevent information disclosure
   - Log detailed error information for debugging without exposing to clients

## Related Files

- app.ts
- logger.util.ts
- custom-errors.ts
