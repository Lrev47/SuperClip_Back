# folder.dto.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines Data Transfer Objects (DTOs) for folder-related operations in the application. It provides validation schemas for creating, updating, and querying folders, ensuring proper data validation for folder management including nesting and organization.

## Dependencies
- External packages:
  - zod (for schema validation)
- Internal modules:
  - ../utils/validation (for custom validation helpers)
  - ../config/constants (for MAX_FOLDER_DEPTH constant)

## Inputs/Outputs
- **Input**: Folder data from requests or client
- **Output**: Validated folder data objects or validation errors

## Data Types
```typescript
import { z } from 'zod';
import { MAX_FOLDER_DEPTH } from '../config/constants';

// Base folder schema with common properties
const baseFolderSchema = {
  name: z.string().min(1, 'Folder name is required').max(100, 'Folder name cannot exceed 100 characters'),
  icon: z.string().max(50, 'Icon identifier cannot exceed 50 characters').nullable().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color code').nullable().optional(),
  parentId: z.string().uuid('Invalid parent folder ID format').nullable().optional(),
};

// Create folder request DTO
export const createFolderSchema = z.object({
  ...baseFolderSchema,
  level: z.number().int().min(0).max(MAX_FOLDER_DEPTH).optional(),
});
export type CreateFolderDto = z.infer<typeof createFolderSchema>;

// Update folder request DTO
export const updateFolderSchema = z.object({
  name: baseFolderSchema.name.optional(),
  icon: baseFolderSchema.icon,
  color: baseFolderSchema.color,
  parentId: baseFolderSchema.parentId,
});
export type UpdateFolderDto = z.infer<typeof updateFolderSchema>;

// Folder query parameters DTO
export const folderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  search: z.string().optional(),
  parentId: z.string().uuid('Invalid parent folder ID format').nullable().optional(),
  includeEmpty: z.boolean().optional().default(true),
  recursive: z.boolean().optional().default(false),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
export type FolderQueryDto = z.infer<typeof folderQuerySchema>;

// Folder response DTO (to client)
export const folderResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  parentId: z.string().uuid().nullable(),
  userId: z.string().uuid(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  level: z.number().int().optional(),
  path: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
  })).optional(),
  _count: z.object({
    clips: z.number().int(),
    children: z.number().int(),
  }).optional(),
});
export type FolderResponseDto = z.infer<typeof folderResponseSchema>;

// Folder tree node response DTO (for hierarchical display)
export const folderTreeResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  level: z.number().int(),
  clipCount: z.number().int(),
  children: z.lazy(() => z.array(folderTreeResponseSchema)).optional(),
});
export type FolderTreeResponseDto = z.infer<typeof folderTreeResponseSchema>;

// Move folder request DTO
export const moveFolderSchema = z.object({
  folderId: z.string().uuid('Invalid folder ID format'),
  newParentId: z.string().uuid('Invalid parent folder ID format').nullable(),
});
export type MoveFolderDto = z.infer<typeof moveFolderSchema>;

// Batch folder operation DTO
export const batchFolderOperationSchema = z.object({
  folderIds: z.array(z.string().uuid('Invalid folder ID format')).min(1, 'At least one folder ID is required'),
  operation: z.enum(['move', 'delete']),
  parentId: z.string().uuid('Invalid parent folder ID format').nullable().optional(),
});
export type BatchFolderOperationDto = z.infer<typeof batchFolderOperationSchema>;
```

## API/Methods
N/A - This is a schema/type definition file with no runtime methods.

## Test Specifications
### Unit Tests
- Should validate valid folder creation data
- Should reject folders with missing required fields
- Should validate color format correctly
- Should ensure folder depth doesn't exceed maximum
- Should handle optional fields correctly
- Should validate query parameters with proper defaults
- Should validate folder move operations correctly

## Implementation Notes
1. **Folder Hierarchy Handling**:
   - Enforce maximum folder nesting depth
   - Prevent circular references in folder hierarchy
   - Provide folder path information for breadcrumb navigation
   - Support recursive operations for nested content

2. **Performance Considerations**:
   - Use tree structures for efficient folder hierarchy display
   - Consider caching folder trees for users with complex hierarchies
   - Support lazy loading of deeply nested folders
   - Include content counts to avoid loading all nested content

3. **Validation Strategy**:
   - Use Zod for all validation to ensure type safety
   - Include helpful error messages for validation failures
   - Validate color format with regex
   - Ensure UUID format for all ID fields

4. **Extension Points**:
   - Support folder sharing between users
   - Add folder templates or presets
   - Implement folder-level permissions
   - Consider folder aliases or symbolic links

## Related Files
- src/controllers/folder.controller.ts
- src/services/folder.service.ts
- src/models/interfaces/folder.interface.ts
- src/config/constants.ts (for MAX_FOLDER_DEPTH)
- src/middleware/validation.middleware.ts
