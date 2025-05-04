# device.dto.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines Data Transfer Objects (DTOs) for device-related operations in the application. It provides validation schemas for registering, updating, and querying devices, ensuring proper data validation for multi-device synchronization.

## Dependencies
- External packages:
  - zod (for schema validation)
- Internal modules:
  - ../utils/validation (for custom validation helpers)

## Inputs/Outputs
- **Input**: Device data from requests or clients
- **Output**: Validated device data objects or validation errors

## Data Types
```typescript
import { z } from 'zod';

// Base device schema with common properties
const baseDeviceSchema = {
  name: z.string().min(1, 'Device name is required').max(100, 'Device name cannot exceed 100 characters'),
  deviceType: z.string().max(50, 'Device type cannot exceed 50 characters').nullable().optional(),
};

// Register device request DTO
export const registerDeviceSchema = z.object({
  ...baseDeviceSchema,
  deviceId: z.string().uuid('Invalid device ID format'),
  platform: z.enum(['web', 'desktop', 'mobile', 'other']).optional(),
  osName: z.string().max(50).optional(),
  osVersion: z.string().max(50).optional(),
  appVersion: z.string().max(50).optional(),
});
export type RegisterDeviceDto = z.infer<typeof registerDeviceSchema>;

// Update device request DTO
export const updateDeviceSchema = z.object({
  name: baseDeviceSchema.name.optional(),
  deviceType: baseDeviceSchema.deviceType,
  lastSyncedAt: z.date().or(z.string()).optional(),
});
export type UpdateDeviceDto = z.infer<typeof updateDeviceSchema>;

// Device query parameters DTO
export const deviceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  search: z.string().optional(),
  deviceType: z.string().optional(),
  sortBy: z.enum(['name', 'lastSyncedAt', 'createdAt', 'updatedAt']).optional().default('lastSyncedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
export type DeviceQueryDto = z.infer<typeof deviceQuerySchema>;

// Device response DTO (to client)
export const deviceResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  deviceType: z.string().nullable(),
  lastSyncedAt: z.date().or(z.string()).nullable(),
  userId: z.string().uuid(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  isCurrentDevice: z.boolean().optional(),
  syncStatus: z.object({
    pendingChanges: z.number().int().optional(),
    syncedClips: z.number().int().optional(),
    lastSyncAttempt: z.date().or(z.string()).nullable().optional(),
  }).optional(),
});
export type DeviceResponseDto = z.infer<typeof deviceResponseSchema>;

// Device sync status response DTO
export const deviceSyncStatusSchema = z.object({
  deviceId: z.string().uuid(),
  deviceName: z.string(),
  lastSyncedAt: z.date().or(z.string()).nullable(),
  pendingChanges: z.number().int(),
  isCurrentDevice: z.boolean(),
});
export type DeviceSyncStatusDto = z.infer<typeof deviceSyncStatusSchema>;

// Sync request DTO
export const syncRequestSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID format'),
  lastSyncTimestamp: z.date().or(z.string()).optional(),
  changes: z.array(z.object({
    entityType: z.enum(['clip', 'folder', 'tag', 'set', 'template']),
    entityId: z.string().uuid(),
    operation: z.enum(['create', 'update', 'delete']),
    timestamp: z.date().or(z.string()),
    data: z.record(z.any()).optional(),
  })).optional(),
});
export type SyncRequestDto = z.infer<typeof syncRequestSchema>;

// Sync response DTO
export const syncResponseSchema = z.object({
  syncTimestamp: z.date().or(z.string()),
  changes: z.array(z.object({
    entityType: z.enum(['clip', 'folder', 'tag', 'set', 'template']),
    entityId: z.string().uuid(),
    operation: z.enum(['create', 'update', 'delete']),
    timestamp: z.date().or(z.string()),
    data: z.record(z.any()).optional(),
  })),
  conflicts: z.array(z.object({
    entityType: z.enum(['clip', 'folder', 'tag', 'set', 'template']),
    entityId: z.string().uuid(),
    serverTimestamp: z.date().or(z.string()),
    clientTimestamp: z.date().or(z.string()),
    resolution: z.enum(['server', 'client', 'manual']).optional(),
  })).optional(),
});
export type SyncResponseDto = z.infer<typeof syncResponseSchema>;
```

## API/Methods
N/A - This is a schema/type definition file with no runtime methods.

## Test Specifications
### Unit Tests
- Should validate valid device registration data
- Should reject devices with missing required fields
- Should handle optional fields correctly
- Should validate sync request and response formats
- Should validate query parameters with proper defaults
- Should convert string dates to Date objects correctly
- Should validate sync operation types correctly

## Implementation Notes
1. **Device Registration**:
   - Ensure generated device IDs are consistent across sessions
   - Support various device types and platforms
   - Collect relevant system information for debugging
   - Implement device name defaults based on platform/type

2. **Synchronization Strategy**:
   - Use timestamps for incremental synchronization
   - Handle conflict detection between devices
   - Support both full and partial syncs
   - Validate data integrity during sync operations

3. **Validation Strategy**:
   - Use Zod for all validation to ensure type safety
   - Include helpful error messages for validation failures
   - Validate all enum values against allowed options
   - Ensure UUID format for all ID fields

4. **Security Considerations**:
   - Never expose sensitive device information
   - Implement device authorization checks
   - Consider rate limiting for sync operations
   - Validate user ownership of devices

## Related Files
- src/controllers/device.controller.ts
- src/services/device.service.ts
- src/services/sync.service.ts
- src/models/interfaces/device.interface.ts
- src/middleware/device.middleware.ts
