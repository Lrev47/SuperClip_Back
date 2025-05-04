# common.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines common TypeScript types, interfaces, and utility types used throughout the application. It provides reusable type definitions that are not specific to any particular module and helps maintain consistency in the codebase.

## Dependencies
- External packages: None
- Internal modules: None

## Inputs/Outputs
- **Input**: None (type definitions only)
- **Output**: Exported TypeScript types and interfaces

## Data Types
```typescript
// Reusable pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
}

// Request filtering types
export interface FilterParams {
  [key: string]: any;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type PickPartial<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

// Sync-related types
export interface SyncOperation {
  entityType: 'clip' | 'folder' | 'tag' | 'set' | 'template';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: Date;
  deviceId: string;
  data?: any;
}

// Custom error codes
export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED'
}
```

## API/Methods
N/A - This is a type definitions file with no runtime code.

## Test Specifications
N/A - TypeScript type definitions cannot be tested directly, but their usage can be validated through TypeScript compilation.

## Implementation Notes
1. **Type Reusability**:
   - Design types to be reusable across different modules
   - Focus on common patterns that appear throughout the application
   - Use generics where appropriate for flexibility

2. **Type Safety**:
   - Provide specific types for all properties where possible
   - Use union types for properties with enumerated values
   - Use utility types to derive related types (e.g., Partial, Pick)

3. **Documentation**:
   - Document complex types with comments
   - Include examples of usage for utility types
   - Group related types together

## Related Files
- src/controllers/*.ts (for API response handling)
- src/middleware/validation.middleware.ts
- src/services/sync.service.ts
- src/utils/error.ts
