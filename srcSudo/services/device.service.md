# device.service.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the device service for the SuperClip application. It handles device registration, authentication, management, and synchronization across a user's account. The service provides functionality to register new devices, authenticate existing devices, manage device metadata, handle device preferences and settings, and enforce device-specific security policies. It also supports device validation, limits enforcement, and synchronization status management across the user's ecosystem.

## Dependencies
- External packages:
  - @prisma/client
  - uuid
  - date-fns
  - ua-parser-js (for parsing user agent strings)
  - zod (for validation)
  - crypto (Node.js built-in)
- Internal modules:
  - ../repositories/device.repository.ts
  - ../repositories/user.repository.ts
  - ../repositories/setting.repository.ts
  - ../utils/logger.ts
  - ../utils/error.ts
  - ../models/interfaces/device.interface.ts
  - ../models/interfaces/user.interface.ts
  - ../config/device.config.ts

## Inputs/Outputs
- **Input**: Device registration data, device authentication requests, device update requests, device query parameters
- **Output**: Device objects, authentication results, operation status, synchronization status

## API/Methods
```typescript
import { DeviceRepository } from '../repositories/device.repository';
import { UserRepository } from '../repositories/user.repository';
import { SettingRepository } from '../repositories/setting.repository';
import { Logger } from '../utils/logger';
import { AppError, ErrorCode } from '../utils/error';
import { DeviceConfig } from '../config/device.config';
import {
  Device,
  DeviceStatus,
  DeviceType,
  User,
  Setting,
  Prisma
} from '@prisma/client';
import {
  RegisterDeviceInput,
  DeviceAuthInput,
  UpdateDeviceInput,
  DeviceAuthResponse,
  DeviceMetadata,
  DeviceListOptions,
  DeviceQueryOptions,
  SyncStatus,
  DeviceStats,
  DevicePreferences
} from '../models/interfaces/device.interface';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as dateFns from 'date-fns';
import * as UAParser from 'ua-parser-js';
import { z } from 'zod';

export class DeviceService {
  private deviceRepository: DeviceRepository;
  private userRepository: UserRepository;
  private settingRepository: SettingRepository;
  private logger: Logger;
  private config: DeviceConfig;

  constructor(
    deviceRepository: DeviceRepository,
    userRepository: UserRepository,
    settingRepository: SettingRepository,
    logger: Logger,
    config: DeviceConfig
  ) {
    this.deviceRepository = deviceRepository;
    this.userRepository = userRepository;
    this.settingRepository = settingRepository;
    this.logger = logger;
    this.config = config;
  }

  /**
   * Register a new device for a user
   * @param userId User ID
   * @param deviceData Device registration data
   * @returns Registered device with auth token
   */
  async registerDevice(
    userId: string,
    deviceData: RegisterDeviceInput
  ): Promise<DeviceAuthResponse> {
    // Implementation
  }

  /**
   * Authenticate an existing device
   * @param deviceId Device ID
   * @param authData Device authentication data
   * @returns Authentication result with token
   */
  async authenticateDevice(
    deviceId: string,
    authData: DeviceAuthInput
  ): Promise<DeviceAuthResponse> {
    // Implementation
  }

  /**
   * Get device by ID
   * @param deviceId Device ID
   * @param userId Optional user ID for permission check
   * @returns Device data
   */
  async getDeviceById(
    deviceId: string, 
    userId?: string
  ): Promise<Device | null> {
    // Implementation
  }

  /**
   * Get all devices for a user
   * @param userId User ID
   * @param options Optional listing options
   * @returns List of devices
   */
  async getUserDevices(
    userId: string,
    options?: DeviceListOptions
  ): Promise<Device[]> {
    // Implementation
  }

  /**
   * Update device information
   * @param deviceId Device ID
   * @param userId User ID for permission check
   * @param updateData Device update data
   * @returns Updated device
   */
  async updateDevice(
    deviceId: string,
    userId: string,
    updateData: UpdateDeviceInput
  ): Promise<Device> {
    // Implementation
  }

  /**
   * Remove device from user's account
   * @param deviceId Device ID
   * @param userId User ID for permission check
   * @returns Success status
   */
  async removeDevice(
    deviceId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Update device last active timestamp
   * @param deviceId Device ID
   * @returns Updated device
   */
  async updateDeviceActivity(deviceId: string): Promise<Device> {
    // Implementation
  }

  /**
   * Get device metadata from user agent string
   * @param userAgent User agent string
   * @param ipAddress IP address
   * @returns Parsed device metadata
   */
  getDeviceMetadata(
    userAgent: string,
    ipAddress?: string
  ): DeviceMetadata {
    // Implementation
  }

  /**
   * Generate device authentication token
   * @param deviceId Device ID
   * @param userId User ID
   * @returns Generated token
   */
  async generateDeviceToken(
    deviceId: string,
    userId: string
  ): Promise<string> {
    // Implementation
  }

  /**
   * Verify device authentication token
   * @param token Device token
   * @returns Verification result with device and user IDs
   */
  async verifyDeviceToken(
    token: string
  ): Promise<{
    valid: boolean;
    deviceId?: string;
    userId?: string;
  }> {
    // Implementation
  }

  /**
   * Check if device is authorized for a user
   * @param deviceId Device ID
   * @param userId User ID
   * @returns Authorization status
   */
  async isDeviceAuthorized(
    deviceId: string,
    userId: string
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Update device synchronization status
   * @param deviceId Device ID
   * @param syncStatus Sync status data
   * @returns Updated device
   */
  async updateSyncStatus(
    deviceId: string,
    syncStatus: SyncStatus
  ): Promise<Device> {
    // Implementation
  }

  /**
   * Get device statistics for a user
   * @param userId User ID
   * @returns Device usage statistics
   */
  async getDeviceStats(userId: string): Promise<DeviceStats> {
    // Implementation
  }

  /**
   * Check if user has reached device limit
   * @param userId User ID
   * @returns Whether limit is reached and current count
   */
  async checkDeviceLimit(
    userId: string
  ): Promise<{
    limitReached: boolean;
    current: number;
    maximum: number;
  }> {
    // Implementation
  }

  /**
   * Get device preferences
   * @param deviceId Device ID
   * @returns Device preferences
   */
  async getDevicePreferences(
    deviceId: string
  ): Promise<DevicePreferences> {
    // Implementation
  }

  /**
   * Update device preferences
   * @param deviceId Device ID
   * @param userId User ID
   * @param preferences Preferences to update
   * @returns Updated preferences
   */
  async updateDevicePreferences(
    deviceId: string,
    userId: string,
    preferences: Partial<DevicePreferences>
  ): Promise<DevicePreferences> {
    // Implementation
  }

  /**
   * Find devices by query options
   * @param userId User ID
   * @param options Query options
   * @returns Matching devices
   */
  async findDevices(
    userId: string,
    options: DeviceQueryOptions
  ): Promise<Device[]> {
    // Implementation
  }

  /**
   * Deactivate inactive devices
   * @param thresholdDays Days of inactivity before deactivation
   * @returns Number of deactivated devices
   */
  async deactivateInactiveDevices(
    thresholdDays: number = 90
  ): Promise<number> {
    // Implementation
  }

  /**
   * Rename device
   * @param deviceId Device ID
   * @param userId User ID
   * @param name New device name
   * @returns Updated device
   */
  async renameDevice(
    deviceId: string,
    userId: string,
    name: string
  ): Promise<Device> {
    // Implementation
  }

  /**
   * Generate unique device identifier
   * @returns Unique device ID
   */
  private generateDeviceId(): string {
    // Implementation
  }

  /**
   * Hash device token for storage
   * @param token Plain device token
   * @returns Hashed token
   */
  private hashToken(token: string): string {
    // Implementation
  }

  /**
   * Check if device needs attention (outdated, inactive, etc.)
   * @param device Device object
   * @returns Status with reason if attention needed
   */
  private checkDeviceStatus(
    device: Device
  ): {
    needsAttention: boolean;
    reason?: string;
  } {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should register a new device successfully
- Should generate proper device authentication token
- Should extract metadata from user agent string
- Should authenticate an existing device
- Should reject authentication with invalid credentials
- Should get device by ID
- Should get all devices for a user
- Should update device information
- Should remove device from user's account
- Should update device last active timestamp
- Should generate and verify device tokens
- Should check device authorization status
- Should update synchronization status
- Should track device statistics
- Should check user device limits
- Should handle device preferences
- Should find devices by query options
- Should deactivate inactive devices
- Should rename devices
- Should generate unique device identifiers
- Should properly hash device tokens
- Should check device status
- Should handle validation errors for inputs
- Should enforce device type restrictions
- Should handle device metadata updates

### Integration Tests
- Should integrate with device repository for storage operations
- Should integrate with user repository for validation
- Should integrate with settings repository for preferences
- Should maintain consistent device states
- Should track device activity accurately
- Should enforce device-level security policies
- Should handle synchronization status updates
- Should manage device limits according to user plan
- Should implement proper error handling for device operations
- Should maintain consistent logging for device events
- Should handle concurrent device registrations
- Should enforce proper device deactivation
- Should handle device migrations between accounts
- Should respect user preferences for device settings
- Should properly sync settings across devices

## Implementation Notes
1. **Device Management**:
   - Implement secure device registration process
   - Generate and validate device tokens securely
   - Track device metadata (OS, browser, platform)
   - Implement device naming and identification
   - Support multiple device types (desktop, mobile, tablet, etc.)
   - Handle device deactivation and removal
   - Support device transfer between accounts if needed
   - Track device activity for security monitoring

2. **Synchronization**:
   - Track last sync timestamp for each device
   - Implement differential sync for efficiency
   - Support conflict resolution strategies
   - Track sync status (pending, complete, failed)
   - Implement retry logic for failed syncs
   - Support selective sync for different content types
   - Manage offline capabilities
   - Support resumable sync operations

3. **Security Considerations**:
   - Implement device-level authentication
   - Support device verification procedures
   - Enforce device limits per account
   - Track suspicious device activity
   - Support device blocking/blacklisting
   - Implement proper device token rotation
   - Secure device identifier generation
   - Support device revocation
   - Implement proper device token storage

4. **Performance and Scalability**:
   - Optimize device query operations
   - Implement caching for device data
   - Support bulk device operations
   - Handle device cleanup and maintenance
   - Optimize device metadata storage
   - Implement efficient device token validation
   - Support high-volume device registration
   - Handle device pagination for accounts with many devices

5. **Error Handling and Edge Cases**:
   - Handle device not found scenarios
   - Deal with unauthorized device access attempts
   - Handle device limit exceeded cases
   - Manage device type mismatch situations
   - Implement proper error messages
   - Handle device token expiration
   - Support device recovery procedures
   - Handle concurrent device modifications
   - Deal with invalid device metadata

## Related Files
- src/models/interfaces/device.interface.ts
- src/repositories/device.repository.ts
- src/repositories/user.repository.ts
- src/repositories/setting.repository.ts
- src/controllers/device.controller.ts
- src/routes/device.routes.ts
- src/middleware/device-auth.middleware.ts
- src/utils/parser.ts
- src/config/device.config.ts
- src/services/auth.service.ts
