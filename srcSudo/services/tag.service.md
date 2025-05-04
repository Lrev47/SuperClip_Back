# tag.service.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the tag management service for the SuperClip application. It handles the creation, retrieval, updating, and deletion of tags that are used to categorize and organize clips. The service provides functionality for managing tag hierarchies, tag metadata, tag suggestions, and bulk tag operations. It also supports tag analytics and tag-based search optimization to improve content discovery.

## Dependencies
- External packages:
  - @prisma/client
  - date-fns
  - slugify
  - zod (for validation)
- Internal modules:
  - ../repositories/tag.repository.ts
  - ../repositories/clip.repository.ts
  - ../repositories/user.repository.ts
  - ../utils/logger.ts
  - ../utils/error.ts
  - ../models/interfaces/tag.interface.ts
  - ../config/tag.config.ts

## Inputs/Outputs
- **Input**: Tag creation/update data, clip IDs for tagging, tag queries, user context
- **Output**: Tag objects, tagged clip collections, tag statistics, operation results

## API/Methods
```typescript
import { TagRepository } from '../repositories/tag.repository';
import { ClipRepository } from '../repositories/clip.repository';
import { UserRepository } from '../repositories/user.repository';
import { Logger } from '../utils/logger';
import { AppError, ErrorCode } from '../utils/error';
import { TagConfig } from '../config/tag.config';
import {
  Tag,
  TagCategory,
  TagRelation,
  Clip,
  User,
  Prisma
} from '@prisma/client';
import {
  CreateTagInput,
  UpdateTagInput,
  TagWithStats,
  TagQueryOptions,
  TagSortOption,
  TagStats,
  TagOperationResult,
  TagSuggestion,
  TagCategoryInput,
  TagRelationType
} from '../models/interfaces/tag.interface';
import { format } from 'date-fns';
import slugify from 'slugify';
import { z } from 'zod';

export class TagService {
  private tagRepository: TagRepository;
  private clipRepository: ClipRepository;
  private userRepository: UserRepository;
  private logger: Logger;
  private config: TagConfig;

  constructor(
    tagRepository: TagRepository,
    clipRepository: ClipRepository,
    userRepository: UserRepository,
    logger: Logger,
    config: TagConfig
  ) {
    this.tagRepository = tagRepository;
    this.clipRepository = clipRepository;
    this.userRepository = userRepository;
    this.logger = logger;
    this.config = config;
  }

  /**
   * Create a new tag
   * @param userId User ID
   * @param tagData Tag creation data
   * @returns Created tag
   */
  async createTag(
    userId: string,
    tagData: CreateTagInput
  ): Promise<Tag> {
    // Implementation
  }

  /**
   * Get tag by ID
   * @param tagId Tag ID
   * @param userId User ID requesting the tag
   * @returns Tag with usage statistics
   */
  async getTagById(
    tagId: string,
    userId: string
  ): Promise<TagWithStats | null> {
    // Implementation
  }

  /**
   * Get tag by name
   * @param tagName Tag name
   * @param userId User ID requesting the tag
   * @returns Tag with usage statistics
   */
  async getTagByName(
    tagName: string,
    userId: string
  ): Promise<TagWithStats | null> {
    // Implementation
  }

  /**
   * Get all tags for a user
   * @param userId User ID
   * @param options Query options
   * @returns List of tags with pagination
   */
  async getUserTags(
    userId: string,
    options?: TagQueryOptions
  ): Promise<{
    tags: TagWithStats[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Update tag
   * @param tagId Tag ID
   * @param userId User ID
   * @param updateData Tag update data
   * @returns Updated tag
   */
  async updateTag(
    tagId: string,
    userId: string,
    updateData: UpdateTagInput
  ): Promise<Tag> {
    // Implementation
  }

  /**
   * Delete tag
   * @param tagId Tag ID
   * @param userId User ID
   * @returns Success status
   */
  async deleteTag(
    tagId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Merge tags
   * @param sourceTagIds Source tag IDs
   * @param targetTagId Target tag ID
   * @param userId User ID
   * @returns Merge operation result
   */
  async mergeTags(
    sourceTagIds: string[],
    targetTagId: string,
    userId: string
  ): Promise<TagOperationResult> {
    // Implementation
  }

  /**
   * Split tag
   * @param sourceTagId Source tag ID
   * @param newTags New tag data
   * @param userId User ID
   * @returns Split operation result
   */
  async splitTag(
    sourceTagId: string,
    newTags: CreateTagInput[],
    userId: string
  ): Promise<TagOperationResult> {
    // Implementation
  }

  /**
   * Add tags to clip
   * @param clipId Clip ID
   * @param tagNames Tag names to add
   * @param userId User ID
   * @returns Added tags
   */
  async addTagsToClip(
    clipId: string,
    tagNames: string[],
    userId: string
  ): Promise<Tag[]> {
    // Implementation
  }

  /**
   * Remove tags from clip
   * @param clipId Clip ID
   * @param tagIds Tag IDs to remove
   * @param userId User ID
   * @returns Success status
   */
  async removeTagsFromClip(
    clipId: string,
    tagIds: string[],
    userId: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Get tags for a clip
   * @param clipId Clip ID
   * @param userId User ID
   * @returns List of tags
   */
  async getClipTags(
    clipId: string,
    userId: string
  ): Promise<Tag[]> {
    // Implementation
  }

  /**
   * Get clips by tag
   * @param tagId Tag ID
   * @param userId User ID
   * @param options Query options
   * @returns List of clips with pagination
   */
  async getClipsByTag(
    tagId: string,
    userId: string,
    options?: {
      page?: number;
      pageSize?: number;
      sort?: string;
      order?: 'asc' | 'desc';
    }
  ): Promise<{
    clips: Clip[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Get tag suggestions based on content
   * @param content Content to analyze
   * @param userId User ID
   * @param limit Maximum number of suggestions
   * @returns List of tag suggestions
   */
  async getTagSuggestions(
    content: string,
    userId: string,
    limit: number = 5
  ): Promise<TagSuggestion[]> {
    // Implementation
  }

  /**
   * Get related tags
   * @param tagId Tag ID
   * @param userId User ID
   * @param relationType Relation type
   * @returns List of related tags
   */
  async getRelatedTags(
    tagId: string,
    userId: string,
    relationType?: TagRelationType
  ): Promise<Tag[]> {
    // Implementation
  }

  /**
   * Create tag relation
   * @param sourceTagId Source tag ID
   * @param targetTagId Target tag ID
   * @param relationType Relation type
   * @param userId User ID
   * @returns Created relation
   */
  async createTagRelation(
    sourceTagId: string,
    targetTagId: string,
    relationType: TagRelationType,
    userId: string
  ): Promise<TagRelation> {
    // Implementation
  }

  /**
   * Delete tag relation
   * @param relationId Relation ID
   * @param userId User ID
   * @returns Success status
   */
  async deleteTagRelation(
    relationId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Create tag category
   * @param userId User ID
   * @param categoryData Category data
   * @returns Created category
   */
  async createTagCategory(
    userId: string,
    categoryData: TagCategoryInput
  ): Promise<TagCategory> {
    // Implementation
  }

  /**
   * Update tag category
   * @param categoryId Category ID
   * @param userId User ID
   * @param categoryData Category update data
   * @returns Updated category
   */
  async updateTagCategory(
    categoryId: string,
    userId: string,
    categoryData: TagCategoryInput
  ): Promise<TagCategory> {
    // Implementation
  }

  /**
   * Delete tag category
   * @param categoryId Category ID
   * @param userId User ID
   * @returns Success status
   */
  async deleteTagCategory(
    categoryId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Get tag categories
   * @param userId User ID
   * @returns List of categories
   */
  async getTagCategories(
    userId: string
  ): Promise<TagCategory[]> {
    // Implementation
  }

  /**
   * Assign tag to category
   * @param tagId Tag ID
   * @param categoryId Category ID
   * @param userId User ID
   * @returns Updated tag
   */
  async assignTagToCategory(
    tagId: string,
    categoryId: string,
    userId: string
  ): Promise<Tag> {
    // Implementation
  }

  /**
   * Get tag statistics
   * @param userId User ID
   * @returns Tag usage statistics
   */
  async getTagStats(
    userId: string
  ): Promise<TagStats> {
    // Implementation
  }

  /**
   * Search tags
   * @param userId User ID
   * @param searchTerm Search term
   * @param options Query options
   * @returns Search results with pagination
   */
  async searchTags(
    userId: string,
    searchTerm: string,
    options?: TagQueryOptions
  ): Promise<{
    tags: TagWithStats[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Implementation
  }

  /**
   * Batch update tags
   * @param tagUpdates Array of tag updates
   * @param userId User ID
   * @returns Operation results
   */
  async batchUpdateTags(
    tagUpdates: { id: string; updates: UpdateTagInput }[],
    userId: string
  ): Promise<TagOperationResult> {
    // Implementation
  }

  /**
   * Batch delete tags
   * @param tagIds Tag IDs to delete
   * @param userId User ID
   * @returns Operation results
   */
  async batchDeleteTags(
    tagIds: string[],
    userId: string
  ): Promise<TagOperationResult> {
    // Implementation
  }

  /**
   * Import tags
   * @param userId User ID
   * @param tags Tags to import
   * @returns Import results
   */
  async importTags(
    userId: string,
    tags: CreateTagInput[]
  ): Promise<TagOperationResult> {
    // Implementation
  }

  /**
   * Export tags
   * @param userId User ID
   * @param tagIds Optional specific tag IDs to export
   * @returns Exported tags
   */
  async exportTags(
    userId: string,
    tagIds?: string[]
  ): Promise<{
    tags: Tag[];
    exportDate: Date;
  }> {
    // Implementation
  }

  /**
   * Generate tag slug
   * @param name Tag name
   * @returns Slugified name
   */
  private generateTagSlug(name: string): string {
    // Implementation
  }

  /**
   * Check if tag exists by name
   * @param tagName Tag name
   * @param userId User ID
   * @returns Whether tag exists
   */
  private async tagExistsByName(
    tagName: string,
    userId: string
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Normalize tag name
   * @param name Tag name
   * @returns Normalized name
   */
  private normalizeTagName(name: string): string {
    // Implementation
  }

  /**
   * Extract keywords from content for tag suggestions
   * @param content Content to analyze
   * @returns Extracted keywords with scores
   */
  private extractKeywords(
    content: string
  ): Array<{ keyword: string; score: number }> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new tag successfully
- Should retrieve tag by ID
- Should retrieve tag by name
- Should get all tags for a user
- Should update tag successfully
- Should delete tag
- Should merge tags correctly
- Should split tag into multiple new tags
- Should add tags to clip
- Should remove tags from clip
- Should get tags for a clip
- Should get clips by tag
- Should generate tag suggestions from content
- Should get related tags
- Should create tag relation
- Should delete tag relation
- Should create tag category
- Should update tag category
- Should delete tag category
- Should get tag categories
- Should assign tag to category
- Should get tag statistics
- Should search tags by term
- Should batch update tags
- Should batch delete tags
- Should import tags successfully
- Should export tags
- Should generate tag slug correctly
- Should check if tag exists by name
- Should normalize tag names consistently
- Should extract keywords from content

### Integration Tests
- Should integrate with tag repository for CRUD operations
- Should integrate with clip repository for clip-tag relationships
- Should integrate with user repository for permission checks
- Should maintain consistent tag-clip relationships
- Should enforce unique tag names per user
- Should handle tag merges and splits correctly
- Should maintain proper tag relations
- Should update tag statistics when clips are tagged/untagged
- Should handle concurrent tag operations
- Should perform proper error handling
- Should enforce data validation rules
- Should handle tag categories correctly
- Should maintain proper tag slugs across operations
- Should handle bulk tag operations efficiently

## Implementation Notes
1. **Tag Management**:
   - Implement efficient tag storage and retrieval
   - Support case-insensitive tag matching
   - Handle tag normalization for consistency
   - Implement tag slugification for URLs
   - Support batch operations for performance
   - Implement tag merging and splitting
   - Support tag categories for organization
   - Implement tag hierarchy and relations
   - Support tag metadata and attributes

2. **Tag Suggestion and Analysis**:
   - Implement content analysis for tag suggestions
   - Use NLP techniques for keyword extraction
   - Support frequently used tag suggestions
   - Implement tag co-occurrence analysis
   - Support popular/trending tag suggestions
   - Consider user context for personalized suggestions
   - Implement tag weighting by relevance
   - Support multilingual tag suggestions

3. **Tag-Clip Relationships**:
   - Optimize adding and removing tags from clips
   - Support efficient queries for clips by tag
   - Implement tag counts and statistics
   - Handle orphaned tags (no associated clips)
   - Support bulk tagging operations
   - Implement efficient tag search
   - Support tag filtering and sorting
   - Track tag usage statistics

4. **Performance and Scalability**:
   - Optimize tag lookup operations
   - Implement proper indexing for tag queries
   - Use efficient data structures for tag operations
   - Implement caching for frequent tag queries
   - Optimize for large tag collections
   - Support pagination for tag listings
   - Implement efficient batch operations
   - Consider denormalization for performance

5. **Security Considerations**:
   - Validate tag input to prevent injection
   - Enforce tag ownership and access control
   - Sanitize user-provided tag names
   - Implement rate limiting for tag operations
   - Handle tag name collisions
   - Prevent excessive tag creation
   - Secure import/export operations
   - Validate tag relations

6. **Error Handling and Edge Cases**:
   - Handle duplicate tag names
   - Manage tag character limitations
   - Deal with special characters in tag names
   - Handle tags with no associated clips
   - Manage reserved tag names
   - Implement graceful error messages
   - Handle concurrent tag modifications
   - Support recovery from failed batch operations

## Related Files
- src/models/interfaces/tag.interface.ts
- src/repositories/tag.repository.ts
- src/repositories/clip.repository.ts
- src/repositories/user.repository.ts
- src/controllers/tag.controller.ts
- src/routes/tag.routes.ts
- src/middleware/tag-access.middleware.ts
- src/utils/keyword-extractor.ts
- src/config/tag.config.ts
- src/services/clip.service.ts
