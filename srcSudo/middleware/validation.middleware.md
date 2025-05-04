# validation.middleware.ts

- [x] Test file made
- [x] File made
- [x] File passed the tests

## Purpose

Middleware that performs validation of request data (body, query parameters, headers, path parameters) against predefined schemas. Ensures data integrity, prevents invalid data from reaching route handlers, and provides consistent validation error responses.

## Dependencies

- express
- joi (for schema validation)
- celebrate (express middleware for joi validation)
- Custom error types

## Inputs/Outputs

- **Input**: HTTP request with data to validate
- **Output**: Validated request or validation error response

## Data Types

```typescript
// Validation schema locations
enum ValidationSource {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
  HEADERS = 'headers',
  COOKIES = 'cookies',
}

// Validation options
interface ValidationOptions {
  abortEarly?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
}

// Validation error response
interface ValidationErrorResponse {
  error: string;
  message: string;
  details: {
    [key: string]: string[];
  };
}

// Validation schema type (using Joi)
type ValidationSchema = {
  [key in ValidationSource]?: joi.Schema;
};
```

## API/Methods

### validateRequest

- Description: General-purpose validation middleware that checks multiple parts of a request
- Signature: `validateRequest(schema: ValidationSchema, options?: ValidationOptions): (req: Request, res: Response, next: NextFunction) => void`
- Parameters:
  - schema: Object containing Joi schemas for different parts of the request
  - options: Optional validation configuration options
- Returns: Middleware function that validates request data
- Throws: 400 Bad Request with validation error details if validation fails

### validateBody

- Description: Specific middleware for validating request body
- Signature: `validateBody(schema: joi.Schema, options?: ValidationOptions): (req: Request, res: Response, next: NextFunction) => void`
- Parameters:
  - schema: Joi schema for request body validation
  - options: Optional validation configuration options
- Returns: Middleware function that validates request body
- Throws: 400 Bad Request with validation error details if validation fails

### validateQuery

- Description: Specific middleware for validating query parameters
- Signature: `validateQuery(schema: joi.Schema, options?: ValidationOptions): (req: Request, res: Response, next: NextFunction) => void`
- Parameters:
  - schema: Joi schema for query parameter validation
  - options: Optional validation configuration options
- Returns: Middleware function that validates query parameters
- Throws: 400 Bad Request with validation error details if validation fails

### validateParams

- Description: Specific middleware for validating route parameters
- Signature: `validateParams(schema: joi.Schema, options?: ValidationOptions): (req: Request, res: Response, next: NextFunction) => void`
- Parameters:
  - schema: Joi schema for route parameter validation
  - options: Optional validation configuration options
- Returns: Middleware function that validates route parameters
- Throws: 400 Bad Request with validation error details if validation fails

## Test Specifications

### Unit Tests

- Should validate request body against schema
- Should validate query parameters against schema
- Should validate route parameters against schema
- Should validate headers against schema
- Should validate multiple request parts simultaneously
- Should return detailed validation error messages
- Should allow configuration of validation options
- Should support custom validation rules

### Integration Tests

- Should integrate with route handlers correctly
- Should prevent invalid data from reaching controllers
- Should format error responses consistently with other error types
- Should handle different content types appropriately

## Implementation Notes

1. **Schema Organization**:

   - Create reusable schema components for common data structures
   - Group related validation schemas together
   - Version schemas alongside API versions
   - Document schemas for API consumers

2. **Validation Strategy**:

   - Configure appropriate strictness for different endpoints
   - Balance security with usability in validation rules
   - Support partial validation for PATCH operations
   - Handle schema evolution for backward compatibility

3. **Error Handling**:

   - Provide clear, user-friendly validation error messages
   - Group errors by field for easy client-side form handling
   - Include validation context to help API consumers correct issues
   - Support internationalization of error messages

4. **Performance Considerations**:
   - Optimize schema compilation and caching
   - Use appropriate validation strategies for high-traffic endpoints
   - Balance validation depth with performance requirements

## Related Files

- error.middleware.ts
- schemas/user.schema.ts
- schemas/clip.schema.ts
- controllers/user.controller.ts
