# error.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This utility file provides standardized error handling mechanisms for the application. It defines custom error classes with proper status codes, creates error formatting utilities, and ensures consistent error responses across the API.

## Dependencies
- External packages: None
- Internal modules:
  - ../types/common (for ErrorCode enum)

## Inputs/Outputs
- **Input**: Error information (message, code, status, etc.)
- **Output**: Standardized error objects with consistent properties

## Data Types
```typescript
import { ErrorCode } from '../types/common';

// Base application error
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: any;
}

// HTTP error response interface
export interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    code: string;
    details?: any;
    stack?: string;
  };
}
```

## API/Methods
### createError
- Description: Factory function to create a standardized application error
- Signature: `createError(message: string, statusCode: number, code: ErrorCode, isOperational: boolean = true, details?: any): AppError`
- Parameters:
  - message: Human-readable error message
  - statusCode: HTTP status code
  - code: Application-specific error code
  - isOperational: Whether the error is an operational error (vs programming error)
  - details: Optional additional error details
- Returns: AppError instance

### formatError
- Description: Formats an error object for API response
- Signature: `formatError(err: Error | AppError): ErrorResponse`
- Parameters:
  - err: The error to format
- Returns: Standardized error response object

### isOperationalError
- Description: Checks if an error is an operational error (expected during operations)
- Signature: `isOperationalError(err: Error | AppError): boolean`
- Parameters:
  - err: The error to check
- Returns: Boolean indicating if error is operational

### HttpError classes
- BadRequestError: For invalid input (400)
- UnauthorizedError: For authentication failures (401)
- ForbiddenError: For permission issues (403)
- NotFoundError: For resource not found (404)
- ConflictError: For resource conflicts (409)
- SubscriptionRequiredError: For premium features (402)
- InternalServerError: For server errors (500)

## Test Specifications
### Unit Tests
- Should create AppError with correct properties
- Should format errors correctly for API responses
- Should identify operational errors correctly
- Each HttpError class should have the correct status code
- Should handle non-AppError types gracefully

## Implementation Notes
1. **Error Classification**:
   - Distinguish between operational errors (expected) and programmer errors (bugs)
   - Use appropriate error codes for different error types
   - Include sufficient details for client error handling

2. **Error Formatting**:
   - Remove sensitive information from error responses
   - Include stack traces only in development environment
   - Structure errors consistently for API responses

3. **Error Handling Strategy**:
   - Use operational errors for expected failure cases
   - Create specific error subclasses for common error scenarios
   - Ensure error messages are user-friendly

## Related Files
- src/middleware/error.middleware.ts
- src/types/common.ts
- src/controllers/*.ts
- src/utils/async-handler.ts
