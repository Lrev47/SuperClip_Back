# device.controller.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the HTTP request handlers/controllers for device-related operations in the SuperClip application. The controller manages device registration, authentication, syncing status, and preferences. It validates incoming API requests, delegates business logic to the device service, and formats appropriate HTTP responses. Devices are essential for the multi-device clipboard synchronization feature of SuperClip.

## Dependencies
- External packages:
  - express
  - zod (for request validation)
  - http-status-codes
  - crypto (for device token generation)
- Internal modules:
  - ../services/device.service.ts
  - ../services/auth.service.ts
  - ../services/user.service.ts
  - ../utils/async-handler.ts
  - ../utils/error.ts
  - ../utils/logger.ts
  - ../utils/validators.ts
  - ../middlewares/auth.middleware.ts
  - ../models/interfaces/device.interface.ts

## Inputs/Outputs
- **Input**: HTTP requests (GET, POST, PUT, DELETE) with parameters, query strings, request bodies, and authorization headers
- **Output**: HTTP responses with appropriate status codes, device data in JSON format, and error messages

## Data Types
```typescript
// Request validation schemas
const registerDeviceSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['DESKTOP', 'MOBILE', 'TABLET', 'WEB', 'BROWSER_EXTENSION', 'OTHER']),
  deviceId: z.string().optional(), // System-generated device ID
  platform: z.string().optional(), // OS/platform info
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
  pushToken: z.string().optional(), // For push notifications
  settings: z.object({
    syncEnabled: z.boolean().optional().default(true),
    autoSync: z.boolean().optional().default(true),
    syncFrequency: z.number().int().min(0).optional(), // In seconds, 0 means real-time
    maxSyncItems: z.number().int().min(1).optional(),
    encryptSync: z.boolean().optional().default(true),
    notificationsEnabled: z.boolean().optional().default(true),
    clipboardMonitorEnabled: z.boolean().optional().default(true)
  }).optional()
});

const updateDeviceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  pushToken: z.string().optional().nullable(),
  lastActiveAt: z.string().datetime().optional(),
  settings: z.object({
    syncEnabled: z.boolean().optional(),
    autoSync: z.boolean().optional(),
    syncFrequency: z.number().int().min(0).optional(),
    maxSyncItems: z.number().int().optional(),
    encryptSync: z.boolean().optional(),
    notificationsEnabled: z.boolean().optional(),
    clipboardMonitorEnabled: z.boolean().optional()
  }).optional().partial()
});

const deviceSyncStatusSchema = z.object({
  syncState: z.enum(['SYNCING', 'SYNCED', 'ERROR', 'PAUSED']),
  lastSyncAt: z.string().datetime().optional(),
  syncErrorMessage: z.string().optional(),
  syncProgress: z.number().min(0).max(100).optional()
});

const deviceFilterSchema = z.object({
  active: z.boolean().optional(),
  type: z.enum(['DESKTOP', 'MOBILE', 'TABLET', 'WEB', 'BROWSER_EXTENSION', 'OTHER']).optional(),
  search: z.string().optional()
});
```

## API/Methods
```typescript
import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DeviceService } from '../services/device.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../utils/async-handler';
import { AppError, ErrorCode } from '../utils/error';
import { Logger } from '../utils/logger';
import { validateRequest } from '../utils/validators';
import { authenticate } from '../middlewares/auth.middleware';
import { 
  RegisterDeviceInput, 
  UpdateDeviceInput,
  DeviceSyncStatusInput,
  DeviceFilter
} from '../models/interfaces/device.interface';
import { z } from 'zod';
import crypto from 'crypto';

export class DeviceController {
  private router: Router;
  private deviceService: DeviceService;
  private authService: AuthService;
  private userService: UserService;
  private logger: Logger;

  constructor(
    deviceService: DeviceService,
    authService: AuthService,
    userService: UserService,
    logger: Logger
  ) {
    this.router = Router();
    this.deviceService = deviceService;
    this.authService = authService;
    this.userService = userService;
    this.logger = logger;
    
    this.setupRoutes();
  }

  /**
   * Setup all device routes
   */
  private setupRoutes(): void {
    // Public routes (no auth required)
    this.router.post('/register', validateRequest(registerDeviceSchema), this.registerDevice);
    this.router.post('/auth', this.authenticateDevice);
    
    // Protected routes
    this.router.use(authenticate);
    this.router.get('/', this.getUserDevices);
    this.router.get('/:deviceId', this.getDeviceById);
    this.router.put('/:deviceId', validateRequest(updateDeviceSchema), this.updateDevice);
    this.router.delete('/:deviceId', this.removeDevice);
    this.router.post('/:deviceId/revoke', this.revokeDeviceAccess);
    
    // Sync status routes
    this.router.put('/:deviceId/sync-status', validateRequest(deviceSyncStatusSchema), this.updateSyncStatus);
    this.router.get('/:deviceId/sync-status', this.getSyncStatus);
    this.router.post('/:deviceId/ping', this.pingDevice);
    
    // Device settings routes
    this.router.get('/:deviceId/settings', this.getDeviceSettings);
    this.router.put('/:deviceId/settings', this.updateDeviceSettings);
    
    // Current device
    this.router.get('/current', this.getCurrentDevice);
    
    // Remote actions
    this.router.post('/:deviceId/actions/clear-clipboard', this.clearRemoteClipboard);
    this.router.post('/:deviceId/actions/force-sync', this.forceRemoteSync);
  }

  /**
   * Register a new device
   * @param req Express request
   * @param res Express response
   */
  private registerDevice = asyncHandler(async (req: Request, res: Response) => {
    const deviceData: RegisterDeviceInput = req.body;
    
    // Generate a unique device ID if not provided
    if (!deviceData.deviceId) {
      deviceData.deviceId = crypto.randomUUID();
    }
    
    // If user is authenticated, associate device with user
    if (req.user?.id) {
      const newDevice = await this.deviceService.registerDevice(deviceData, req.user.id);
      res.status(StatusCodes.CREATED).json(newDevice);
    } else {
      // Create an unassociated device with a temporary token
      const { device, temporaryToken } = await this.deviceService.registerUnassociatedDevice(deviceData);
      
      res.status(StatusCodes.CREATED).json({
        device,
        temporaryToken,
        message: 'Device registered. Use this token to authenticate with a user account.'
      });
    }
  });

  /**
   * Authenticate a device with user credentials
   * @param req Express request
   * @param res Express response
   */
  private authenticateDevice = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, deviceId, temporaryToken } = req.body;
    
    if (!deviceId) {
      throw new AppError('Device ID is required', ErrorCode.BAD_REQUEST);
    }
    
    if ((!email || !password) && !temporaryToken) {
      throw new AppError('Either user credentials or a temporary token is required', ErrorCode.BAD_REQUEST);
    }
    
    let authResult;
    
    // Authenticate using temporary token
    if (temporaryToken) {
      authResult = await this.deviceService.authenticateDeviceWithToken(deviceId, temporaryToken);
    } else {
      // Authenticate using user credentials
      authResult = await this.deviceService.authenticateDeviceWithCredentials(
        deviceId, 
        email, 
        password
      );
    }
    
    res.status(StatusCodes.OK).json(authResult);
  });

  /**
   * Get all devices for the authenticated user
   * @param req Express request
   * @param res Express response
   */
  private getUserDevices = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const filters: DeviceFilter = {
      active: req.query.active === 'true',
      type: req.query.type as any,
      search: req.query.search as string
    };
    
    const devices = await this.deviceService.getUserDevices(userId, filters);
    
    res.status(StatusCodes.OK).json(devices);
  });

  /**
   * Get a device by ID
   * @param req Express request
   * @param res Express response
   */
  private getDeviceById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    res.status(StatusCodes.OK).json(device);
  });

  /**
   * Update a device
   * @param req Express request
   * @param res Express response
   */
  private updateDevice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    const updateData: UpdateDeviceInput = req.body;
    
    // Check if device belongs to user
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    const updatedDevice = await this.deviceService.updateDevice(deviceId, updateData);
    
    res.status(StatusCodes.OK).json(updatedDevice);
  });

  /**
   * Remove a device
   * @param req Express request
   * @param res Express response
   */
  private removeDevice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    
    // Check if device belongs to user
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    await this.deviceService.removeDevice(deviceId);
    
    res.status(StatusCodes.NO_CONTENT).send();
  });

  /**
   * Revoke a device's access
   * @param req Express request
   * @param res Express response
   */
  private revokeDeviceAccess = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    
    // Check if device belongs to user
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    await this.deviceService.revokeDeviceAccess(deviceId);
    
    res.status(StatusCodes.OK).json({
      message: 'Device access revoked successfully'
    });
  });

  /**
   * Update device sync status
   * @param req Express request
   * @param res Express response
   */
  private updateSyncStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    const syncStatus: DeviceSyncStatusInput = req.body;
    
    // Check if device belongs to user
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    const updatedStatus = await this.deviceService.updateSyncStatus(deviceId, syncStatus);
    
    res.status(StatusCodes.OK).json(updatedStatus);
  });

  /**
   * Get device sync status
   * @param req Express request
   * @param res Express response
   */
  private getSyncStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    
    // Check if device belongs to user
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    const syncStatus = await this.deviceService.getSyncStatus(deviceId);
    
    res.status(StatusCodes.OK).json(syncStatus);
  });

  /**
   * Ping a device to update its last active timestamp
   * @param req Express request
   * @param res Express response
   */
  private pingDevice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    
    // Check if device belongs to user
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    await this.deviceService.pingDevice(deviceId);
    
    res.status(StatusCodes.OK).json({
      message: 'Device pinged successfully',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get device settings
   * @param req Express request
   * @param res Express response
   */
  private getDeviceSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    
    // Check if device belongs to user
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    const settings = await this.deviceService.getDeviceSettings(deviceId);
    
    res.status(StatusCodes.OK).json(settings);
  });

  /**
   * Update device settings
   * @param req Express request
   * @param res Express response
   */
  private updateDeviceSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    const settings = req.body;
    
    // Check if device belongs to user
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    const updatedSettings = await this.deviceService.updateDeviceSettings(deviceId, settings);
    
    res.status(StatusCodes.OK).json(updatedSettings);
  });

  /**
   * Get current device information
   * @param req Express request
   * @param res Express response
   */
  private getCurrentDevice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const deviceId = req.headers['x-device-id'] as string;
    
    if (!deviceId) {
      throw new AppError('Device ID header is required', ErrorCode.BAD_REQUEST);
    }
    
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    res.status(StatusCodes.OK).json(device);
  });

  /**
   * Clear clipboard on a remote device
   * @param req Express request
   * @param res Express response
   */
  private clearRemoteClipboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    
    // Check if device belongs to user
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    await this.deviceService.sendRemoteAction(deviceId, 'CLEAR_CLIPBOARD');
    
    res.status(StatusCodes.OK).json({
      message: 'Clear clipboard request sent to device'
    });
  });

  /**
   * Force sync on a remote device
   * @param req Express request
   * @param res Express response
   */
  private forceRemoteSync = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    
    // Check if device belongs to user
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found', ErrorCode.NOT_FOUND);
    }
    
    await this.deviceService.sendRemoteAction(deviceId, 'FORCE_SYNC');
    
    res.status(StatusCodes.OK).json({
      message: 'Force sync request sent to device'
    });
  });

  /**
   * Get router
   * @returns Express router
   */
  public getRouter(): Router {
    return this.router;
  }
}

export default DeviceController;
```

## Test Specifications

### Unit Tests
1. **Controller Initialization**
   - Should initialize with all dependencies
   - Should setup all routes

2. **Request Validation**
   - Should validate device registration schema
   - Should validate device update schema
   - Should validate sync status schema
   - Should validate device filter parameters

3. **Route Handlers**
   - Each handler should:
     - Pass the correct data to the service methods
     - Return the correct status code
     - Return the correct response format
     - Handle errors properly

4. **Device Registration and Authentication**
   - Should generate a device ID when not provided
   - Should associate device with authenticated user
   - Should create unassociated device with temporary token
   - Should validate device authentication parameters

5. **Error Handling**
   - Should handle service errors
   - Should handle validation errors
   - Should check device ownership before performing operations
   - Should return appropriate error responses for invalid device IDs

### Integration Tests
1. **Device Registration and Authentication**
   - Should register a new device when user is authenticated
   - Should register a new device with temporary token when user is not authenticated
   - Should authenticate a device using user credentials
   - Should authenticate a device using a temporary token
   - Should reject authentication with invalid credentials or token

2. **Device Management**
   - Should retrieve all user devices with proper filtering
   - Should retrieve a specific device by ID
   - Should update device information
   - Should remove a device
   - Should revoke device access

3. **Sync Status Management**
   - Should update device sync status
   - Should retrieve device sync status
   - Should handle ping requests to update device activity
   - Should track last active timestamps correctly

4. **Device Settings**
   - Should retrieve device settings
   - Should update device settings
   - Should apply default settings for new devices

5. **Remote Actions**
   - Should send clear clipboard request to a device
   - Should send force sync request to a device
   - Should handle error cases when device is not reachable

6. **Security Checks**
   - Should prevent access to devices not owned by user
   - Should verify device ownership before any operation
   - Should handle device authentication securely

## Implementation Notes

### Error Handling and Validation
- Implement consistent error handling across all endpoints
- Validate all input data thoroughly before processing
- Check device ownership before allowing any operations
- Provide meaningful error messages for common failure scenarios
- Use try-catch blocks for critical operations

### Security Considerations
- Securely handle device authentication tokens
- Verify device ownership for all operations
- Prevent unauthorized device registration
- Implement proper device revocation
- Sanitize all device input data
- Use secure random generation for device IDs and tokens

### Performance Optimization
- Optimize device queries for quick authentication
- Cache device ownership information when practical
- Optimize ping operations for high-frequency updates
- Implement efficient device filtering for users with many devices
- Consider batch operations for managing multiple devices

### Device Synchronization
- Implement proper status tracking for sync operations
- Handle sync failures and retries gracefully
- Support real-time and scheduled synchronization
- Provide accurate progress tracking during sync operations
- Handle different sync strategies (full vs. incremental)

### Remote Device Management
- Implement secure channels for remote device commands
- Support various remote actions (clear clipboard, force sync)
- Handle offline devices appropriately
- Provide feedback on remote action status
- Implement queuing for remote commands to offline devices

### Edge Cases
- Handle lost or stolen devices through revocation
- Manage device token expiration appropriately
- Deal with conflicting sync operations
- Handle device type changes (e.g., app reinstallation)
- Manage device naming conflicts
- Handle multiple active sessions on the same device

## Related Files
- srcSudo/services/device.service.ts
- srcSudo/services/auth.service.ts
- srcSudo/services/sync.service.ts
- srcSudo/middlewares/auth.middleware.ts
- srcSudo/models/interfaces/device.interface.ts
- srcSudo/repositories/device.repository.ts
- srcSudo/utils/async-handler.ts
- srcSudo/utils/error.ts
- srcSudo/utils/validators.ts
