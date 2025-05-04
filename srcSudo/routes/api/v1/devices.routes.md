# devices.routes.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This file defines the API routes for managing devices in the SuperClip application. It maps HTTP endpoints to the appropriate controller methods in the device controller and applies necessary middleware for authentication, validation, and security. The routes provide functionality for registering, retrieving, updating, and deleting devices, as well as managing device sync preferences and status.

## Dependencies

- External packages:
  - express
- Internal modules:
  - ../controllers/device.controller.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/validation.middleware.ts
  - ../middlewares/security.middleware.ts
  - ../middlewares/subscription.middleware.ts

## Route Definitions

### Register Device

- **Method**: POST
- **Path**: `/api/v1/devices`
- **Description**: Register a new device for the user
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates device registration data)
  - checkDeviceLimit (verifies user has not exceeded device limit based on subscription)
- **Controller**: DeviceController.registerDevice
- **Auth Required**: Yes

### Get User Devices

- **Method**: GET
- **Path**: `/api/v1/devices`
- **Description**: Get all devices registered to the authenticated user
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination and filter parameters)
- **Controller**: DeviceController.getUserDevices
- **Auth Required**: Yes

### Get Device

- **Method**: GET
- **Path**: `/api/v1/devices/:deviceId`
- **Description**: Get details for a specific device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.getDevice
- **Auth Required**: Yes

### Update Device

- **Method**: PUT
- **Path**: `/api/v1/devices/:deviceId`
- **Description**: Update a device's name, settings, or metadata
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - validateBody (validates update data)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.updateDevice
- **Auth Required**: Yes

### Delete Device

- **Method**: DELETE
- **Path**: `/api/v1/devices/:deviceId`
- **Description**: Remove a device from the user's account
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.deleteDevice
- **Auth Required**: Yes

### Set Device Status

- **Method**: PATCH
- **Path**: `/api/v1/devices/:deviceId/status`
- **Description**: Update the online/offline status of a device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - validateBody (validates status data)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.setDeviceStatus
- **Auth Required**: Yes

### Set Device as Primary

- **Method**: PATCH
- **Path**: `/api/v1/devices/:deviceId/primary`
- **Description**: Set a device as the user's primary device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.setPrimaryDevice
- **Auth Required**: Yes

### Update Device Sync Settings

- **Method**: PUT
- **Path**: `/api/v1/devices/:deviceId/sync`
- **Description**: Update sync settings for a specific device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - validateBody (validates sync settings)
  - checkDeviceOwnership (verifies user owns the device)
  - requireFeatureAccess('device_sync') (verifies user has sync feature access)
- **Controller**: DeviceController.updateDeviceSyncSettings
- **Auth Required**: Yes

### Get Device Sync Status

- **Method**: GET
- **Path**: `/api/v1/devices/:deviceId/sync/status`
- **Description**: Get the current sync status for a device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.getDeviceSyncStatus
- **Auth Required**: Yes

### Sync Device

- **Method**: POST
- **Path**: `/api/v1/devices/:deviceId/sync`
- **Description**: Trigger a manual sync for a device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - checkDeviceOwnership (verifies user owns the device)
  - requireFeatureAccess('device_sync') (verifies user has sync feature access)
- **Controller**: DeviceController.syncDevice
- **Auth Required**: Yes

### Get Device Activity

- **Method**: GET
- **Path**: `/api/v1/devices/:deviceId/activity`
- **Description**: Get recent activity for a specific device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - validateQuery (validates pagination and filter parameters)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.getDeviceActivity
- **Auth Required**: Yes

### Set Device Preferences

- **Method**: PUT
- **Path**: `/api/v1/devices/:deviceId/preferences`
- **Description**: Update preferences for a specific device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - validateBody (validates preference data)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.setDevicePreferences
- **Auth Required**: Yes

### Get Device Preferences

- **Method**: GET
- **Path**: `/api/v1/devices/:deviceId/preferences`
- **Description**: Get preferences for a specific device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.getDevicePreferences
- **Auth Required**: Yes

### Revoke Device Access

- **Method**: POST
- **Path**: `/api/v1/devices/:deviceId/revoke`
- **Description**: Revoke all active sessions for a device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.revokeDeviceAccess
- **Auth Required**: Yes

### Clear Device Data

- **Method**: POST
- **Path**: `/api/v1/devices/:deviceId/clear`
- **Description**: Clear all stored data from a device
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates device ID)
  - validateBody (validates clear request)
  - checkDeviceOwnership (verifies user owns the device)
- **Controller**: DeviceController.clearDeviceData
- **Auth Required**: Yes

### Get Device Statistics

- **Method**: GET
- **Path**: `/api/v1/devices/stats`
- **Description**: Get statistics about registered devices
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: DeviceController.getDeviceStats
- **Auth Required**: Yes

## Implementation Notes

### Device Management

- Devices represent physical or virtual devices that can access a user's clips
- Each device has a unique identifier, name, type, and status
- Device registration may include platform information, OS version, and app version
- Devices must be verified before full access is granted
- Implement limits on number of devices based on subscription tier

### Security Considerations

- Verify device ownership before all operations
- Implement secure device authentication and registration
- Protect device identifiers and metadata
- Apply rate limiting to prevent abuse
- Monitor and flag unusual device registration patterns
- Log device access and activity for security monitoring
- Implement device verification (email, SMS, etc.) for new devices

### Sync Functionality

- Support configurable sync preferences per device
- Implement efficient delta-sync mechanisms
- Support offline operation with conflict resolution
- Prioritize data categories for sync based on user preferences
- Implement bandwidth-aware syncing
- Support scheduled vs. real-time sync options

### Performance Considerations

- Optimize device verification processes
- Implement efficient device status tracking
- Use device capabilities for optimized content delivery
- Cache device preferences for faster access
- Implement device-specific content formatting
- Consider push notifications for sync operations

### Data Management

- Implement privacy-focused device data management
- Support device data wiping for security
- Track device usage metrics for optimization
- Implement device-specific data retention policies
- Support migration of settings between devices
- Maintain device access history

## Related Files

- srcSudo/controllers/device.controller.ts
- srcSudo/services/device.service.ts
- srcSudo/repositories/device.repository.ts
- srcSudo/models/interfaces/device.interface.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/middleware/validation.middleware.ts
- srcSudo/middleware/subscription.middleware.ts
