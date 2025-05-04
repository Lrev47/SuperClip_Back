# set.service.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the clip set management service for the SuperClip application. It handles the creation, organization, and sharing of clip sets, which are collections of related clips that can be manipulated as a single unit. The service provides functionality for creating, retrieving, updating, and deleting sets, as well as managing the clips within them. It supports set sharing, versioning, exporting, and collaborative editing features to enhance team workflows.

## Dependencies
- External packages:
  - @prisma/client
  - date-fns
  - uuid
  - zod (for validation)
- Internal modules:
  - ../repositories/set.repository.ts
  - ../repositories/clip.repository.ts
  - ../repositories/user.repository.ts
  - ../utils/logger.ts
  - ../utils/error.ts
  - ../models/interfaces/set.interface.ts
  - ../models/interfaces/clip.interface.ts
  - ../config/set.config.ts
  - ../services/clip.service.ts

## Inputs/Outputs
- **Input**: Set creation/update data, clip IDs, sharing permissions, query parameters, user context
- **Output**: Set objects, clip collections, operation results, shared set information

## API/Methods
```typescript
import { SetRepository } from '../repositories/set.repository';
import { ClipRepository } from '../repositories/clip.repository';
import { UserRepository } from '../repositories/user.repository';
import { ClipService } from '../services/clip.service';
import { Logger } from '../utils/logger';
import { AppError, ErrorCode } from '../utils/error';
import { SetConfig } from '../config/set.config';
import {
  Set,
  SetClip,
  SetPermission,
  SetVersion,
  User,
  Clip,
  Prisma
} from '@prisma/client';
import {
  CreateSetInput,
  UpdateSetInput,
  SetWithClips,
  SetPermissionInput,
  SetQueryOptions,
  SetSortOption,
  SetExportFormat,
  SetImportResult,
  SetClipOrder,
  SetStats,
  SetVersionInfo,
  ShareSetResult,
  SetBulkOperationResult
} from '../models/interfaces/set.interface';
import { ClipWithMeta } from '../models/interfaces/clip.interface';
import { v4 as uuidv4 } from 'uuid';
import * as dateFns from 'date-fns';
import { z } from 'zod';

export class SetService {
  private setRepository: SetRepository;
  private clipRepository: ClipRepository;
  private userRepository: UserRepository;
  private clipService: ClipService;
  private logger: Logger;
  private config: SetConfig;

  constructor(
    setRepository: SetRepository,
    clipRepository: ClipRepository,
    userRepository: UserRepository,
    clipService: ClipService,
    logger: Logger,
    config: SetConfig
  ) {
    this.setRepository = setRepository;
    this.clipRepository = clipRepository;
    this.userRepository = userRepository;
    this.clipService = clipService;
    this.logger = logger;
    this.config = config;
  }

  /**
   * Create a new set
   * @param userId User ID
   * @param setData Set creation data
   * @returns Created set with clips
   */
  async createSet(
    userId: string,
    setData: CreateSetInput
  ): Promise<SetWithClips> {
    // Implementation
  }

  /**
   * Get set by ID
   * @param setId Set ID
   * @param userId User ID requesting the set
   * @returns Set with clips if user has access
   */
  async getSetById(
    setId: string,
    userId: string
  ): Promise<SetWithClips | null> {
    // Implementation
  }

  /**
   * Get all sets for a user
   * @param userId User ID
   * @param options Query options
   * @returns List of sets with pagination
   */
  async getUserSets(
    userId: string,
    options?: SetQueryOptions
  ): Promise<{
    sets: SetWithClips[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Update set
   * @param setId Set ID
   * @param userId User ID
   * @param updateData Set update data
   * @returns Updated set
   */
  async updateSet(
    setId: string,
    userId: string,
    updateData: UpdateSetInput
  ): Promise<SetWithClips> {
    // Implementation
  }

  /**
   * Delete set
   * @param setId Set ID
   * @param userId User ID
   * @returns Success status
   */
  async deleteSet(
    setId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Add clips to set
   * @param setId Set ID
   * @param clipIds Clip IDs to add
   * @param userId User ID
   * @returns Updated set with clips
   */
  async addClipsToSet(
    setId: string,
    clipIds: string[],
    userId: string
  ): Promise<SetWithClips> {
    // Implementation
  }

  /**
   * Remove clips from set
   * @param setId Set ID
   * @param clipIds Clip IDs to remove
   * @param userId User ID
   * @returns Updated set with clips
   */
  async removeClipsFromSet(
    setId: string,
    clipIds: string[],
    userId: string
  ): Promise<SetWithClips> {
    // Implementation
  }

  /**
   * Reorder clips in set
   * @param setId Set ID
   * @param clipOrder New clip order
   * @param userId User ID
   * @returns Updated set with clips
   */
  async reorderSetClips(
    setId: string,
    clipOrder: SetClipOrder[],
    userId: string
  ): Promise<SetWithClips> {
    // Implementation
  }

  /**
   * Share set with another user
   * @param setId Set ID
   * @param ownerId Owner user ID
   * @param targetUserId User ID to share with
   * @param permission Permission level
   * @returns Share result
   */
  async shareSet(
    setId: string,
    ownerId: string,
    targetUserId: string,
    permission: SetPermissionInput
  ): Promise<ShareSetResult> {
    // Implementation
  }

  /**
   * Update set sharing permissions
   * @param setId Set ID
   * @param ownerId Owner user ID
   * @param targetUserId User ID to update permissions for
   * @param permission New permission level
   * @returns Updated permission
   */
  async updateSetPermission(
    setId: string,
    ownerId: string,
    targetUserId: string,
    permission: SetPermissionInput
  ): Promise<SetPermission> {
    // Implementation
  }

  /**
   * Remove set sharing for a user
   * @param setId Set ID
   * @param ownerId Owner user ID
   * @param targetUserId User ID to remove sharing for
   * @returns Success status
   */
  async removeSetSharing(
    setId: string,
    ownerId: string,
    targetUserId: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Get shared sets for a user
   * @param userId User ID
   * @param options Query options
   * @returns List of shared sets with pagination
   */
  async getSharedSets(
    userId: string,
    options?: SetQueryOptions
  ): Promise<{
    sets: SetWithClips[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Get set permissions
   * @param setId Set ID
   * @param ownerId Owner user ID
   * @returns List of set permissions
   */
  async getSetPermissions(
    setId: string,
    ownerId: string
  ): Promise<{
    permissions: SetPermission[];
    ownerName: string;
  }> {
    // Implementation
  }

  /**
   * Export set
   * @param setId Set ID
   * @param userId User ID
   * @param format Export format
   * @returns Export data
   */
  async exportSet(
    setId: string,
    userId: string,
    format: SetExportFormat = 'json'
  ): Promise<{
    data: any;
    format: SetExportFormat;
    filename: string;
  }> {
    // Implementation
  }

  /**
   * Import set
   * @param userId User ID
   * @param data Import data
   * @param format Import format
   * @returns Import result
   */
  async importSet(
    userId: string,
    data: any,
    format: SetExportFormat = 'json'
  ): Promise<SetImportResult> {
    // Implementation
  }

  /**
   * Clone set
   * @param setId Set ID to clone
   * @param userId User ID
   * @param options Clone options
   * @returns Cloned set
   */
  async cloneSet(
    setId: string,
    userId: string,
    options?: {
      newName?: string;
      includeClips?: boolean;
      keepReferences?: boolean;
    }
  ): Promise<SetWithClips> {
    // Implementation
  }

  /**
   * Get set version history
   * @param setId Set ID
   * @param userId User ID
   * @returns Version history
   */
  async getSetVersionHistory(
    setId: string,
    userId: string
  ): Promise<SetVersionInfo[]> {
    // Implementation
  }

  /**
   * Restore set version
   * @param setId Set ID
   * @param versionId Version ID
   * @param userId User ID
   * @returns Restored set
   */
  async restoreSetVersion(
    setId: string,
    versionId: string,
    userId: string
  ): Promise<SetWithClips> {
    // Implementation
  }

  /**
   * Create a snapshot of the current set state
   * @param setId Set ID
   * @param userId User ID
   * @param description Version description
   * @returns Created version
   */
  async createSetSnapshot(
    setId: string,
    userId: string,
    description?: string
  ): Promise<SetVersion> {
    // Implementation
  }

  /**
   * Get set statistics
   * @param userId User ID
   * @returns Set statistics
   */
  async getSetStats(
    userId: string
  ): Promise<SetStats> {
    // Implementation
  }

  /**
   * Search sets
   * @param userId User ID
   * @param searchTerm Search term
   * @param options Query options
   * @returns Search results with pagination
   */
  async searchSets(
    userId: string,
    searchTerm: string,
    options?: SetQueryOptions
  ): Promise<{
    sets: SetWithClips[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Batch operation on sets
   * @param setIds Set IDs to operate on
   * @param userId User ID
   * @param operation Operation to perform
   * @returns Operation result
   */
  async batchOperationOnSets(
    setIds: string[],
    userId: string,
    operation: 'delete' | 'archive' | 'restore'
  ): Promise<SetBulkOperationResult> {
    // Implementation
  }

  /**
   * Check if user has access to set
   * @param setId Set ID
   * @param userId User ID
   * @param requiredPermission Required permission level
   * @returns Whether user has access
   */
  private async hasSetAccess(
    setId: string,
    userId: string,
    requiredPermission: 'VIEW' | 'EDIT' | 'OWNER' = 'VIEW'
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Create a new set version
   * @param setId Set ID
   * @param userId User ID
   * @param description Version description
   * @returns Created version
   */
  private async createSetVersion(
    setId: string,
    userId: string,
    description?: string
  ): Promise<SetVersion> {
    // Implementation
  }

  /**
   * Validate clip IDs for a user
   * @param clipIds Clip IDs to validate
   * @param userId User ID
   * @returns Valid clip IDs
   */
  private async validateUserClips(
    clipIds: string[],
    userId: string
  ): Promise<string[]> {
    // Implementation
  }

  /**
   * Generate unique set identifier
   * @returns Unique set ID
   */
  private generateSetId(): string {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new set successfully
- Should retrieve set by ID
- Should get all sets for a user
- Should update set successfully
- Should delete set
- Should add clips to set
- Should remove clips from set
- Should reorder clips in set
- Should share set with another user
- Should update set sharing permissions
- Should remove set sharing
- Should get shared sets for a user
- Should get set permissions
- Should export set in different formats
- Should import set
- Should clone set
- Should get set version history
- Should restore set version
- Should create set snapshot
- Should get set statistics
- Should search sets by term
- Should perform batch operations on sets
- Should check if user has access to set
- Should create a new set version
- Should validate user clips
- Should generate unique set ID
- Should handle invalid clip IDs gracefully
- Should enforce maximum clips per set limit
- Should handle set ordering correctly

### Integration Tests
- Should integrate with set repository for CRUD operations
- Should integrate with clip repository for clip management
- Should integrate with user repository for permission checks
- Should maintain consistent set-clip relationships
- Should maintain version history when updating sets
- Should enforce user permissions across operations
- Should handle concurrent set modifications
- Should perform proper error handling
- Should enforce data validation rules
- Should handle set sharing correctly
- Should maintain proper set ordering across operations
- Should handle import/export operations correctly
- Should maintain set snapshots correctly
- Should enforce maximum set limits per user
- Should handle large sets efficiently

## Implementation Notes
1. **Set Management**:
   - Implement efficient set creation and modification
   - Support set metadata like name, description, and icon
   - Support set categorization and tagging
   - Implement set visibility controls (private, shared, public)
   - Support set archiving and restoration
   - Implement set duplication and templating
   - Support set favorites for quick access
   - Implement bulk set operations

2. **Clip Organization**:
   - Implement efficient clip addition and removal
   - Support clip ordering within sets
   - Implement clip grouping and sections within sets
   - Support reference vs. copy modes for clips
   - Implement clip position tracking
   - Support bulk clip operations within sets
   - Handle duplicate clips gracefully
   - Implement filtered views of set contents

3. **Sharing and Collaboration**:
   - Implement set sharing with specific users
   - Support different permission levels (view, edit, admin)
   - Implement real-time collaboration features
   - Support set comments and annotations
   - Implement notification system for shared sets
   - Track set activity and changes
   - Support version control for collaborative editing
   - Implement conflict resolution strategies

4. **Versioning and History**:
   - Implement set versioning for change tracking
   - Support manual snapshots of set state
   - Implement version comparison
   - Support version restoration
   - Track set revision history
   - Implement selective version restoration
   - Support version annotations
   - Implement efficient version storage

5. **Performance and Scalability**:
   - Optimize set operations for large sets
   - Implement pagination for set listings
   - Use efficient queries for set retrieval
   - Support lazy loading of set contents
   - Implement caching for frequent set queries
   - Optimize set version storage
   - Support batch operations for efficiency
   - Implement proper indexing for set searches

6. **Error Handling and Edge Cases**:
   - Handle set not found scenarios
   - Manage permission denied situations
   - Handle concurrent modification conflicts
   - Implement validation for set operations
   - Handle large set import/export gracefully
   - Manage orphaned set clips
   - Implement proper error messages
   - Handle version conflicts during restoration

## Related Files
- src/models/interfaces/set.interface.ts
- src/repositories/set.repository.ts
- src/repositories/clip.repository.ts
- src/controllers/set.controller.ts
- src/routes/set.routes.ts
- src/middleware/set-access.middleware.ts
- src/utils/set-exporter.ts
- src/utils/set-importer.ts
- src/config/set.config.ts
- src/services/clip.service.ts
