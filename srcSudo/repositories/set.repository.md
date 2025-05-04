# set.repository.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the repository pattern for Set entity operations, providing an abstraction layer for set-related database interactions. It handles the creation, retrieval, updating, and deletion of clip sets, which are collections of clips organized in a specific order for sequential access or grouped functionality.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules:
  - ../models/interfaces/set.interface.ts
  - ../utils/pagination.ts
  - ../utils/error.ts

## Inputs/Outputs
- **Input**: Set data, query parameters, set IDs, clip IDs
- **Output**: Set objects, paginated results, set members, success/failure responses

## API/Methods
```typescript
import { PrismaClient, Set, SetType, Prisma } from '@prisma/client';
import { 
  ISet, 
  ISetWithClips, 
  ISetWithItems,
  ISetStats,
  ISetItem
} from '../models/interfaces/set.interface';
import { PaginatedResult, PaginationOptions } from '../utils/pagination';

export class SetRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new set
   * @param setData Set data to create
   * @returns Created set
   */
  async create(setData: {
    name: string;
    userId: string;
    type?: SetType;
    description?: string;
    color?: string;
    icon?: string;
    isDefault?: boolean;
    clipIds?: string[];
    folderId?: string | null;
  }): Promise<ISet> {
    // Implementation
  }

  /**
   * Find a set by ID
   * @param id Set ID
   * @param userId Optional user ID for permission check
   * @returns Set or null if not found
   */
  async findById(id: string, userId?: string): Promise<ISet | null> {
    // Implementation
  }

  /**
   * Find a set with its clips
   * @param id Set ID
   * @param options Query options
   * @returns Set with clips or null if not found
   */
  async findWithClips(
    id: string,
    options?: {
      userId?: string;
      pagination?: PaginationOptions;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<ISetWithClips | null> {
    // Implementation
  }

  /**
   * Find all sets for a user
   * @param options Query options
   * @returns Paginated set results
   */
  async findAll(options: {
    userId: string;
    pagination?: PaginationOptions;
    search?: string;
    type?: SetType;
    folderId?: string | null;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<ISet>> {
    // Implementation
  }

  /**
   * Update a set
   * @param id Set ID
   * @param setData Data to update
   * @param userId User ID for permission check
   * @returns Updated set
   */
  async update(
    id: string,
    setData: Partial<{
      name: string;
      type: SetType;
      description: string;
      color: string;
      icon: string;
      isDefault: boolean;
      folderId: string | null;
    }>,
    userId: string
  ): Promise<ISet> {
    // Implementation
  }

  /**
   * Delete a set
   * @param id Set ID
   * @param userId User ID for permission check
   * @returns Deleted set
   */
  async delete(id: string, userId: string): Promise<ISet> {
    // Implementation
  }

  /**
   * Add a clip to a set
   * @param id Set ID
   * @param clipId Clip ID to add
   * @param userId User ID for permission check
   * @param options Add options
   * @returns Updated set item
   */
  async addClip(
    id: string,
    clipId: string,
    userId: string,
    options?: {
      position?: number;
      customTitle?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ISetItem> {
    // Implementation
  }

  /**
   * Remove a clip from a set
   * @param id Set ID
   * @param clipId Clip ID to remove
   * @param userId User ID for permission check
   * @returns Boolean indicating success
   */
  async removeClip(
    id: string,
    clipId: string,
    userId: string
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Update a clip in a set
   * @param id Set ID
   * @param clipId Clip ID to update
   * @param itemData Item data to update
   * @param userId User ID for permission check
   * @returns Updated set item
   */
  async updateClip(
    id: string,
    clipId: string,
    itemData: Partial<{
      position: number;
      customTitle: string;
      metadata: Record<string, any>;
    }>,
    userId: string
  ): Promise<ISetItem> {
    // Implementation
  }

  /**
   * Reorder clips in a set
   * @param id Set ID
   * @param clipOrder Ordered array of clip IDs
   * @param userId User ID for permission check
   * @returns Updated set with items
   */
  async reorderClips(
    id: string,
    clipOrder: string[],
    userId: string
  ): Promise<ISetWithItems> {
    // Implementation
  }

  /**
   * Set default set for a user
   * @param id Set ID to set as default
   * @param userId User ID
   * @returns Updated set
   */
  async setDefault(id: string, userId: string): Promise<ISet> {
    // Implementation
  }

  /**
   * Get default set for a user
   * @param userId User ID
   * @param type Optional set type filter
   * @returns Default set or null
   */
  async getDefault(userId: string, type?: SetType): Promise<ISet | null> {
    // Implementation
  }

  /**
   * Move set to a folder
   * @param id Set ID
   * @param folderId Folder ID (null for root level)
   * @param userId User ID for permission check
   * @returns Updated set
   */
  async moveToFolder(id: string, folderId: string | null, userId: string): Promise<ISet> {
    // Implementation
  }

  /**
   * Get set statistics
   * @param id Set ID
   * @param userId User ID for permission check
   * @returns Set statistics
   */
  async getStats(id: string, userId: string): Promise<ISetStats> {
    // Implementation
  }

  /**
   * Clone a set
   * @param id Set ID to clone
   * @param userId User ID for permission check
   * @param options Clone options
   * @returns New cloned set
   */
  async clone(id: string, userId: string, options?: {
    newName?: string;
    folderId?: string | null;
    includeClips?: boolean;
  }): Promise<ISet> {
    // Implementation
  }

  /**
   * Check if a clip exists in a set
   * @param id Set ID
   * @param clipId Clip ID to check
   * @returns Boolean indicating existence
   */
  async hasClip(id: string, clipId: string): Promise<boolean> {
    // Implementation
  }

  /**
   * Get total set count
   * @param userId User ID
   * @returns Number of sets
   */
  async count(userId: string): Promise<number> {
    // Implementation
  }

  /**
   * Check if user has access to set
   * @param setId Set ID
   * @param userId User ID
   * @returns Boolean indicating access
   */
  async hasAccess(setId: string, userId: string): Promise<boolean> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new set
- Should find a set by ID
- Should find a set with its clips
- Should find all sets for a user
- Should update a set
- Should delete a set
- Should add a clip to a set
- Should remove a clip from a set
- Should update a clip in a set
- Should reorder clips in a set
- Should set default set for a user
- Should get default set for a user
- Should move set to a folder
- Should get set statistics
- Should clone a set
- Should check if a clip exists in a set
- Should count sets correctly
- Should check if user has access to set

### Integration Tests
- Should handle CRUD operations on sets
- Should manage set-clip relationships properly
- Should enforce user ownership of sets
- Should maintain clip order within sets
- Should handle default set designation correctly
- Should manage folder relationships correctly
- Should perform set cloning with proper options
- Should maintain referential integrity with users and clips

## Implementation Notes
1. **Set Management**:
   - Implement different set types (sequence, collection, group)
   - Support customizable set appearance (colors, icons)
   - Handle set organization within folders
   - Implement default set designation per user

2. **Item Management**:
   - Maintain proper ordering of clips within sets
   - Support custom titles and metadata for clips in sets
   - Implement efficient reordering operations
   - Handle duplicate clips in sets when needed

3. **Set Sharing**:
   - Consider implementing set sharing between users
   - Support public/private set visibility
   - Handle permissions for shared sets
   - Implement set export/import functionality

4. **Security Considerations**:
   - Always verify user ownership before operations
   - Implement proper authorization for shared sets
   - Validate clip ownership or access rights before adding to sets
   - Sanitize set name and description inputs

5. **Performance Considerations**:
   - Optimize queries for set retrieval with clips
   - Use efficient sorting and ordering mechanisms
   - Implement pagination for set listings
   - Cache frequently accessed sets
   - Use appropriate indexes for set lookups

6. **Error Handling**:
   - Handle set name conflicts appropriately
   - Provide meaningful errors for permission issues
   - Implement validation for set operations
   - Handle not found errors gracefully

## Related Files
- src/models/interfaces/set.interface.ts
- src/services/set.service.ts
- src/controllers/set.controller.ts
- src/repositories/clip.repository.ts
- src/repositories/folder.repository.ts
