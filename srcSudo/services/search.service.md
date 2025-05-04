# search.service.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the search service for the SuperClip application, providing unified and robust search functionality across all entities (clips, folders, tags). It handles complex search queries with filtering, sorting, relevance scoring, and pagination while optimizing for performance. The service supports full-text search, tag-based search, and metadata search with configurable search strategies.

## Dependencies
- External packages:
  - @prisma/client
  - fuse.js (for client-side fuzzy search support)
  - date-fns
- Internal modules:
  - ../repositories/clip.repository.ts
  - ../repositories/folder.repository.ts
  - ../repositories/tag.repository.ts
  - ../utils/logger.ts
  - ../utils/error.ts
  - ../models/interfaces/search.interface.ts
  - ../models/interfaces/clip.interface.ts
  - ../models/interfaces/folder.interface.ts
  - ../config/search.config.ts

## Inputs/Outputs
- **Input**: Search queries, filter parameters, sorting options, pagination settings, user context
- **Output**: Search results containing clips, folders, and tags with relevance scores, pagination metadata, search suggestions

## API/Methods
```typescript
import { ClipRepository } from '../repositories/clip.repository';
import { FolderRepository } from '../repositories/folder.repository';
import { TagRepository } from '../repositories/tag.repository';
import { Logger } from '../utils/logger';
import { AppError, ErrorCode } from '../utils/error';
import { searchConfig } from '../config/search.config';
import { 
  Clip, 
  Folder, 
  Tag, 
  Prisma,
  User
} from '@prisma/client';
import { 
  SearchQuery,
  SearchFilter,
  SearchOptions,
  SearchResult,
  SearchResultItem,
  SearchSuggestion,
  SearchType,
  SortOption,
  RelevanceScore,
  SearchHistory,
  SearchStatistics
} from '../models/interfaces/search.interface';
import { ClipWithMeta } from '../models/interfaces/clip.interface';
import { FolderWithContents } from '../models/interfaces/folder.interface';
import { format, subDays } from 'date-fns';

export class SearchService {
  private clipRepository: ClipRepository;
  private folderRepository: FolderRepository;
  private tagRepository: TagRepository;
  private logger: Logger;

  constructor(
    clipRepository: ClipRepository,
    folderRepository: FolderRepository,
    tagRepository: TagRepository,
    logger: Logger
  ) {
    this.clipRepository = clipRepository;
    this.folderRepository = folderRepository;
    this.tagRepository = tagRepository;
    this.logger = logger;
  }

  /**
   * Perform a unified search across clips, folders, and tags
   * @param userId User ID
   * @param query Search query string or object
   * @param options Search options including filters, pagination, and sorting
   * @returns Search results with pagination metadata
   */
  async search(
    userId: string,
    query: string | SearchQuery,
    options?: SearchOptions
  ): Promise<SearchResult> {
    // Implementation
  }

  /**
   * Search for clips only
   * @param userId User ID
   * @param query Search query
   * @param options Search options
   * @returns Search results containing only clips
   */
  async searchClips(
    userId: string,
    query: string | SearchQuery,
    options?: SearchOptions
  ): Promise<SearchResult> {
    // Implementation
  }

  /**
   * Search for folders only
   * @param userId User ID
   * @param query Search query
   * @param options Search options
   * @returns Search results containing only folders
   */
  async searchFolders(
    userId: string,
    query: string | SearchQuery,
    options?: SearchOptions
  ): Promise<SearchResult> {
    // Implementation
  }

  /**
   * Search for tags only
   * @param userId User ID
   * @param query Search query
   * @param options Search options
   * @returns Search results containing only tags
   */
  async searchTags(
    userId: string,
    query: string | SearchQuery,
    options?: SearchOptions
  ): Promise<SearchResult> {
    // Implementation
  }

  /**
   * Get search suggestions based on partial query
   * @param userId User ID
   * @param partialQuery Partial search query
   * @param limit Maximum number of suggestions
   * @returns List of search suggestions
   */
  async getSearchSuggestions(
    userId: string,
    partialQuery: string,
    limit: number = 5
  ): Promise<SearchSuggestion[]> {
    // Implementation
  }

  /**
   * Save search query to user's search history
   * @param userId User ID
   * @param query Search query
   * @param resultCount Number of results found
   * @returns Updated search history
   */
  async saveSearchHistory(
    userId: string,
    query: string | SearchQuery,
    resultCount: number
  ): Promise<SearchHistory> {
    // Implementation
  }

  /**
   * Get user's search history
   * @param userId User ID
   * @param limit Maximum number of history items
   * @returns Search history items
   */
  async getSearchHistory(
    userId: string,
    limit: number = 10
  ): Promise<SearchHistory[]> {
    // Implementation
  }

  /**
   * Clear user's search history
   * @param userId User ID
   * @param historyIds Optional specific history IDs to clear
   * @returns Operation success status
   */
  async clearSearchHistory(
    userId: string,
    historyIds?: string[]
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Get search statistics for insights
   * @param userId User ID
   * @param timeRange Time range for statistics
   * @returns Search statistics
   */
  async getSearchStatistics(
    userId: string,
    timeRange: { from: Date; to: Date }
  ): Promise<SearchStatistics> {
    // Implementation
  }

  /**
   * Generate relevance scores for search results
   * @param query Original search query
   * @param items Items to score
   * @returns Items with relevance scores
   */
  private calculateRelevanceScores(
    query: string | SearchQuery,
    items: any[]
  ): SearchResultItem[] {
    // Implementation
  }

  /**
   * Filter search results based on criteria
   * @param items Search result items
   * @param filters Search filters
   * @returns Filtered items
   */
  private applyFilters(
    items: SearchResultItem[],
    filters?: SearchFilter
  ): SearchResultItem[] {
    // Implementation
  }

  /**
   * Sort search results based on sort options
   * @param items Search result items
   * @param sortOption Sort option
   * @returns Sorted items
   */
  private applySorting(
    items: SearchResultItem[],
    sortOption?: SortOption
  ): SearchResultItem[] {
    // Implementation
  }

  /**
   * Apply pagination to search results
   * @param items Search result items
   * @param page Page number
   * @param pageSize Page size
   * @returns Paginated items and metadata
   */
  private applyPagination(
    items: SearchResultItem[],
    page: number = 1,
    pageSize: number = 20
  ): {
    items: SearchResultItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should perform unified search across all entity types
- Should search clips only
- Should search folders only
- Should search tags only
- Should filter search results by date range
- Should filter search results by content type
- Should filter search results by tags
- Should filter search results by custom metadata
- Should sort search results by relevance
- Should sort search results by date
- Should sort search results by name/title
- Should handle pagination correctly
- Should calculate relevance scores correctly
- Should provide search suggestions for partial queries
- Should save search history for a user
- Should retrieve user's search history
- Should clear user's search history
- Should get search statistics for insights
- Should handle empty search queries appropriately
- Should sanitize search inputs for security
- Should handle special characters in search
- Should process complex query objects
- Should respect user permissions in search results
- Should handle search result highlighting correctly
- Should handle fuzzy search matching

### Integration Tests
- Should integrate with clip repository for searching
- Should integrate with folder repository for searching
- Should integrate with tag repository for searching
- Should respect access permissions across repositories
- Should handle large result sets efficiently
- Should maintain correct result ordering across repositories
- Should correctly implement search history tracking
- Should handle concurrent search requests
- Should maintain consistent pagination across queries
- Should correctly implement search statistics
- Should handle cross-entity references in search results

## Implementation Notes
1. **Search Strategy**:
   - Implement a unified search interface across all entities
   - Support both simple string queries and complex structured queries
   - Use full-text search capabilities of the database when available
   - Implement fallback search strategies for different database types
   - Support fuzzy matching for improved user experience
   - Consider implementing search indexing for performance

2. **Relevance Scoring**:
   - Implement intelligent relevance scoring algorithms
   - Consider recency, frequency, and user interaction patterns
   - Weight matches in titles higher than content matches
   - Account for tag matches and metadata matches
   - Consider implementing tf-idf or BM25 algorithms for text relevance
   - Support boosting specific fields in relevance calculations

3. **Performance Optimization**:
   - Implement efficient query execution plans
   - Use database indexes effectively for search performance
   - Consider caching frequent search results
   - Implement query throttling to prevent overload
   - Optimize for both small and large result sets
   - Use pagination to limit result set size

4. **Security Considerations**:
   - Sanitize search inputs to prevent injection attacks
   - Enforce access controls on all search results
   - Filter out results user doesn't have permission to view
   - Implement rate limiting for search requests
   - Consider privacy implications of search history
   - Log search patterns for security auditing

5. **Search UX Improvements**:
   - Implement search suggestions based on user history
   - Support autocomplete for frequently searched terms
   - Provide intelligent error handling for malformed queries
   - Support rich search syntax for power users
   - Implement result highlighting for matched terms
   - Provide contextual information in search results

6. **Extensibility**:
   - Design for adding new searchable entity types
   - Support pluggable search providers for different environments
   - Allow customizable search relevance algorithms
   - Support custom filters for domain-specific search needs
   - Implement hooks for pre and post-processing search queries
   - Design for internationalization support

## Related Files
- src/models/interfaces/search.interface.ts
- src/repositories/clip.repository.ts
- src/repositories/folder.repository.ts
- src/repositories/tag.repository.ts
- src/controllers/search.controller.ts
- src/middleware/search-rate-limit.middleware.ts
- src/config/search.config.ts
- src/routes/search.routes.ts
- src/services/clip.service.ts
- src/services/folder.service.ts
