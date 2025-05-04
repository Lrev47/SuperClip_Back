# pagination.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This utility file provides standardized pagination functionality for the application's API endpoints. It handles pagination logic, query parameter parsing, and response formatting to ensure consistent paginated results across the application. The utility simplifies database query pagination and helps maintain a uniform response structure for paginated data.

## Dependencies

- External packages:
  - express (for request/response types)
- Internal modules:
  - ../types/common (for pagination type definitions)
  - ./validation (for query parameter validation)

## Inputs/Outputs

- **Input**: Request query parameters, database results, total counts
- **Output**: Paginated responses, pagination metadata, database query options

## Data Types

```typescript
import { Request } from 'express';

// Pagination query parameters
export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  offset?: string | number;
}

// Pagination options after parsing and validation
export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
  skip: number;
}

// Default pagination values
export interface PaginationDefaults {
  defaultPage: number;
  defaultLimit: number;
  maxLimit: number;
}

// Pagination metadata in response
export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Complete paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Database query options
export interface PaginationQueryOptions {
  skip: number;
  limit: number;
}
```

## API/Methods

### parsePaginationQuery

- Description: Extracts and validates pagination parameters from request query
- Signature: `parsePaginationQuery(query: PaginationQuery, defaults?: Partial<PaginationDefaults>): PaginationOptions`
- Parameters:
  - query: Request query parameters containing pagination info
  - defaults: Optional custom default values
- Returns: Validated pagination options
- Usage: `const paginationOptions = parsePaginationQuery(req.query)`

### getPaginationOptions

- Description: Gets pagination options from Express request
- Signature: `getPaginationOptions(req: Request, defaults?: Partial<PaginationDefaults>): PaginationOptions`
- Parameters:
  - req: Express request object
  - defaults: Optional custom default values
- Returns: Validated pagination options
- Usage: `const paginationOptions = getPaginationOptions(req)`

### getSkipValue

- Description: Calculates the number of items to skip for database queries
- Signature: `getSkipValue(page: number, limit: number): number`
- Parameters:
  - page: Current page number (1-based)
  - limit: Items per page
- Returns: Number of items to skip
- Usage: `const skipValue = getSkipValue(2, 10) // Returns 10`

### createPaginationMeta

- Description: Creates pagination metadata for response
- Signature: `createPaginationMeta(options: PaginationOptions, totalItems: number): PaginationMeta`
- Parameters:
  - options: Current pagination options
  - totalItems: Total number of items available
- Returns: Pagination metadata
- Usage: `const meta = createPaginationMeta(paginationOptions, 100)`

### paginatedResponse

- Description: Creates a standardized paginated response object
- Signature: `paginatedResponse<T>(data: T[], options: PaginationOptions, totalItems: number): PaginatedResponse<T>`
- Parameters:
  - data: Array of items for current page
  - options: Current pagination options
  - totalItems: Total number of items available
- Returns: Formatted paginated response
- Usage: `res.json(paginatedResponse(users, paginationOptions, totalCount))`

### paginateArray

- Description: Paginates an in-memory array
- Signature: `paginateArray<T>(array: T[], options: PaginationOptions): PaginatedResponse<T>`
- Parameters:
  - array: Full array to paginate
  - options: Pagination options
- Returns: Paginated response with slice of array
- Usage: `const paginatedResults = paginateArray(allItems, paginationOptions)`

### paginationLinks

- Description: Generates pagination links (first, prev, next, last)
- Signature: `paginationLinks(baseUrl: string, options: PaginationOptions, totalItems: number): Record<string, string>`
- Parameters:
  - baseUrl: Base URL for the links
  - options: Current pagination options
  - totalItems: Total number of items
- Returns: Object with pagination links
- Usage: `const links = paginationLinks('/api/users', paginationOptions, totalCount)`

### getPaginationQueryOptions

- Description: Converts pagination options to database query options
- Signature: `getPaginationQueryOptions(options: PaginationOptions): PaginationQueryOptions`
- Parameters:
  - options: Pagination options
- Returns: Query options for database
- Usage: `const queryOptions = getPaginationQueryOptions(paginationOptions)`

## Test Specifications

### Unit Tests

- Should parse pagination parameters correctly
- Should apply default values when parameters are missing
- Should enforce maximum limit values
- Should calculate skip values correctly
- Should generate correct pagination metadata
- Should create proper paginated responses
- Should generate correct pagination links
- Should handle edge cases (page 0, negative values, etc.)

### Integration Tests

- Should integrate with Express request handling
- Should work with database queries
- Should maintain consistent response format
- Should handle various query parameter formats

## Implementation Notes

1. **Parameter Validation**:

   - Validate and sanitize all pagination parameters
   - Convert string parameters to numbers
   - Apply sensible defaults for missing parameters
   - Enforce minimum and maximum values

2. **Performance Considerations**:

   - Use efficient skip/limit for database queries
   - Consider performance implications for large offsets
   - Use indexed fields for sorting with pagination
   - Consider cursor-based pagination for large datasets

3. **Response Formatting**:

   - Maintain consistent response structure
   - Include helpful metadata for clients
   - Consider including links for navigation (HATEOAS)
   - Ensure backward compatibility if format changes

4. **Best Practices**:

   - Use 1-based page numbering for API consumers
   - Document pagination parameters in API documentation
   - Support both page/limit and offset/limit pagination styles
   - Consider caching for frequently accessed pages

5. **Edge Cases**:
   - Handle requests for pages beyond available data
   - Manage empty result sets properly
   - Deal with inconsistent total counts during updates
   - Handle concurrent modifications to paginated data

## Related Files

- src/middleware/pagination.middleware.ts
- src/controllers/base.controller.ts (for common pagination handling)
- src/services/query.service.ts (for database queries)
- src/types/pagination.ts (for type definitions)
- src/utils/validation.ts (for parameter validation)
