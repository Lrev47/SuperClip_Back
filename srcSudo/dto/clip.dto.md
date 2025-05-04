# clip.dto.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines Data Transfer Objects (DTOs) for clip-related operations in the application. It provides validation schemas for creating, updating, and querying clips, ensuring proper data validation for clipboard content management.

## Dependencies
- External packages:
  - zod (for schema validation)
- Internal modules:
  - ../utils/validation (for custom validation helpers)
  - ../types/common (for enums and constants)

## Inputs/Outputs
- **Input**: Clip data from requests or client
- **Output**: Validated clip data objects or validation errors

## Data Types
```typescript
import { z } from 'zod';
import { ClipType, SyncStatus } from '@prisma/client';

// Base clip schema with common properties
const baseClipSchema = {
  title: z.string().min(1, 'Title is required').max(255, 'Title cannot exceed 255 characters'),
  content: z.string().min(1, 'Content is required').max(1000000, 'Content is too large'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').nullable().optional(),
  contentType: z.nativeEnum(ClipType),
  format: z.string().max(50).nullable().optional(),
  folderId: z.string().uuid('Invalid folder ID format').nullable().optional(),
  isFavorite: z.boolean().optional().default(false),
  isPinned: z.boolean().optional().default(false),
  tagIds: z.array(z.string().uuid('Invalid tag ID format')).optional(),
};

// Create clip request DTO
export const createClipSchema = z.object({
  ...baseClipSchema,
  syncStatus: z.nativeEnum(SyncStatus).optional().default('SYNCED'),
  deviceId: z.string().uuid('Invalid device ID format').optional(),
});
export type CreateClipDto = z.infer<typeof createClipSchema>;

// Update clip request DTO
export const updateClipSchema = z.object({
  title: baseClipSchema.title.optional(),
  content: baseClipSchema.content.optional(),
  description: baseClipSchema.description,
  contentType: baseClipSchema.contentType.optional(),
  format: baseClipSchema.format,
  folderId: baseClipSchema.folderId,
  isFavorite: baseClipSchema.isFavorite,
  isPinned: baseClipSchema.isPinned,
  tagIds: baseClipSchema.tagIds,
  syncStatus: z.nativeEnum(SyncStatus).optional(),
});
export type UpdateClipDto = z.infer<typeof updateClipSchema>;

// Clip query parameters DTO
export const clipQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  folderId: z.string().uuid('Invalid folder ID format').nullable().optional(),
  tagIds: z.array(z.string().uuid('Invalid tag ID format')).or(z.string().transform(val => val.split(','))).optional(),
  contentType: z.nativeEnum(ClipType).optional(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'lastUsed', 'useCount']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
export type ClipQueryDto = z.infer<typeof clipQuerySchema>;

// Clip response DTO (to client)
export const clipResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  description: z.string().nullable(),
  contentType: z.nativeEnum(ClipType),
  format: z.string().nullable(),
  folderId: z.string().uuid().nullable(),
  folderName: z.string().nullable().optional(),
  isFavorite: z.boolean(),
  isPinned: z.boolean(),
  lastUsed: z.date().or(z.string()).nullable(),
  useCount: z.number().int(),
  syncStatus: z.nativeEnum(SyncStatus),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  tags: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    color: z.string().nullable(),
  })).optional(),
});
export type ClipResponseDto = z.infer<typeof clipResponseSchema>;

// Clip preview response DTO (for lists)
export const clipPreviewResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  contentPreview: z.string(),
  contentType: z.nativeEnum(ClipType),
  folderId: z.string().uuid().nullable(),
  folderName: z.string().nullable().optional(),
  isFavorite: z.boolean(),
  isPinned: z.boolean(),
  lastUsed: z.date().or(z.string()).nullable(),
  useCount: z.number().int(),
  tagCount: z.number().int(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});
export type ClipPreviewResponseDto = z.infer<typeof clipPreviewResponseSchema>;

// Increment usage count DTO
export const incrementClipUsageSchema = z.object({
  id: z.string().uuid('Invalid clip ID format'),
  deviceId: z.string().uuid('Invalid device ID format').optional(),
});
export type IncrementClipUsageDto = z.infer<typeof incrementClipUsageSchema>;

// Batch clips operation DTO
export const batchClipsOperationSchema = z.object({
  clipIds: z.array(z.string().uuid('Invalid clip ID format')).min(1, 'At least one clip ID is required'),
  operation: z.enum(['favorite', 'unfavorite', 'pin', 'unpin', 'move', 'delete', 'tag', 'untag']),
  folderId: z.string().uuid('Invalid folder ID format').nullable().optional(),
  tagIds: z.array(z.string().uuid('Invalid tag ID format')).optional(),
});
export type BatchClipsOperationDto = z.infer<typeof batchClipsOperationSchema>;
```

## API/Methods
N/A - This is a schema/type definition file with no runtime methods.

## Test Specifications
### Unit Tests
- Should validate valid clip creation data
- Should reject clips with missing required fields
- Should handle optional fields correctly
- Should enforce size limits on content and title
- Should validate query parameters correctly
- Should handle array parameters in query strings
- Should validate batch operations correctly

## Implementation Notes
1. **Content Handling**:
   - Enforce appropriate size limits based on subscription tier
   - Consider content validation based on contentType
   - Implement content preview generation for list views

2. **Performance Considerations**:
   - Use preview responses for listing to reduce payload size
   - Consider pagination for clip collections
   - Optimize search parameters for database queries

3. **Validation Strategy**:
   - Use Zod for all validation to ensure type safety
   - Include helpful error messages for validation failures
   - Validate contentType against allowed enum values
   - Ensure UUID format for all ID fields

4. **Extension Points**:
   - Support additional clip content types as needed
   - Consider versioning for clips with revision history
   - Add support for clip analytics and usage statistics

## Related Files
- src/controllers/clip.controller.ts
- src/services/clip.service.ts
- src/models/interfaces/clip.interface.ts
- src/middleware/validation.middleware.ts
