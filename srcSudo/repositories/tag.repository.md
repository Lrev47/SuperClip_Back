# tag.repository.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the repository pattern for Tag entity operations, providing an abstraction layer for tag-related database interactions. It handles the creation, retrieval, updating, and deletion of tags, as well as tag assignments to various entities (clips, folders, templates) and tag organization.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules:
  - ../models/interfaces/tag.interface.ts
  - ../utils/pagination.ts
  - ../utils/error.ts

## Inputs/Outputs
- **Input**: Tag data, query parameters, tag IDs, entity IDs
- **Output**: Tag objects, paginated results, tag assignments, success/failure responses

## API/Methods
```typescript
import { PrismaClient, Tag, TaggableType, Prisma } from '@prisma/client';
import { ITag, ITagWithStats, ITagAssignment, ITagWithItems } from '../models/interfaces/tag.interface';
import { PaginatedResult, PaginationOptions } from '../utils/pagination';

export class TagRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new tag
   * @param tagData Tag data to create
   * @returns Created tag
   */
  async create(tagData: {
    name: string;
    userId: string;
    color?: string;
    description?: string;
  }): Promise<ITag> {
    // Implementation
  }

  /**
   * Find a tag by ID
   * @param id Tag ID
   * @param userId Optional user ID for permission check
   * @returns Tag or null if not found
   */
  async findById(id: string, userId?: string): Promise<ITag | null> {
    // Implementation
  }

  /**
   * Find a tag by name for a user
   * @param name Tag name
   * @param userId User ID
   * @returns Tag or null if not found
   */
  async findByName(name: string, userId: string): Promise<ITag | null> {
    // Implementation
  }

  /**
   * Get tag statistics
   * @param id Tag ID
   * @param userId User ID for permission check
   * @returns Tag with usage statistics
   */
  async getStats(id: string, userId: string): Promise<ITagWithStats | null> {
    // Implementation
  }

  /**
   * Find all tags for a user
   * @param options Query options
   * @returns Paginated tag results
   */
  async findAll(options: {
    userId: string;
    pagination?: PaginationOptions;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    entityType?: TaggableType;
  }): Promise<PaginatedResult<ITag>> {
    // Implementation
  }

  /**
   * Find tags for a specific entity
   * @param entityId Entity ID
   * @param entityType Entity type
   * @returns Array of tags
   */
  async findByEntity(entityId: string, entityType: TaggableType): Promise<ITag[]> {
    // Implementation
  }

  /**
   * Update a tag
   * @param id Tag ID
   * @param tagData Data to update
   * @param userId User ID for permission check
   * @returns Updated tag
   */
  async update(
    id: string,
    tagData: Partial<{
      name: string;
      color: string;
      description: string;
    }>,
    userId: string
  ): Promise<ITag> {
    // Implementation
  }

  /**
   * Delete a tag
   * @param id Tag ID
   * @param userId User ID for permission check
   * @returns Deleted tag
   */
  async delete(id: string, userId: string): Promise<ITag> {
    // Implementation
  }

  /**
   * Assign a tag to an entity
   * @param tagId Tag ID
   * @param entityId Entity ID
   * @param entityType Entity type
   * @param userId User ID for permission check
   * @returns Tag assignment
   */
  async assignTag(
    tagId: string,
    entityId: string,
    entityType: TaggableType,
    userId: string
  ): Promise<ITagAssignment> {
    // Implementation
  }

  /**
   * Remove a tag from an entity
   * @param tagId Tag ID
   * @param entityId Entity ID
   * @param entityType Entity type
   * @param userId User ID for permission check
   * @returns Boolean indicating success
   */
  async removeTag(
    tagId: string,
    entityId: string,
    entityType: TaggableType,
    userId: string
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Assign multiple tags to an entity
   * @param tagIds Tag IDs
   * @param entityId Entity ID
   * @param entityType Entity type
   * @param userId User ID for permission check
   * @returns Number of tags assigned
   */
  async assignTags(
    tagIds: string[],
    entityId: string,
    entityType: TaggableType,
    userId: string
  ): Promise<number> {
    // Implementation
  }

  /**
   * Remove multiple tags from an entity
   * @param tagIds Tag IDs
   * @param entityId Entity ID
   * @param entityType Entity type
   * @param userId User ID for permission check
   * @returns Number of tags removed
   */
  async removeTags(
    tagIds: string[],
    entityId: string,
    entityType: TaggableType,
    userId: string
  ): Promise<number> {
    // Implementation
  }

  /**
   * Replace all tags on an entity
   * @param tagIds Tag IDs
   * @param entityId Entity ID
   * @param entityType Entity type
   * @param userId User ID for permission check
   * @returns Number of tags after operation
   */
  async replaceTags(
    tagIds: string[],
    entityId: string,
    entityType: TaggableType,
    userId: string
  ): Promise<number> {
    // Implementation
  }

  /**
   * Find entities by tags
   * @param tagIds Tag IDs
   * @param entityType Entity type
   * @param userId User ID for permission check
   * @param options Query options
   * @returns Paginated entity IDs
   */
  async findEntitiesByTags(
    tagIds: string[],
    entityType: TaggableType,
    userId: string,
    options?: {
      pagination?: PaginationOptions;
      matchAll?: boolean;
    }
  ): Promise<PaginatedResult<string>> {
    // Implementation
  }

  /**
   * Find tags with their items
   * @param id Tag ID
   * @param options Query options
   * @returns Tag with items or null if not found
   */
  async findWithItems(id: string, options?: {
    userId: string;
    entityType?: TaggableType;
    pagination?: PaginationOptions;
  }): Promise<ITagWithItems | null> {
    // Implementation
  }

  /**
   * Get total tag count
   * @param userId User ID
   * @returns Number of tags
   */
  async count(userId: string): Promise<number> {
    // Implementation
  }

  /**
   * Check if user has access to tag
   * @param tagId Tag ID
   * @param userId User ID
   * @returns Boolean indicating access
   */
  async hasAccess(tagId: string, userId: string): Promise<boolean> {
    // Implementation
  }

  /**
   * Merge tags
   * @param sourceTagId Source tag ID to merge from
   * @param targetTagId Target tag ID to merge into
   * @param userId User ID for permission check
   * @returns Target tag with updated stats
   */
  async mergeTags(sourceTagId: string, targetTagId: string, userId: string): Promise<ITagWithStats> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new tag
- Should find a tag by ID
- Should find a tag by name
- Should get tag statistics
- Should find all tags for a user
- Should find tags for a specific entity
- Should update a tag
- Should delete a tag
- Should assign a tag to an entity
- Should remove a tag from an entity
- Should assign multiple tags to an entity
- Should remove multiple tags from an entity
- Should replace all tags on an entity
- Should find entities by tags
- Should find tags with their items
- Should count tags correctly
- Should check if user has access to tag
- Should merge tags correctly

### Integration Tests
- Should handle CRUD operations on tags
- Should maintain proper tag-entity relationships
- Should handle tag assignment and removal correctly
- Should enforce user ownership of tags
- Should handle tag searches with various criteria
- Should maintain referential integrity when deleting tags
- Should handle multi-entity tag operations
- Should manage tag merging properly

## Implementation Notes
1. **Tag Management**:
   - Implement efficient tag creation and naming validation
   - Support tag color customization for visual organization
   - Handle tag naming conflicts within a user's tags
   - Implement normalized tag names for case-insensitive lookup

2. **Entity Tagging**:
   - Support tagging for different entity types (clips, folders, templates)
   - Implement many-to-many relationships between tags and entities
   - Handle batch operations for efficient multi-tag operations
   - Support composite operations like replace-all-tags

3. **Tag Organization**:
   - Consider implementing tag grouping or hierarchies if needed
   - Support sorting and filtering of tags by usage, name, etc.
   - Implement tag merging to consolidate redundant tags
   - Track tag usage statistics for smart suggestions

4. **Security Considerations**:
   - Always verify user ownership before operations
   - Implement proper authorization for shared tags
   - Validate entity access rights before tag operations
   - Sanitize tag inputs to prevent injection attacks

5. **Performance Considerations**:
   - Optimize queries for tag lookup and assignment
   - Use efficient joins for tag filtering operations
   - Implement pagination for tag-based queries
   - Use appropriate indexes for tag lookups
   - Consider caching frequently used tag sets

6. **Error Handling**:
   - Handle tag name conflicts appropriately
   - Provide meaningful errors for permission issues
   - Implement validation for tag operations
   - Handle tag reference cleanup properly

## Related Files
- src/models/interfaces/tag.interface.ts
- src/services/tag.service.ts
- src/controllers/tag.controller.ts
- src/repositories/clip.repository.ts
- src/repositories/folder.repository.ts
- src/repositories/template.repository.ts
