# auth.middleware.ts

- [x] Test file made
- [x] File made
- [x] File passed the tests

## Purpose

Authentication middleware for securing API routes. Validates user authentication tokens, sets user information on the request object, and blocks unauthorized access to protected resources.

## Dependencies

- jsonwebtoken
- express
- Custom types/interfaces
- User service/repository

## Inputs/Outputs

- **Input**: HTTP request with Authorization header containing JWT token
- **Output**: Modified request object with authenticated user information or error response

## Data Types

```typescript
interface DecodedToken {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// Extend Express Request type to include user
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: UserRole;
    };
  }
}
```

## API/Methods

### authenticate

- Description: Middleware that validates JWT from Authorization header
- Signature: `authenticate(req: Request, res: Response, next: NextFunction): void`
- Parameters:
  - req: Express Request object
  - res: Express Response object
  - next: Express NextFunction for middleware chain
- Returns: Calls next() if authentication succeeds
- Throws: 401 Unauthorized if token is missing/invalid, 403 Forbidden if token expired

### authorize

- Description: Middleware that checks if user has required role
- Signature: `authorize(roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void`
- Parameters:
  - roles: Array of roles allowed to access the route
- Returns: Middleware function that allows or rejects based on user role
- Throws: 403 Forbidden if user doesn't have required role

## Test Specifications

### Unit Tests

- Should extract token from Authorization header
- Should validate token signature using secret key
- Should set user object on request for valid token
- Should reject expired tokens with 403
- Should reject malformed tokens with 401
- Should reject requests without Authorization header with 401
- Should support different role-based authorization levels

### Integration Tests

- Should authorize valid users to access protected routes
- Should reject unauthorized users from protected routes
- Should allow role-specific access to admin routes

## Implementation Notes

1. **Token Handling**:

   - Use Authorization header with Bearer scheme
   - Validate token signature using JWT_SECRET from environment variables
   - Check token expiration for security

2. **Role-Based Access Control**:

   - Support multiple roles (USER, ADMIN)
   - Provide flexible authorization middleware for different route requirements
   - Allow route-specific role requirements

3. **Edge Cases/Error Handling**:
   - Handle missing/malformed tokens gracefully
   - Provide clear error messages without exposing sensitive details
   - Log authentication failures for security monitoring

## Related Files

- user.model.ts
- user.service.ts
- app.ts
