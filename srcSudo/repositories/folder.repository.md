# folder.repository.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the repository pattern for Folder entity operations, providing an abstraction layer for folder-related database interactions. It handles the creation, retrieval, updating, and deletion of folders, as well as folder hierarchy management and associated clip operations.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules:
  - ../models/interfaces/folder.interface.ts
  - ../utils/pagination.ts
  - ../utils/error.ts

## Inputs/Outputs
- **Input**: Folder data, query parameters, folder IDs, user IDs
- **Output**: Folder objects, paginated results, hierarchical folder structures, success/failure responses

## API/Methods
```typescript
import { PrismaClient, Folder, Prisma } from '@prisma/client';
import { IFolder, IFolderWithStats, IFolderHierarchy, IFolderWithRelations } from '../models/interfaces/folder.interface';
import { PaginatedResult, PaginationOptions } from '../utils/pagination';

export class FolderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new folder
   * @param folderData Folder data to create
   * @returns Created folder
   */
  async create(folderData: {
    name: string;
    userId: string;
    parentId?: string | null;
    description?: string;
    color?: string;
    icon?: string;
    isDefault?: boolean;
  }): Promise<IFolder> {
    // Implementation
  }

  /**
   * Find a folder by ID
   * @param id Folder ID
   * @param userId Optional user ID for permission check
   * @returns Folder or null if not found
   */
  async findById(id: string, userId?: string): Promise<IFolder | null> {
    // Implementation
  }

  /**
   * Find a folder with all its relationships
   * @param id Folder ID
   * @param userId Optional user ID for permission check
   * @returns Folder with relationships or null if not found
   */
  async findWithRelations(id: string, userId?: string): Promise<IFolderWithRelations | null> {
    // Implementation
  }

  /**
   * Find all folders for a user
   * @param options Query options
   * @returns Paginated folder results
   */
  async findAll(options: {
    userId: string;
    pagination?: PaginationOptions;
    search?: string;
    parentId?: string | null;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<IFolder>> {
    // Implementation
  }

  /**
   * Get folder hierarchy for a user
   * @param userId User ID
   * @returns Hierarchical folder structure
   */
  async getHierarchy(userId: string): Promise<IFolderHierarchy[]> {
    // Implementation
  }

  /**
   * Update a folder
   * @param id Folder ID
   * @param folderData Data to update
   * @param userId User ID for permission check
   * @returns Updated folder
   */
  async update(
    id: string,
    folderData: Partial<{
      name: string;
      parentId: string | null;
      description: string;
      color: string;
      icon: string;
      isDefault: boolean;
    }>,
    userId: string
  ): Promise<IFolder> {
    // Implementation
  }

  /**
   * Delete a folder
   * @param id Folder ID
   * @param userId User ID for permission check
   * @param options Delete options
   * @returns Deleted folder
   */
  async delete(
    id: string, 
    userId: string, 
    options?: { deleteClips?: boolean }
  ): Promise<IFolder> {
    // Implementation
  }

  /**
   * Get folder statistics
   * @param id Folder ID
   * @param userId User ID for permission check
   * @returns Folder with statistics
   */
  async getStats(id: string, userId: string): Promise<IFolderWithStats> {
    // Implementation
  }

  /**
   * Move clips to a folder
   * @param folderId Destination folder ID
   * @param clipIds Clip IDs to move
   * @param userId User ID for permission check
   * @returns Number of moved clips
   */
  async moveClips(folderId: string | null, clipIds: string[], userId: string): Promise<number> {
    // Implementation
  }

  /**
   * Get root folders for a user
   * @param userId User ID
   * @returns Array of root folders
   */
  async getRootFolders(userId: string): Promise<IFolder[]> {
    // Implementation
  }

  /**
   * Get child folders for a parent folder
   * @param parentId Parent folder ID
   * @param userId User ID for permission check
   * @returns Array of child folders
   */
  async getChildFolders(parentId: string, userId: string): Promise<IFolder[]> {
    // Implementation
  }

  /**
   * Check if user has access to folder
   * @param folderId Folder ID
   * @param userId User ID
   * @returns Boolean indicating access
   */
  async hasAccess(folderId: string, userId: string): Promise<boolean> {
    // Implementation
  }

  /**
   * Set default folder for a user
   * @param folderId Folder ID to set as default
   * @param userId User ID
   * @returns Updated folder
   */
  async setDefault(folderId: string, userId: string): Promise<IFolder> {
    // Implementation
  }

  /**
   * Get default folder for a user
   * @param userId User ID
   * @returns Default folder or null
   */
  async getDefault(userId: string): Promise<IFolder | null> {
    // Implementation
  }

  /**
   * Get total folder count
   * @param userId User ID
   * @returns Number of folders
   */
  async count(userId: string): Promise<number> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new folder
- Should find a folder by ID
- Should find a folder with all relationships
- Should find all folders with pagination and filters
- Should get folder hierarchy for a user
- Should update a folder
- Should delete a folder
- Should get folder statistics
- Should move clips to a folder
- Should get root folders for a user
- Should get child folders for a parent folder
- Should check if user has access to folder
- Should set default folder for a user
- Should get default folder for a user
- Should count folders correctly

### Integration Tests
- Should handle CRUD operations on folders
- Should properly manage folder hierarchy
- Should enforce proper user relationships
- Should maintain referential integrity with clips
- Should handle recursive operations on folder trees
- Should correctly maintain default folder settings
- Should handle concurrent operations on the same folder
- Should correctly recalculate folder statistics when clips change

## Implementation Notes
1. **Data Access Logic**:
   - Implement efficient recursive queries for folder hierarchy operations
   - Use transactions for operations that modify multiple folders or clips
   - Ensure proper handling of relations between folders and clips

2. **Folder Hierarchy Management**:
   - Prevent circular references in folder hierarchy
   - Handle parent-child relationships efficiently
   - Implement proper cascading operations for folder trees
   - Limit maximum depth of folder nesting if needed

3. **Security Considerations**:
   - Always verify user ownership before operations
   - Implement proper access control for shared folders
   - Sanitize input fields to prevent injection attacks

4. **Performance Considerations**:
   - Cache folder hierarchy for frequently accessed structures
   - Use pagination for folder listings
   - Optimize queries that join folders with clips
   - Consider materializing paths for faster hierarchical queries
   - Batch operations when handling multiple folders

5. **Error Handling**:
   - Provide clear error messages for validation failures
   - Handle not found errors appropriately
   - Implement proper error handling for circular references
   - Handle permission errors consistently

6. **Default Folder Logic**:
   - Ensure each user always has a default folder
   - Maintain proper default folder state when deleting folders
   - Handle race conditions when changing default folder

## Related Files
- src/models/interfaces/folder.interface.ts
- src/services/folder.service.ts
- src/controllers/folder.controller.ts
- src/repositories/clip.repository.ts
- src/utils/pagination.ts
