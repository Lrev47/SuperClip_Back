# set.dto.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines Data Transfer Objects (DTOs) for clipboard set-related operations in the application. It provides validation schemas for creating, updating, and querying clipboard sets and their items, enabling sequential access to organized clips.

## Dependencies
- External packages:
  - zod (for schema validation)
- Internal modules:
  - ../utils/validation (for custom validation helpers)
  - ../config/constants (for clipboard set limits)

## Inputs/Outputs
- **Input**: Clipboard set data from requests or client
- **Output**: Validated clipboard set data objects or validation errors

## Data Types
```typescript
import { z } from 'zod';

// Base clipboard set schema with common properties
const baseClipboardSetSchema = {
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').nullable().optional(),
  isActive: z.boolean().optional().default(true),
  folderId: z.string().uuid('Invalid folder ID format').nullable().optional(),
  tagIds: z.array(z.string().uuid('Invalid tag ID format')).optional(),
};

// Create clipboard set request DTO
export const createClipboardSetSchema = z.object({
  ...baseClipboardSetSchema,
  items: z.array(z.object({
    clipId: z.string().uuid('Invalid clip ID'),
    position: z.number().int().min(0, 'Position must be a non-negative integer'),
    name: z.string().max(100, 'Item name cannot exceed 100 characters').optional(),
    description: z.string().max(500, 'Item description cannot exceed 500 characters').optional(),
  })).optional(),
});
export type CreateClipboardSetDto = z.infer<typeof createClipboardSetSchema>;

// Update clipboard set request DTO
export const updateClipboardSetSchema = z.object({
  name: baseClipboardSetSchema.name.optional(),
  description: baseClipboardSetSchema.description,
  isActive: baseClipboardSetSchema.isActive,
  folderId: baseClipboardSetSchema.folderId,
  tagIds: baseClipboardSetSchema.tagIds,
});
export type UpdateClipboardSetDto = z.infer<typeof updateClipboardSetSchema>;

// Clipboard set item schema
const clipboardSetItemSchema = z.object({
  id: z.string().uuid().optional(), // Only for updates
  clipId: z.string().uuid('Invalid clip ID'),
  position: z.number().int().min(0, 'Position must be a non-negative integer'),
  name: z.string().max(100, 'Item name cannot exceed 100 characters').optional(),
  description: z.string().max(500, 'Item description cannot exceed 500 characters').optional(),
});

// Add items to clipboard set DTO
export const addClipboardSetItemsSchema = z.object({
  setId: z.string().uuid('Invalid set ID'),
  items: z.array(clipboardSetItemSchema).min(1, 'At least one item is required'),
});
export type AddClipboardSetItemsDto = z.infer<typeof addClipboardSetItemsSchema>;

// Update clipboard set items DTO
export const updateClipboardSetItemsSchema = z.object({
  setId: z.string().uuid('Invalid set ID'),
  items: z.array(
    clipboardSetItemSchema.extend({
      id: z.string().uuid('Invalid item ID'),
    })
  ).min(1, 'At least one item is required'),
});
export type UpdateClipboardSetItemsDto = z.infer<typeof updateClipboardSetItemsSchema>;

// Remove items from clipboard set DTO
export const removeClipboardSetItemsSchema = z.object({
  setId: z.string().uuid('Invalid set ID'),
  itemIds: z.array(z.string().uuid('Invalid item ID')).min(1, 'At least one item ID is required'),
});
export type RemoveClipboardSetItemsDto = z.infer<typeof removeClipboardSetItemsSchema>;

// Reorder clipboard set items DTO
export const reorderClipboardSetItemsSchema = z.object({
  setId: z.string().uuid('Invalid set ID'),
  itemOrders: z.array(z.object({
    id: z.string().uuid('Invalid item ID'),
    position: z.number().int().min(0, 'Position must be a non-negative integer'),
  })).min(1, 'At least one item order is required'),
});
export type ReorderClipboardSetItemsDto = z.infer<typeof reorderClipboardSetItemsSchema>;

// Clipboard set query parameters DTO
export const clipboardSetQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  search: z.string().optional(),
  folderId: z.string().uuid('Invalid folder ID format').nullable().optional(),
  tagIds: z.array(z.string().uuid('Invalid tag ID format')).or(z.string().transform(val => val.split(','))).optional(),
  isActive: z.boolean().optional(),
  includeItems: z.boolean().optional().default(false),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
export type ClipboardSetQueryDto = z.infer<typeof clipboardSetQuerySchema>;

// Clipboard set response DTO (to client)
export const clipboardSetResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  folderId: z.string().uuid().nullable(),
  folderName: z.string().nullable().optional(),
  userId: z.string().uuid(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  _count: z.object({
    items: z.number().int(),
  }).optional(),
  tags: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    color: z.string().nullable(),
  })).optional(),
  items: z.array(z.object({
    id: z.string().uuid(),
    position: z.number().int(),
    name: z.string().nullable(),
    description: z.string().nullable(),
    clipId: z.string().uuid(),
    clip: z.object({
      title: z.string(),
      contentPreview: z.string(),
      contentType: z.string(),
    }),
  })).optional(),
});
export type ClipboardSetResponseDto = z.infer<typeof clipboardSetResponseSchema>;

// Clipboard set item response DTO
export const clipboardSetItemResponseSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  clipboardSetId: z.string().uuid(),
  clipId: z.string().uuid(),
  createdAt: z.date().or(z.string()),
  clip: z.object({
    id: z.string().uuid(),
    title: z.string(),
    content: z.string(),
    contentType: z.string(),
    format: z.string().nullable(),
  }),
});
export type ClipboardSetItemResponseDto = z.infer<typeof clipboardSetItemResponseSchema>;
```

## API/Methods
N/A - This is a schema/type definition file with no runtime methods.

## Test Specifications
### Unit Tests
- Should validate valid clipboard set creation data
- Should reject sets with missing required fields
- Should validate item position values correctly
- Should handle optional fields correctly
- Should validate query parameters with proper defaults
- Should validate item operations (add, update, remove, reorder)
- Should validate response formats for sets and items

## Implementation Notes
1. **Set Organization**:
   - Maintain proper order of items within sets
   - Handle position conflicts and reordering
   - Support empty sets as placeholders
   - Consider item grouping or sections within sets

2. **Performance Considerations**:
   - Use preview content for item listings to reduce payload size
   - Support pagination for sets with many items
   - Optimize queries for efficient retrieval of set hierarchies
   - Consider loading strategies for large sets (lazy loading)

3. **Validation Strategy**:
   - Use Zod for all validation to ensure type safety
   - Include helpful error messages for validation failures
   - Validate all position values to maintain proper ordering
   - Ensure UUID format for all ID fields

4. **Extension Points**:
   - Support set templates or presets
   - Implement set versioning or revisions
   - Add set sharing between users
   - Consider nested sets or set references

## Related Files
- src/controllers/clipboard-set.controller.ts
- src/services/clipboard-set.service.ts
- src/models/interfaces/clipboard-set.interface.ts
- src/config/constants.ts (for set-related limits)
- src/middleware/validation.middleware.ts
