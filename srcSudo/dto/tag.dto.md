# tag.dto.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines Data Transfer Objects (DTOs) for tag-related operations in the application. It provides validation schemas for creating, updating, and querying tags, ensuring proper data validation for tag management and categorization.

## Dependencies
- External packages:
  - zod (for schema validation)
- Internal modules:
  - ../utils/validation (for custom validation helpers)
  - ../config/constants (for MAX_TAGS_PER_CLIP constant)

## Inputs/Outputs
- **Input**: Tag data from requests or client
- **Output**: Validated tag data objects or validation errors

## Data Types
```typescript
import { z } from 'zod';

// Base tag schema with common properties
const baseTagSchema = {
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color code').nullable().optional(),
};

// Create tag request DTO
export const createTagSchema = z.object({
  ...baseTagSchema,
});
export type CreateTagDto = z.infer<typeof createTagSchema>;

// Update tag request DTO
export const updateTagSchema = z.object({
  name: baseTagSchema.name.optional(),
  color: baseTagSchema.color,
});
export type UpdateTagDto = z.infer<typeof updateTagSchema>;

// Tag query parameters DTO
export const tagQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'usage']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  includeUnused: z.boolean().optional().default(true),
});
export type TagQueryDto = z.infer<typeof tagQuerySchema>;

// Tag response DTO (to client)
export const tagResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string().nullable(),
  userId: z.string().uuid(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  _count: z.object({
    clips: z.number().int(),
    promptTemplates: z.number().int(),
    clipboardSets: z.number().int(),
  }).optional(),
});
export type TagResponseDto = z.infer<typeof tagResponseSchema>;

// Tag with usage stats response DTO
export const tagWithStatsResponseSchema = tagResponseSchema.extend({
  usageCount: z.number().int(),
  lastUsed: z.date().or(z.string()).nullable(),
});
export type TagWithStatsResponseDto = z.infer<typeof tagWithStatsResponseSchema>;

// Assign tags to clip DTO
export const assignTagsSchema = z.object({
  clipId: z.string().uuid('Invalid clip ID format'),
  tagIds: z.array(z.string().uuid('Invalid tag ID format'))
    .max(MAX_TAGS_PER_CLIP, `Cannot assign more than ${MAX_TAGS_PER_CLIP} tags to a clip`),
});
export type AssignTagsDto = z.infer<typeof assignTagsSchema>;

// Tag suggestion query DTO (for autocomplete)
export const tagSuggestionQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
});
export type TagSuggestionQueryDto = z.infer<typeof tagSuggestionQuerySchema>;

// Batch tag operation DTO
export const batchTagOperationSchema = z.object({
  tagIds: z.array(z.string().uuid('Invalid tag ID format')).min(1, 'At least one tag ID is required'),
  operation: z.enum(['delete', 'merge', 'color']),
  targetTagId: z.string().uuid('Invalid target tag ID format').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color code').nullable().optional(),
});
export type BatchTagOperationDto = z.infer<typeof batchTagOperationSchema>;
```

## API/Methods
N/A - This is a schema/type definition file with no runtime methods.

## Test Specifications
### Unit Tests
- Should validate valid tag creation data
- Should reject tags with missing required fields
- Should validate tag name format correctly
- Should validate color format correctly
- Should handle optional fields correctly
- Should validate query parameters with proper defaults
- Should respect tag limit when assigning to clips
- Should validate batch operations correctly

## Implementation Notes
1. **Tag Naming Conventions**:
   - Enforce consistent tag naming rules
   - Consider case-insensitive tag uniqueness per user
   - Handle tag normalization (e.g., trimming whitespace, lowercase)
   - Prevent duplicate tags with slightly different casing

2. **Color Management**:
   - Provide default colors for tags without specified colors
   - Consider color generation algorithms for visual distinction
   - Support consistent color format (hex codes)
   - Consider accessibility when generating or validating colors

3. **Performance Considerations**:
   - Optimize tag suggestions for quick autocompletion
   - Cache frequently used tags for better performance
   - Consider usage statistics to prioritize popular tags
   - Support pagination for users with many tags

4. **Extension Points**:
   - Consider tag hierarchies or categories
   - Support tag synonyms or aliases
   - Implement tag recommendations based on content
   - Add tag analytics and usage statistics

## Related Files
- src/controllers/tag.controller.ts
- src/services/tag.service.ts
- src/models/interfaces/tag.interface.ts
- src/config/constants.ts (for MAX_TAGS_PER_CLIP)
- src/middleware/validation.middleware.ts
