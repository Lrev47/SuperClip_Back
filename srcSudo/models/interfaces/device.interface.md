# device.interface.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines interfaces for the Device entity in the application. It provides TypeScript types for device data that enables multi-device synchronization, tracking which devices are registered to a user and the synchronization status of clips across those devices.

## Dependencies
- External packages:
  - @prisma/client
- Internal modules: None

## Inputs/Outputs
- **Input**: None (type definitions only)
- **Output**: TypeScript interfaces for device-related data structures

## Data Types
```typescript
import { Device, User, Clip } from '@prisma/client';

// Basic device interface (extends the Prisma model)
export interface IDevice extends Device {
  // Basic device attributes defined in Prisma schema
  id: string;
  name: string;
  deviceType: string | null;
  lastSyncedAt: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Device with user data
export interface IDeviceWithUser extends IDevice {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Device with clips
export interface IDeviceWithClips extends IDevice {
  clips: {
    id: string;
    title: string;
    contentType: string;
    updatedAt: Date;
  }[];
}

// Device with full relationship data
export interface IDeviceWithRelations extends IDevice {
  user: User;
  clips: Clip[];
}

// Device sync status
export interface IDeviceSyncStatus {
  deviceId: string;
  deviceName: string;
  lastSyncedAt: Date | null;
  pendingChanges: number;
  isCurrentDevice: boolean;
}

// Device with sync statistics
export interface IDeviceWithSyncStats extends IDevice {
  stats: {
    totalClips: number;
    uniqueClips: number;
    syncedClips: number;
    pendingClips: number;
    conflictedClips: number;
    lastSyncAttempt: Date | null;
    lastSuccessfulSync: Date | null;
  };
}
```

## API/Methods
N/A - This is an interface definition file with no runtime code.

## Test Specifications
N/A - TypeScript interfaces cannot be tested directly, but their usage can be validated through TypeScript compilation.

## Implementation Notes
1. **Device Identification**:
   - Ensure device IDs are unique and consistent across sessions
   - Consider using hardware or browser fingerprinting for web clients
   - Support multiple device types (desktop, mobile, web, etc.)
   - Track device capabilities for feature availability

2. **Synchronization Strategy**:
   - Track which clips are available on which devices
   - Maintain last sync timestamps for incremental syncing
   - Handle conflict detection and resolution
   - Support offline capabilities with pending changes

3. **Security Considerations**:
   - Implement device authorization and verification
   - Allow users to remove or deauthorize devices
   - Consider device-specific encryption keys
   - Implement suspicious device detection

4. **Performance Aspects**:
   - Optimize sync operations for bandwidth and battery usage
   - Support partial syncing for large clip collections
   - Implement proper caching for device information
   - Consider push notifications for real-time updates

## Related Files
- src/services/device.service.ts
- src/services/sync.service.ts
- src/controllers/device.controller.ts
- src/middleware/device.middleware.ts
- src/dto/device.dto.ts
