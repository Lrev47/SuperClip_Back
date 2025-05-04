# folder.service.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the folder service for the SuperClip application, handling all business logic related to folder management. It provides functionality for creating, retrieving, updating, and deleting folders, as well as managing folder hierarchies, permissions, and the organization of clips within folders. The service supports folder sharing, moving, and nested folder structures.

## Dependencies
- External packages:
  - @prisma/client
  - date-fns
  - slugify
- Internal modules:
  - ../repositories/folder.repository.ts
  - ../repositories/clip.repository.ts
  - ../repositories/user.repository.ts
  - ../utils/logger.ts
  - ../utils/error.ts
  - ../models/interfaces/folder.interface.ts
  - ../models/interfaces/clip.interface.ts
  - ../config/folder.config.ts

## Inputs/Outputs
- **Input**: Folder creation/update data, user context, folder IDs, query parameters, permissions settings
- **Output**: Folder data, folder hierarchies, operation results, permission statuses

## API/Methods
```typescript
import { FolderRepository } from '../repositories/folder.repository';
import { ClipRepository } from '../repositories/clip.repository';
import { UserRepository } from '../repositories/user.repository';
import { Logger } from '../utils/logger';
import { AppError, ErrorCode } from '../utils/error';
import { folderConfig } from '../config/folder.config';
import { 
  Folder,
  Clip,
  User,
  FolderPermission,
  Prisma
} from '@prisma/client';
import { 
  FolderCreateData,
  FolderUpdateData,
  FolderWithContents,
  FolderHierarchy,
  FolderPermissionData,
  FolderStats,
  FolderQueryOptions,
  FolderSortOption,
  FolderPermissionLevel
} from '../models/interfaces/folder.interface';
import { ClipWithMeta } from '../models/interfaces/clip.interface';
import { format } from 'date-fns';
import slugify from 'slugify';

export class FolderService {
  private folderRepository: FolderRepository;
  private clipRepository: ClipRepository;
  private userRepository: UserRepository;
  private logger: Logger;

  constructor(
    folderRepository: FolderRepository,
    clipRepository: ClipRepository,
    userRepository: UserRepository,
    logger: Logger
  ) {
    this.folderRepository = folderRepository;
    this.clipRepository = clipRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * Create a new folder
   * @param userId User ID
   * @param folderData Folder creation data
   * @returns Created folder
   */
  async createFolder(
    userId: string,
    folderData: FolderCreateData
  ): Promise<Folder> {
    // Implementation
  }

  /**
   * Get folder by ID
   * @param folderId Folder ID
   * @param userId User ID requesting the folder
   * @returns Folder with contents if user has access
   */
  async getFolderById(
    folderId: string,
    userId: string
  ): Promise<FolderWithContents> {
    // Implementation
  }

  /**
   * Get all root folders for a user
   * @param userId User ID
   * @param options Query options for filtering and pagination
   * @returns List of root folders with pagination
   */
  async getUserRootFolders(
    userId: string,
    options?: FolderQueryOptions
  ): Promise<{
    folders: Folder[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Get all folders for a user
   * @param userId User ID
   * @param options Query options for filtering and pagination
   * @returns List of all accessible folders with pagination
   */
  async getUserFolders(
    userId: string,
    options?: FolderQueryOptions
  ): Promise<{
    folders: Folder[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Get folder hierarchy for a user
   * @param userId User ID
   * @param rootFolderId Optional root folder ID to start hierarchy from
   * @returns Folder hierarchy structure
   */
  async getFolderHierarchy(
    userId: string,
    rootFolderId?: string
  ): Promise<FolderHierarchy[]> {
    // Implementation
  }

  /**
   * Update folder information
   * @param folderId Folder ID to update
   * @param userId User ID making the update
   * @param updateData Folder update data
   * @returns Updated folder
   */
  async updateFolder(
    folderId: string,
    userId: string,
    updateData: FolderUpdateData
  ): Promise<Folder> {
    // Implementation
  }

  /**
   * Delete a folder
   * @param folderId Folder ID to delete
   * @param userId User ID making the deletion
   * @param options Options like force delete and handling of contents
   * @returns Operation result
   */
  async deleteFolder(
    folderId: string,
    userId: string,
    options?: { 
      forceDelete?: boolean;
      moveContentsToParent?: boolean;
    }
  ): Promise<{ success: boolean; message: string }> {
    // Implementation
  }

  /**
   * Move a folder to a new parent
   * @param folderId Folder ID to move
   * @param targetParentId Target parent folder ID
   * @param userId User ID making the move
   * @returns Updated folder
   */
  async moveFolder(
    folderId: string,
    targetParentId: string | null,
    userId: string
  ): Promise<Folder> {
    // Implementation
  }

  /**
   * Add clips to a folder
   * @param folderId Folder ID
   * @param clipIds Clip IDs to add
   * @param userId User ID performing the operation
   * @returns Updated folder with contents
   */
  async addClipsToFolder(
    folderId: string,
    clipIds: string[],
    userId: string
  ): Promise<FolderWithContents> {
    // Implementation
  }

  /**
   * Remove clips from a folder
   * @param folderId Folder ID
   * @param clipIds Clip IDs to remove
   * @param userId User ID performing the operation
   * @returns Updated folder with contents
   */
  async removeClipsFromFolder(
    folderId: string,
    clipIds: string[],
    userId: string
  ): Promise<FolderWithContents> {
    // Implementation
  }

  /**
   * Share a folder with another user
   * @param folderId Folder ID to share
   * @param ownerId Owner user ID
   * @param targetUserId User ID to share with
   * @param permissionLevel Permission level to grant
   * @returns Created or updated permission
   */
  async shareFolder(
    folderId: string,
    ownerId: string,
    targetUserId: string,
    permissionLevel: FolderPermissionLevel
  ): Promise<FolderPermission> {
    // Implementation
  }

  /**
   * Update folder sharing permissions
   * @param folderId Folder ID
   * @param ownerId Owner user ID
   * @param permissionData Permission update data
   * @returns Updated permission
   */
  async updateFolderPermission(
    folderId: string,
    ownerId: string,
    permissionData: FolderPermissionData
  ): Promise<FolderPermission> {
    // Implementation
  }

  /**
   * Remove folder sharing for a user
   * @param folderId Folder ID
   * @param ownerId Owner user ID
   * @param targetUserId User ID to remove sharing for
   * @returns Operation result
   */
  async removeFolderSharing(
    folderId: string,
    ownerId: string,
    targetUserId: string
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Get all shared folders for a user
   * @param userId User ID
   * @param options Query options
   * @returns List of shared folders with pagination
   */
  async getSharedFolders(
    userId: string,
    options?: FolderQueryOptions
  ): Promise<{
    folders: Folder[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Check if user has access to a folder
   * @param folderId Folder ID
   * @param userId User ID
   * @param requiredLevel Required permission level
   * @returns Whether user has sufficient access
   */
  async checkFolderAccess(
    folderId: string,
    userId: string,
    requiredLevel: FolderPermissionLevel = 'READ'
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Get folder permissions
   * @param folderId Folder ID
   * @param ownerId Owner user ID
   * @returns List of folder permissions
   */
  async getFolderPermissions(
    folderId: string,
    ownerId: string
  ): Promise<FolderPermission[]> {
    // Implementation
  }

  /**
   * Get folder statistics
   * @param folderId Folder ID
   * @param userId User ID
   * @returns Folder statistics
   */
  async getFolderStats(
    folderId: string,
    userId: string
  ): Promise<FolderStats> {
    // Implementation
  }

  /**
   * Search for folders
   * @param userId User ID
   * @param searchTerm Search term
   * @param options Query options
   * @returns Search results with pagination
   */
  async searchFolders(
    userId: string,
    searchTerm: string,
    options?: FolderQueryOptions
  ): Promise<{
    folders: Folder[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Duplicate a folder and its contents
   * @param folderId Folder ID to duplicate
   * @param userId User ID
   * @param options Duplication options
   * @returns Duplicated folder
   */
  async duplicateFolder(
    folderId: string,
    userId: string,
    options?: {
      newName?: string;
      duplicateClips?: boolean;
      targetParentId?: string | null;
      includeShares?: boolean;
    }
  ): Promise<Folder> {
    // Implementation
  }

  /**
   * Generate folder name slug
   * @param name Folder name
   * @returns Slugified name
   */
  private generateFolderSlug(name: string): string {
    // Implementation
  }

  /**
   * Verify folder ownership or required access level
   * @param folderId Folder ID
   * @param userId User ID
   * @param requiredLevel Required permission level
   * @returns Whether user has sufficient access
   */
  private async verifyFolderAccess(
    folderId: string,
    userId: string,
    requiredLevel: FolderPermissionLevel
  ): Promise<boolean> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new folder with valid data
- Should create a nested folder under a parent folder
- Should get folder by ID for owner
- Should get folder by ID for user with access
- Should deny access to folder for user without permission
- Should get user's root folders
- Should get all folders for a user
- Should get folder hierarchy
- Should update folder information
- Should handle folder name updates and slug generation
- Should delete an empty folder
- Should move a folder to a new parent
- Should add clips to a folder
- Should remove clips from a folder
- Should share a folder with another user
- Should update folder sharing permissions
- Should remove folder sharing for a user
- Should get shared folders for a user
- Should check folder access correctly for different permission levels
- Should get folder permissions
- Should get folder statistics
- Should search for folders by name and description
- Should duplicate a folder with its structure
- Should handle concurrent folder operations
- Should enforce folder nesting limits
- Should generate valid folder slugs
- Should verify folder access correctly

### Integration Tests
- Should maintain proper folder hierarchies
- Should maintain correct folder-clip relationships
- Should enforce proper authorization for folder operations
- Should handle folder sharing across multiple users
- Should correctly implement cascading permissions
- Should maintain referential integrity during delete operations
- Should properly handle folder moves within hierarchy
- Should enforce unique folder names within the same parent
- Should handle folder duplication with contents
- Should correctly implement folder search functionality
- Should maintain folder statistics accurately
- Should handle folders with large numbers of clips
- Should handle deeply nested folder structures

## Implementation Notes
1. **Folder Structure Management**:
   - Implement proper handling of parent-child relationships
   - Support nested folder structures up to a configurable depth
   - Ensure folder operations maintain hierarchy integrity
   - Implement efficient queries for traversing folder trees
   - Support moving folders between different levels
   - Handle circular reference prevention

2. **Permission Management**:
   - Implement granular permission levels (read, write, admin)
   - Support inherited permissions through folder hierarchy
   - Ensure proper access control for all folder operations
   - Support both direct and inherited permissions
   - Implement permission propagation for batch operations
   - Handle permission conflicts and resolution

3. **Performance Considerations**:
   - Optimize folder tree traversal for deep hierarchies
   - Implement efficient queries for folder contents
   - Use pagination for large folder listings
   - Implement caching for frequently accessed folders
   - Optimize bulk operations on folders and clips
   - Consider indexing strategies for folder searches

4. **Folder Sharing**:
   - Support sharing folders with specific users
   - Implement notification mechanisms for shared folders
   - Support permission management for shared folders
   - Handle cross-user folder visibility
   - Implement access tracking for shared folders
   - Support unsharing and permission revocation

5. **Error Handling**:
   - Handle folder not found scenarios
   - Manage permission denied situations gracefully
   - Handle concurrent modification conflicts
   - Implement validation for folder names and structures
   - Provide clear error messages for client applications
   - Handle edge cases in folder tree manipulations

6. **Folder Operations**:
   - Support bulk operations for efficiency
   - Implement folder duplication with configurable options
   - Support archiving instead of permanent deletion
   - Implement folder statistics calculation
   - Support folder metadata management
   - Implement folder sorting and filtering options

## Related Files
- src/models/interfaces/folder.interface.ts
- src/repositories/folder.repository.ts
- src/repositories/clip.repository.ts
- src/controllers/folder.controller.ts
- src/middleware/folder-access.middleware.ts
- src/config/folder.config.ts
- src/routes/folder.routes.ts
- src/services/clip.service.ts
- src/models/interfaces/clip.interface.ts
