# user.interface.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines interfaces for the User entity in the application. It provides TypeScript types for user data as returned from the database, with additional application-specific properties and relationships.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules: None

## Inputs/Outputs
- **Input**: None (type definitions only)
- **Output**: TypeScript interfaces for user-related data structures

## Data Types
```typescript
import { User, Clip, Folder, Tag, ClipboardSet, PromptTemplate, Device } from '@prisma/client';

// Basic user interface (extends the Prisma model)
export interface IUser extends User {
  // Basic user attributes defined in Prisma schema
  id: string;
  email: string;
  password: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// User with subscription details
export interface IUserWithSubscription extends IUser {
  subscription?: {
    id: string;
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
    currentPeriodEnd: Date;
    customerId: string;
    priceId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  isSubscriptionActive: boolean;
}

// User with full relationship data
export interface IUserWithRelations extends IUser {
  clips?: Clip[];
  folders?: Folder[];
  tags?: Tag[];
  clipboardSets?: ClipboardSet[];
  promptTemplates?: PromptTemplate[];
  devices?: Device[];
}

// User with stats
export interface IUserWithStats extends IUser {
  stats: {
    totalClips: number;
    totalFolders: number;
    totalTags: number;
    totalSets: number;
    totalDevices: number;
    storageUsed: number; // in bytes
    lastActivity: Date | null;
  };
}

// Secure user (for sending to client)
export interface ISecureUser {
  id: string;
  email: string;
  name: string | null;
  isSubscriptionActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## API/Methods
N/A - This is an interface definition file with no runtime code.

## Test Specifications
N/A - TypeScript interfaces cannot be tested directly, but their usage can be validated through TypeScript compilation.

## Implementation Notes
1. **Security Considerations**:
   - Never expose the password field when sending user data to clients
   - Use the ISecureUser interface for responses to ensure sensitive data is excluded

2. **Usage Patterns**:
   - IUser: Basic user information without relationships
   - IUserWithSubscription: For access control and subscription features
   - IUserWithRelations: For operations requiring related user data
   - IUserWithStats: For user dashboard and analytics
   - ISecureUser: For API responses to the client

3. **Maintenance Considerations**:
   - Keep interfaces in sync with the Prisma schema
   - Update when new user properties or relationships are added
   - Consider using Prisma's generated types as base (e.g., User from @prisma/client)

## Related Files
- src/services/user.service.ts
- src/controllers/user.controller.ts
- src/middleware/auth.middleware.ts
- src/types/express.d.ts (for Request.user type)
