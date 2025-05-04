# express.d.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file extends the Express namespace to provide custom type definitions for request and response objects. It adds TypeScript support for request authentication, user context, and custom properties used throughout the application.

## Dependencies
- External packages:
  - express
  - @types/express
- Internal modules:
  - ../models/interfaces/user.interface (for UserDocument type)

## Inputs/Outputs
- **Input**: None (type definitions only)
- **Output**: TypeScript declaration file extending Express types

## Data Types
```typescript
import { User } from '@prisma/client';
import { IUserWithSubscription } from '../models/interfaces/user.interface';

declare global {
  namespace Express {
    // Extend Request interface
    interface Request {
      // Authentication properties
      user?: IUserWithSubscription;
      userId?: string;
      deviceId?: string;
      
      // Subscription info
      hasActiveSubscription?: boolean;
      
      // Request context
      requestId?: string;
      startTime?: number;
      
      // Pagination parameters (parsed from query)
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
      
      // Parsed query filters
      filters?: Record<string, any>;
      
      // File uploads
      uploadedFiles?: Array<{
        fieldname: string;
        filename: string;
        encoding: string;
        mimetype: string;
        path: string;
        size: number;
      }>;
    }

    // Extend Response interface if needed
    interface Response {
      // Custom response methods
      sendSuccess?: (data: any, message?: string) => Response;
      sendError?: (error: any, statusCode?: number) => Response;
    }
  }
}
```

## API/Methods
N/A - This is a declaration file with no runtime code.

## Test Specifications
N/A - TypeScript declaration files cannot be tested directly, but their usage can be validated through TypeScript compilation.

## Implementation Notes
1. **Type Safety**:
   - Ensure all custom properties added to request/response are properly typed
   - Use interfaces from Prisma-generated types for database entities
   - Make all custom properties optional with `?` to maintain compatibility

2. **Authentication**:
   - Type the `user` property to match the format returned by authentication middleware
   - Include relevant subscription information for access control
   - Include deviceId for multi-device sync features

3. **Maintenance Considerations**:
   - Keep synchronized with actual middleware implementations
   - Update when new request/response properties are added
   - Document purpose of each extension

## Related Files
- src/middleware/auth.middleware.ts
- src/middleware/subscription.middleware.ts
- src/models/interfaces/user.interface.ts
- src/utils/async-handler.ts
