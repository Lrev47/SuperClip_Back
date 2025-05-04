# async-handler.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This utility file provides a wrapper function for handling asynchronous Express route handlers. It eliminates the need for try/catch blocks in every controller by automatically catching errors and passing them to Express's error handling middleware.

## Dependencies
- External packages:
  - express
- Internal modules:
  - ../types/common

## Inputs/Outputs
- **Input**: An asynchronous Express request handler function
- **Output**: A wrapped function that handles promise rejections

## Data Types
```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Type definition for async route handler
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

// Return type of the wrapper function
type AsyncHandlerReturn = RequestHandler;
```

## API/Methods
### asyncHandler
- Description: Wraps an async Express route handler to automatically catch errors
- Signature: `asyncHandler(fn: AsyncRequestHandler): AsyncHandlerReturn`
- Parameters:
  - fn: The async function to wrap
- Returns: A function compatible with Express middleware/route handlers
- Throws: Nothing directly (passes caught errors to Express next() function)

## Test Specifications
### Unit Tests
- Should pass the request, response, and next function to the handler
- Should call next with the error when the handler throws
- Should work with both async and regular functions
- Should preserve the this context of the original function

### Integration Tests
- Should correctly propagate errors to error middleware
- Should allow normal execution flow when no errors occur

## Implementation Notes
1. **Error Handling Logic**:
   - Catch any errors thrown by the async function
   - Pass caught errors to Express's next() function for centralized error handling
   - Preserve the original stack trace for better debugging

2. **Best Practices**:
   - Use TypeScript to ensure type safety
   - Keep the implementation simple and focused
   - Consider adding an optional error transformation function parameter

3. **Edge Cases**:
   - Handle rejections without error objects
   - Consider timeouts for long-running operations
   - Handle errors thrown in the next tick

## Related Files
- src/controllers/*.ts (where this utility will be used)
- src/middleware/error.middleware.ts
- src/utils/error.ts
- src/types/common.ts
