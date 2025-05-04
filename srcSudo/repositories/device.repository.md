# device.repository.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the repository pattern for Device entity operations, providing an abstraction layer for device-related database interactions. It handles the registration, authentication, and management of user devices across different platforms, supporting secure multi-device synchronization.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules:
  - ../models/interfaces/device.interface.ts
  - ../utils/error.ts
  - ../utils/pagination.ts

## Inputs/Outputs
- **Input**: Device data, query parameters, device IDs, authentication tokens
- **Output**: Device objects, paginated results, authentication results, success/failure responses

## API/Methods
```typescript
import { PrismaClient, Device, DeviceType, DeviceStatus, Prisma } from '@prisma/client';
import { IDevice, IDeviceWithUser, IDeviceWithStats, IDeviceToken } from '../models/interfaces/device.interface';
import { PaginatedResult, PaginationOptions } from '../utils/pagination';

export class DeviceRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Register a new device
   * @param deviceData Device data to register
   * @returns Registered device
   */
  async register(deviceData: {
    name: string;
    userId: string;
    type: DeviceType;
    identifier: string;
    platform: string;
    osVersion?: string;
    appVersion?: string;
    pushToken?: string;
    ipAddress?: string;
  }): Promise<IDevice> {
    // Implementation
  }

  /**
   * Find a device by ID
   * @param id Device ID
   * @param userId Optional user ID for permission check
   * @returns Device or null if not found
   */
  async findById(id: string, userId?: string): Promise<IDevice | null> {
    // Implementation
  }

  /**
   * Find a device by identifier
   * @param identifier Device identifier (unique per device)
   * @returns Device or null if not found
   */
  async findByIdentifier(identifier: string): Promise<IDevice | null> {
    // Implementation
  }

  /**
   * Find a device with user data
   * @param id Device ID
   * @returns Device with user data or null if not found
   */
  async findWithUser(id: string): Promise<IDeviceWithUser | null> {
    // Implementation
  }

  /**
   * Get device statistics
   * @param id Device ID
   * @returns Device with usage statistics
   */
  async getStats(id: string): Promise<IDeviceWithStats | null> {
    // Implementation
  }

  /**
   * Find all devices for a user
   * @param userId User ID
   * @param options Query options
   * @returns Paginated device results
   */
  async findAllByUser(
    userId: string,
    options?: {
      pagination?: PaginationOptions;
      status?: DeviceStatus;
      type?: DeviceType;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResult<IDevice>> {
    // Implementation
  }

  /**
   * Update a device
   * @param id Device ID
   * @param deviceData Data to update
   * @param userId Optional user ID for permission check
   * @returns Updated device
   */
  async update(
    id: string,
    deviceData: Partial<{
      name: string;
      status: DeviceStatus;
      pushToken: string;
      appVersion: string;
      lastSyncedAt: Date;
      lastActiveAt: Date;
    }>,
    userId?: string
  ): Promise<IDevice> {
    // Implementation
  }

  /**
   * Delete a device
   * @param id Device ID
   * @param userId User ID for permission check
   * @returns Deleted device
   */
  async delete(id: string, userId: string): Promise<IDevice> {
    // Implementation
  }

  /**
   * Generate a device token
   * @param id Device ID
   * @param userId User ID for permission check
   * @param expiresIn Token expiration in seconds
   * @returns Device token
   */
  async generateToken(id: string, userId: string, expiresIn?: number): Promise<IDeviceToken> {
    // Implementation
  }

  /**
   * Validate a device token
   * @param token Token string
   * @returns Device ID if valid, null otherwise
   */
  async validateToken(token: string): Promise<string | null> {
    // Implementation
  }

  /**
   * Revoke all tokens for a device
   * @param id Device ID
   * @param userId User ID for permission check
   * @returns Boolean indicating success
   */
  async revokeTokens(id: string, userId: string): Promise<boolean> {
    // Implementation
  }

  /**
   * Update device last active timestamp
   * @param id Device ID
   * @returns Updated device
   */
  async updateLastActive(id: string): Promise<IDevice> {
    // Implementation
  }

  /**
   * Update device last synced timestamp
   * @param id Device ID
   * @returns Updated device
   */
  async updateLastSynced(id: string): Promise<IDevice> {
    // Implementation
  }

  /**
   * Find devices that need sync
   * @param userId User ID
   * @param exceptDeviceId Optional device ID to exclude
   * @returns Array of devices needing sync
   */
  async findDevicesNeedingSync(userId: string, exceptDeviceId?: string): Promise<IDevice[]> {
    // Implementation
  }

  /**
   * Count user's devices
   * @param userId User ID
   * @param activeOnly Count only active devices
   * @returns Number of devices
   */
  async countByUser(userId: string, activeOnly: boolean = false): Promise<number> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should register a new device
- Should find a device by ID
- Should find a device by identifier
- Should find a device with user data
- Should get device statistics
- Should find all devices for a user
- Should update a device
- Should delete a device
- Should generate a device token
- Should validate a device token
- Should revoke all tokens for a device
- Should update device last active timestamp
- Should update device last synced timestamp
- Should find devices that need sync
- Should count user's devices correctly

### Integration Tests
- Should handle device registration process
- Should manage device authentication flow
- Should enforce user ownership of devices
- Should handle device synchronization states
- Should manage device tokens securely
- Should track device activity properly
- Should maintain referential integrity with users
- Should handle concurrent operations on the same device

## Implementation Notes
1. **Device Management**:
   - Implement unique device identification across platforms
   - Support different device types (desktop, mobile, web, etc.)
   - Handle device name collisions within a user's devices
   - Implement proper device status transitions

2. **Security Considerations**:
   - Implement secure device registration and authentication
   - Generate cryptographically secure device tokens
   - Store token hashes instead of actual tokens
   - Set appropriate expiration for device tokens
   - Validate device ownership before sensitive operations
   - Implement rate limiting for token generation

3. **Synchronization**:
   - Track last sync timestamps accurately
   - Implement efficient device sync status tracking
   - Support partial synchronization when needed
   - Handle conflict resolution between devices

4. **Performance Considerations**:
   - Use efficient querying patterns for device lookup
   - Implement caching for frequent device authentication checks
   - Use appropriate indexes for device identifiers and user associations
   - Consider the impact of frequent timestamp updates

5. **Error Handling**:
   - Handle device registration errors appropriately
   - Implement proper error responses for authentication failures
   - Manage duplicate device registration attempts
   - Handle token validation failures securely

## Related Files
- src/models/interfaces/device.interface.ts
- src/services/device.service.ts
- src/services/auth.service.ts
- src/controllers/device.controller.ts
- src/middleware/device.middleware.ts
- src/utils/token.ts
