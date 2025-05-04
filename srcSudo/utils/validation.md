# validation.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This utility file provides a comprehensive data validation system for the application. It encapsulates validation logic for request data, external API responses, and internal data structures, ensuring that data meets defined schemas and constraints before processing.

## Dependencies
- External packages:
  - zod (for schema validation)
  - express (for request validation middleware)
- Internal modules:
  - ./errorHandler (for throwing validation errors)
  - ../types/validation (for validation type definitions)

## Inputs/Outputs
- **Input**: Data objects, validation schemas, request objects
- **Output**: Validated data or validation errors

## Data Types
```typescript
import { z } from 'zod';
import { Request } from 'express';

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Validation error type
export interface ValidationError {
  path: string;
  message: string;
}

// Validation options
export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
}

// Validation source in requests
export enum ValidationSource {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
  HEADERS = 'headers',
  COOKIES = 'cookies',
}

// Validation middleware options
export interface ValidateRequestOptions {
  source?: ValidationSource;
  options?: ValidationOptions;
}
```

## API/Methods
### validate
- Description: Generic validation function for any data against a Zod schema
- Signature: `validate<T>(schema: z.ZodType<T>, data: unknown, options?: ValidationOptions): ValidationResult<T>`
- Parameters:
  - schema: Zod schema to validate against
  - data: Data to be validated
  - options: Optional validation configuration
- Returns: Validation result with success flag, validated data or errors
- Usage: `const result = validate(userSchema, userData)`

### validateRequest
- Description: Express middleware for validating request data
- Signature: `validateRequest<T>(schema: z.ZodType<T>, options?: ValidateRequestOptions): RequestHandler`
- Parameters:
  - schema: Zod schema to validate against
  - options: Validation options including source and configuration
- Returns: Express middleware function
- Usage: `router.post('/users', validateRequest(createUserSchema), createUserController)`

### validateBody
- Description: Shorthand middleware for validating request body
- Signature: `validateBody<T>(schema: z.ZodType<T>, options?: ValidationOptions): RequestHandler`
- Parameters:
  - schema: Zod schema for body validation
  - options: Optional validation configuration
- Returns: Express middleware function
- Usage: `router.post('/users', validateBody(createUserSchema), createUserController)`

### validateQuery
- Description: Shorthand middleware for validating request query parameters
- Signature: `validateQuery<T>(schema: z.ZodType<T>, options?: ValidationOptions): RequestHandler`
- Parameters:
  - schema: Zod schema for query validation
  - options: Optional validation configuration
- Returns: Express middleware function
- Usage: `router.get('/users', validateQuery(userQuerySchema), getUsersController)`

### validateParams
- Description: Shorthand middleware for validating URL parameters
- Signature: `validateParams<T>(schema: z.ZodType<T>, options?: ValidationOptions): RequestHandler`
- Parameters:
  - schema: Zod schema for params validation
  - options: Optional validation configuration
- Returns: Express middleware function
- Usage: `router.get('/users/:id', validateParams(userIdSchema), getUserController)`

### formatZodError
- Description: Converts Zod error output to a standardized format
- Signature: `formatZodError(error: z.ZodError): ValidationError[]`
- Parameters:
  - error: Zod error object
- Returns: Array of formatted validation errors
- Usage: `const formattedErrors = formatZodError(zodError)`

### sanitizeData
- Description: Removes sensitive fields from data based on schema
- Signature: `sanitizeData<T>(data: T, sensitiveFields: string[]): Partial<T>`
- Parameters:
  - data: Data object to sanitize
  - sensitiveFields: Array of field names to remove
- Returns: Sanitized data object
- Usage: `const safeUserData = sanitizeData(userData, ['password', 'secret'])`

## Test Specifications
### Unit Tests
- Should validate correct data successfully
- Should reject invalid data with proper error messages
- Should respect validation options (abortEarly, stripUnknown)
- Should correctly format Zod errors
- Should properly sanitize sensitive data
- Should handle nested object validation

### Integration Tests
- Should work correctly as Express middleware
- Should validate request bodies, queries and parameters
- Should pass validated data to next middleware
- Should return appropriate HTTP error responses for invalid data
- Should maintain proper request flow for valid data

## Implementation Notes
1. **Performance Considerations**:
   - Cache compiled schemas when possible
   - Use appropriate Zod refinements only when necessary
   - Consider the cost of validation for large payloads

2. **Security Aspects**:
   - Always validate user input before processing
   - Use strict type checking to prevent type coercion vulnerabilities
   - Include validation for all endpoints, especially for privileged operations

3. **Best Practices**:
   - Create reusable schema components for common validation patterns
   - Keep validation logic separate from business logic
   - Use descriptive error messages to help API users
   - Consider internationalization of error messages

4. **Edge Cases**:
   - Handle partial validations for PATCH operations
   - Account for array validation and limits
   - Consider validation of file uploads and binary data
   - Handle date/time validation with timezone awareness

## Related Files
- src/schemas/ (directory containing all Zod schemas)
- src/middleware/validation.middleware.ts
- src/types/validation.ts
- src/controllers/ (using validation middleware)
