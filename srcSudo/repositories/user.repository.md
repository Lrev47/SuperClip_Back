# user.repository.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the repository pattern for User entity operations, providing an abstraction layer for user-related database interactions. It handles the creation, retrieval, updating, and deletion of users, as well as user authentication and profile management.

## Dependencies
- External packages:
  - @prisma/client
  - bcrypt
- Internal modules:
  - ../models/interfaces/user.interface.ts
  - ../utils/error.ts
  - ../utils/pagination.ts

## Inputs/Outputs
- **Input**: User data, query parameters, user IDs, authentication credentials
- **Output**: User objects, authentication results, paginated results, success/failure responses

## API/Methods
```typescript
import { PrismaClient, User, Prisma } from '@prisma/client';
import { IUser, IUserWithProfile, IUserWithStats } from '../models/interfaces/user.interface';
import { PaginatedResult, PaginationOptions } from '../utils/pagination';
import * as bcrypt from 'bcrypt';

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new user
   * @param userData User data to create
   * @returns Created user
   */
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    // Implementation
  }

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<IUser | null> {
    // Implementation
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<IUser | null> {
    // Implementation
  }

  /**
   * Find a user with profile information
   * @param id User ID
   * @returns User with profile or null if not found
   */
  async findWithProfile(id: string): Promise<IUserWithProfile | null> {
    // Implementation
  }

  /**
   * Find a user with usage statistics
   * @param id User ID
   * @returns User with stats or null if not found
   */
  async findWithStats(id: string): Promise<IUserWithStats | null> {
    // Implementation
  }

  /**
   * Find all users
   * @param options Pagination and filter options
   * @returns Paginated user results
   */
  async findAll(
    options?: {
      pagination?: PaginationOptions;
      search?: string;
      role?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResult<IUser>> {
    // Implementation
  }

  /**
   * Update a user
   * @param id User ID
   * @param userData Data to update
   * @returns Updated user
   */
  async update(
    id: string,
    userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<IUser> {
    // Implementation
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Deleted user
   */
  async delete(id: string): Promise<IUser> {
    // Implementation
  }

  /**
   * Validate user credentials
   * @param email User email
   * @param password Password to validate
   * @returns User if credentials are valid, null otherwise
   */
  async validateCredentials(email: string, password: string): Promise<IUser | null> {
    // Implementation
  }

  /**
   * Change user password
   * @param id User ID
   * @param currentPassword Current password for verification
   * @param newPassword New password to set
   * @returns Updated user
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<IUser> {
    // Implementation
  }

  /**
   * Update user profile
   * @param id User ID
   * @param profileData Profile data to update
   * @returns Updated user with profile
   */
  async updateProfile(
    id: string,
    profileData: Partial<Omit<Prisma.ProfileUpdateInput, 'user'>>
  ): Promise<IUserWithProfile> {
    // Implementation
  }

  /**
   * Verify email address
   * @param token Verification token
   * @returns User with verified email
   */
  async verifyEmail(token: string): Promise<IUser | null> {
    // Implementation
  }

  /**
   * Create password reset token
   * @param email User email
   * @returns Reset token or null if user not found
   */
  async createPasswordResetToken(email: string): Promise<string | null> {
    // Implementation
  }

  /**
   * Reset password with token
   * @param token Reset token
   * @param newPassword New password
   * @returns User with updated password or null if token invalid
   */
  async resetPassword(token: string, newPassword: string): Promise<IUser | null> {
    // Implementation
  }

  /**
   * Count user's items (clips, folders, etc.)
   * @param id User ID
   * @returns Object with counts
   */
  async countItems(id: string): Promise<{
    clips: number;
    folders: number;
    templates: number;
    tags: number;
    devices: number;
  }> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new user
- Should find a user by ID
- Should find a user by email
- Should find a user with profile
- Should find a user with stats
- Should find all users with pagination and filters
- Should update a user
- Should delete a user
- Should validate user credentials correctly
- Should change user password
- Should update user profile
- Should verify email with valid token
- Should create password reset token
- Should reset password with valid token
- Should count user's items correctly

### Integration Tests
- Should handle CRUD operations on users
- Should properly hash and validate passwords
- Should handle email verification flow
- Should handle password reset flow
- Should manage relations with other entities (clips, folders, etc.)
- Should enforce unique constraints on email
- Should maintain referential integrity when deleting users

## Implementation Notes
1. **Data Access Logic**:
   - Implement proper data fetching strategies to minimize N+1 query problems
   - Use transactions for operations that modify multiple tables
   - Ensure proper handling of relations between users and other entities

2. **Security Considerations**:
   - Hash passwords using bcrypt with appropriate salt rounds
   - Never return password hashes in query results
   - Implement rate limiting for sensitive operations (login, password reset)
   - Generate secure tokens for email verification and password reset
   - Set appropriate expiration times for tokens

3. **Authentication**:
   - Validate email formats and password complexity
   - Implement secure password comparison
   - Handle login attempts tracking for security
   - Properly manage user sessions

4. **Performance Considerations**:
   - Cache frequently accessed user data
   - Use pagination for user listings
   - Optimize queries that join multiple tables
   - Use appropriate indexes for email and other frequently queried fields

5. **Error Handling**:
   - Provide clear error messages for validation failures
   - Handle duplicate email conflicts appropriately
   - Implement proper not found error handling

## Related Files
- src/models/interfaces/user.interface.ts
- src/services/user.service.ts
- src/services/auth.service.ts
- src/controllers/user.controller.ts
- src/controllers/auth.controller.ts
- src/repositories/profile.repository.ts
