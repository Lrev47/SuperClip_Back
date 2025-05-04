# clip.repository.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the repository pattern for Clip entity operations, providing an abstraction layer for clip-related database interactions. It handles the creation, retrieval, updating, and deletion of clips, as well as clip search, filtering, and metadata management.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules:
  - ../models/interfaces/clip.interface.ts
  - ../utils/pagination.ts
  - ../utils/error.ts
  - ../utils/search.ts

## Inputs/Outputs
- **Input**: Clip data, query parameters, clip IDs, search terms, filter criteria
- **Output**: Clip objects, paginated results, metadata, success/failure responses

## API/Methods
```typescript
import { PrismaClient, Clip, Prisma } from '@prisma/client';
import { IClip, IClipWithRelations, IClipStats } from '../models/interfaces/clip.interface';
import { PaginatedResult, PaginationOptions } from '../utils/pagination';
import { SearchOptions } from '../utils/search';

export class ClipRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new clip
   * @param clipData Clip data to create
   * @returns Created clip
   */
  async create(clipData: {
    content: string;
    title?: string;
    userId: string;
    folderId?: string;
    format?: string;
    source?: string;
    metadata?: Record<string, any>;
    isPrivate?: boolean;
    tags?: string[];
  }): Promise<IClip> {
    // Implementation
  }

  /**
   * Find a clip by ID
   * @param id Clip ID
   * @param userId Optional user ID for permission check
   * @returns Clip or null if not found
   */
  async findById(id: string, userId?: string): Promise<IClip | null> {
    // Implementation
  }

  /**
   * Find a clip with all its relationships
   * @param id Clip ID
   * @param userId Optional user ID for permission check
   * @returns Clip with relationships or null if not found
   */
  async findWithRelations(id: string, userId?: string): Promise<IClipWithRelations | null> {
    // Implementation
  }

  /**
   * Find all clips
   * @param options Query options
   * @returns Paginated clip results
   */
  async findAll(options: {
    userId?: string;
    folderId?: string;
    pagination?: PaginationOptions;
    search?: SearchOptions;
    tags?: string[];
    format?: string;
    source?: string;
    isPrivate?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: Date;
    endDate?: Date;
  }): Promise<PaginatedResult<IClip>> {
    // Implementation
  }

  /**
   * Search clips
   * @param searchOptions Search options
   * @returns Paginated search results
   */
  async search(searchOptions: {
    query: string;
    userId?: string;
    pagination?: PaginationOptions;
    tags?: string[];
    format?: string;
    folderId?: string;
    isPrivate?: boolean;
  }): Promise<PaginatedResult<IClip>> {
    // Implementation
  }

  /**
   * Update a clip
   * @param id Clip ID
   * @param clipData Data to update
   * @param userId User ID for permission check
   * @returns Updated clip
   */
  async update(
    id: string,
    clipData: Partial<{
      content: string;
      title: string;
      format: string;
      source: string;
      metadata: Record<string, any>;
      isPrivate: boolean;
    }>,
    userId: string
  ): Promise<IClip> {
    // Implementation
  }

  /**
   * Delete a clip
   * @param id Clip ID
   * @param userId User ID for permission check
   * @returns Deleted clip
   */
  async delete(id: string, userId: string): Promise<IClip> {
    // Implementation
  }

  /**
   * Move a clip to a different folder
   * @param id Clip ID
   * @param folderId Destination folder ID
   * @param userId User ID for permission check
   * @returns Updated clip
   */
  async moveToFolder(id: string, folderId: string | null, userId: string): Promise<IClip> {
    // Implementation
  }

  /**
   * Add tags to a clip
   * @param id Clip ID
   * @param tagIds Tag IDs to add
   * @param userId User ID for permission check
   * @returns Updated clip with tags
   */
  async addTags(id: string, tagIds: string[], userId: string): Promise<IClipWithRelations> {
    // Implementation
  }

  /**
   * Remove tags from a clip
   * @param id Clip ID
   * @param tagIds Tag IDs to remove
   * @param userId User ID for permission check
   * @returns Updated clip with tags
   */
  async removeTags(id: string, tagIds: string[], userId: string): Promise<IClipWithRelations> {
    // Implementation
  }

  /**
   * Get clip statistics
   * @param id Clip ID
   * @param userId User ID for permission check
   * @returns Clip statistics
   */
  async getStats(id: string, userId: string): Promise<IClipStats> {
    // Implementation
  }

  /**
   * Increment clip usage count
   * @param id Clip ID
   * @returns Updated clip
   */
  async incrementUsageCount(id: string): Promise<IClip> {
    // Implementation
  }

  /**
   * Get recently used clips
   * @param userId User ID
   * @param limit Number of clips to retrieve
   * @returns Array of recent clips
   */
  async getRecentlyUsed(userId: string, limit = 10): Promise<IClip[]> {
    // Implementation
  }

  /**
   * Get frequently used clips
   * @param userId User ID
   * @param limit Number of clips to retrieve
   * @returns Array of frequent clips
   */
  async getFrequentlyUsed(userId: string, limit = 10): Promise<IClip[]> {
    // Implementation
  }

  /**
   * Check if user has access to clip
   * @param clipId Clip ID
   * @param userId User ID
   * @returns Boolean indicating access
   */
  async hasAccess(clipId: string, userId: string): Promise<boolean> {
    // Implementation
  }

  /**
   * Get total clip count
   * @param userId Optional user ID to filter by user
   * @returns Number of clips
   */
  async count(userId?: string): Promise<number> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new clip
- Should find a clip by ID
- Should find a clip with all relationships
- Should find all clips with pagination and filters
- Should search clips with various criteria
- Should update a clip
- Should delete a clip
- Should move a clip to a different folder
- Should add tags to a clip
- Should remove tags from a clip
- Should get clip statistics
- Should increment usage count
- Should get recently used clips
- Should get frequently used clips
- Should check if user has access to clip
- Should count clips correctly

### Integration Tests
- Should handle CRUD operations on clips
- Should properly manage clip-tag relationships
- Should enforce folder and user relationships
- Should handle search functionality with various filters
- Should manage clip permissions correctly
- Should track usage statistics properly
- Should maintain referential integrity when deleting clips
- Should handle concurrent operations on the same clip

## Implementation Notes
1. **Data Access Logic**:
   - Implement proper data fetching strategies to minimize N+1 query problems
   - Use transactions for operations that modify multiple tables
   - Ensure proper handling of relations between clips and other entities

2. **Security Considerations**:
   - Always verify user ownership or access rights before operations
   - Apply proper filtering for public/private clips
   - Sanitize content and metadata to prevent injection attacks
   - Implement proper access control for shared clips

3. **Search and Filtering**:
   - Use full-text search capabilities for efficient content searching
   - Implement proper indexing for frequently searched fields
   - Support various filter combinations efficiently
   - Consider using search vectors for complex text search

4. **Performance Considerations**:
   - Cache frequently accessed clips
   - Use pagination for clip listings
   - Optimize queries that join multiple tables
   - Use appropriate indexes for frequently filtered fields
   - Consider chunking for operations on multiple clips

5. **Error Handling**:
   - Provide clear error messages for validation failures
   - Handle not found errors appropriately
   - Implement proper error handling for permission issues

6. **Metadata Management**:
   - Support flexible metadata structures
   - Validate metadata against schemas when necessary
   - Enable efficient querying based on metadata fields

## Related Files
- src/models/interfaces/clip.interface.ts
- src/services/clip.service.ts
- src/controllers/clip.controller.ts
- src/repositories/tag.repository.ts
- src/repositories/folder.repository.ts
- src/utils/search.ts
- src/utils/pagination.ts
