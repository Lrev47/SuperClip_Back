# sync.controller.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the HTTP request handlers/controllers for synchronization operations in the SuperClip application. The controller manages the synchronization of clipboard data (clips, sets, folders, and tags) across multiple devices, handles conflict resolution, and ensures data consistency. It provides endpoints for initiating sync, fetching sync status, handling incremental syncs, and resolving synchronization conflicts.

## Dependencies
- External packages:
  - express
  - zod (for request validation)
  - http-status-codes
  - uuid
- Internal modules:
  - ../services/sync.service.ts
  - ../services/device.service.ts
  - ../services/clip.service.ts
  - ../services/set.service.ts
  - ../services/folder.service.ts
  - ../services/tag.service.ts
  - ../utils/async-handler.ts
  - ../utils/error.ts
  - ../utils/logger.ts
  - ../utils/validators.ts
  - ../middlewares/auth.middleware.ts
  - ../models/interfaces/sync.interface.ts
  - ../models/interfaces/device.interface.ts

## Inputs/Outputs
- **Input**: HTTP requests (GET, POST, PUT) with parameters, query strings, sync data in the request body, and authorization headers
- **Output**: HTTP responses with appropriate status codes, synchronized data in JSON format, sync status updates, and potential conflict information

## Data Types
```typescript
// Request validation schemas
const syncRequestSchema = z.object({
  deviceId: z.string().uuid(),
  lastSyncedAt: z.string().datetime().optional(),
  includeTypes: z.array(
    z.enum(['CLIPS', 'SETS', 'FOLDERS', 'TAGS', 'DEVICE_SETTINGS', 'USER_PREFERENCES'])
  ).optional(),
  syncMode: z.enum(['FULL', 'INCREMENTAL', 'DIFFERENTIAL']).default('INCREMENTAL'),
  maxItems: z.number().int().optional(),
  compressionEnabled: z.boolean().optional().default(false),
  encryptionEnabled: z.boolean().optional().default(false)
});

const pushChangesSchema = z.object({
  deviceId: z.string().uuid(),
  syncId: z.string().uuid().optional(),
  changes: z.object({
    clips: z.array(z.object({
      id: z.string().uuid(),
      action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
      data: z.any().optional(),
      timestamp: z.string().datetime(),
      hash: z.string().optional()
    })).optional(),
    sets: z.array(z.object({
      id: z.string().uuid(),
      action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
      data: z.any().optional(),
      timestamp: z.string().datetime(),
      hash: z.string().optional()
    })).optional(),
    folders: z.array(z.object({
      id: z.string().uuid(),
      action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
      data: z.any().optional(),
      timestamp: z.string().datetime(),
      hash: z.string().optional()
    })).optional(),
    tags: z.array(z.object({
      id: z.string().uuid(),
      action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
      data: z.any().optional(),
      timestamp: z.string().datetime(),
      hash: z.string().optional()
    })).optional(),
    deviceSettings: z.array(z.object({
      id: z.string().uuid(),
      action: z.enum(['UPDATE']),
      data: z.any(),
      timestamp: z.string().datetime()
    })).optional(),
    userPreferences: z.array(z.object({
      id: z.string().uuid(),
      action: z.enum(['UPDATE']),
      data: z.any(),
      timestamp: z.string().datetime()
    })).optional()
  })
});

const resolveConflictsSchema = z.object({
  syncId: z.string().uuid(),
  deviceId: z.string().uuid(),
  resolutions: z.array(z.object({
    itemId: z.string().uuid(),
    itemType: z.enum(['CLIP', 'SET', 'FOLDER', 'TAG', 'DEVICE_SETTING', 'USER_PREFERENCE']),
    resolution: z.enum(['USE_SERVER', 'USE_CLIENT', 'MERGE', 'KEEP_BOTH']),
    mergedData: z.any().optional()
  }))
});

const syncStatusSchema = z.object({
  deviceId: z.string().uuid(),
  syncId: z.string().uuid().optional()
});
```

## API/Methods
```typescript
import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SyncService } from '../services/sync.service';
import { DeviceService } from '../services/device.service';
import { ClipService } from '../services/clip.service';
import { SetService } from '../services/set.service';
import { FolderService } from '../services/folder.service';
import { TagService } from '../services/tag.service';
import { asyncHandler } from '../utils/async-handler';
import { AppError, ErrorCode } from '../utils/error';
import { Logger } from '../utils/logger';
import { validateRequest } from '../utils/validators';
import { authenticate } from '../middlewares/auth.middleware';
import {
  SyncRequestInput,
  PushChangesInput,
  ResolveConflictsInput,
  SyncStatusInput,
  SyncResult,
  ConflictResolution
} from '../models/interfaces/sync.interface';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export class SyncController {
  private router: Router;
  private syncService: SyncService;
  private deviceService: DeviceService;
  private clipService: ClipService;
  private setService: SetService;
  private folderService: FolderService;
  private tagService: TagService;
  private logger: Logger;

  constructor(
    syncService: SyncService,
    deviceService: DeviceService,
    clipService: ClipService,
    setService: SetService,
    folderService: FolderService,
    tagService: TagService,
    logger: Logger
  ) {
    this.router = Router();
    this.syncService = syncService;
    this.deviceService = deviceService;
    this.clipService = clipService;
    this.setService = setService;
    this.folderService = folderService;
    this.tagService = tagService;
    this.logger = logger;
    
    this.setupRoutes();
  }

  /**
   * Setup all sync routes
   */
  private setupRoutes(): void {
    // All sync routes require authentication
    this.router.use(authenticate);
    
    // Main sync endpoints
    this.router.post('/pull', validateRequest(syncRequestSchema), this.pullChanges);
    this.router.post('/push', validateRequest(pushChangesSchema), this.pushChanges);
    this.router.post('/conflicts/resolve', validateRequest(resolveConflictsSchema), this.resolveConflicts);
    
    // Sync status endpoints
    this.router.get('/status/:syncId', this.getSyncStatus);
    this.router.post('/status', validateRequest(syncStatusSchema), this.checkSyncStatus);
    
    // Specialized sync endpoints
    this.router.post('/quick', this.quickSync);
    this.router.post('/force', this.forceSync);
    this.router.post('/initial', this.initialSync);
    
    // Utility endpoints
    this.router.get('/diff', this.calculateDiff);
    this.router.post('/validate', this.validateSyncData);
    this.router.post('/repair', this.repairSyncState);
  }

  /**
   * Pull changes from the server
   * @param req Express request
   * @param res Express response
   */
  private pullChanges = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const syncRequest: SyncRequestInput = req.body;
    
    // Verify device ownership
    const device = await this.deviceService.getDeviceById(syncRequest.deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found or not authorized', ErrorCode.NOT_FOUND);
    }
    
    // Generate a unique sync ID if not provided
    const syncId = uuidv4();
    
    // Begin synchronization process
    this.logger.info(`Starting pull sync for device ${syncRequest.deviceId} with sync ID ${syncId}`);
    
    // Update device sync status
    await this.deviceService.updateSyncStatus(syncRequest.deviceId, {
      syncState: 'SYNCING',
      lastSyncAt: new Date().toISOString(),
      syncProgress: 0
    });
    
    // Process sync request and get changes
    const result = await this.syncService.pullChanges(userId, syncRequest, syncId);
    
    // Update device sync status
    await this.deviceService.updateSyncStatus(syncRequest.deviceId, {
      syncState: result.hasConflicts ? 'ERROR' : 'SYNCED',
      lastSyncAt: new Date().toISOString(),
      syncErrorMessage: result.hasConflicts ? 'Conflicts detected' : undefined,
      syncProgress: 100
    });
    
    res.status(StatusCodes.OK).json({
      syncId,
      changes: result.changes,
      hasConflicts: result.hasConflicts,
      conflicts: result.conflicts,
      timestamp: new Date().toISOString(),
      syncCompleted: !result.hasConflicts
    });
  });

  /**
   * Push changes to the server
   * @param req Express request
   * @param res Express response
   */
  private pushChanges = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const pushData: PushChangesInput = req.body;
    
    // Verify device ownership
    const device = await this.deviceService.getDeviceById(pushData.deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found or not authorized', ErrorCode.NOT_FOUND);
    }
    
    // Generate a unique sync ID if not provided
    const syncId = pushData.syncId || uuidv4();
    
    // Update device sync status
    await this.deviceService.updateSyncStatus(pushData.deviceId, {
      syncState: 'SYNCING',
      lastSyncAt: new Date().toISOString(),
      syncProgress: 0
    });
    
    // Process changes
    const result = await this.syncService.pushChanges(userId, pushData, syncId);
    
    // Update device sync status
    await this.deviceService.updateSyncStatus(pushData.deviceId, {
      syncState: result.hasConflicts ? 'ERROR' : 'SYNCED',
      lastSyncAt: new Date().toISOString(),
      syncErrorMessage: result.hasConflicts ? 'Conflicts detected during push' : undefined,
      syncProgress: 100
    });
    
    res.status(StatusCodes.OK).json({
      syncId,
      hasConflicts: result.hasConflicts,
      conflicts: result.conflicts,
      changes: result.serverChanges,
      timestamp: new Date().toISOString(),
      syncCompleted: !result.hasConflicts
    });
  });

  /**
   * Resolve sync conflicts
   * @param req Express request
   * @param res Express response
   */
  private resolveConflicts = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const resolutionData: ResolveConflictsInput = req.body;
    
    // Verify device ownership
    const device = await this.deviceService.getDeviceById(resolutionData.deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found or not authorized', ErrorCode.NOT_FOUND);
    }
    
    // Process conflict resolutions
    const result = await this.syncService.resolveConflicts(
      userId,
      resolutionData.syncId,
      resolutionData.resolutions
    );
    
    // Update device sync status if all conflicts were resolved
    if (result.allResolved) {
      await this.deviceService.updateSyncStatus(resolutionData.deviceId, {
        syncState: 'SYNCED',
        lastSyncAt: new Date().toISOString(),
        syncErrorMessage: undefined,
        syncProgress: 100
      });
    }
    
    res.status(StatusCodes.OK).json({
      syncId: resolutionData.syncId,
      allResolved: result.allResolved,
      remainingConflicts: result.remainingConflicts,
      resolvedItems: result.resolvedItems,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get sync status by ID
   * @param req Express request
   * @param res Express response
   */
  private getSyncStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { syncId } = req.params;
    
    const status = await this.syncService.getSyncStatus(userId, syncId);
    
    if (!status) {
      throw new AppError('Sync session not found', ErrorCode.NOT_FOUND);
    }
    
    res.status(StatusCodes.OK).json(status);
  });

  /**
   * Check sync status for a device
   * @param req Express request
   * @param res Express response
   */
  private checkSyncStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const statusRequest: SyncStatusInput = req.body;
    
    // Verify device ownership
    const device = await this.deviceService.getDeviceById(statusRequest.deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found or not authorized', ErrorCode.NOT_FOUND);
    }
    
    const syncStatus = await this.deviceService.getSyncStatus(statusRequest.deviceId);
    
    // If a syncId is provided, get specific sync session status
    let sessionStatus = null;
    if (statusRequest.syncId) {
      sessionStatus = await this.syncService.getSyncStatus(userId, statusRequest.syncId);
    }
    
    // Check if there are any pending changes since last sync
    const hasPendingChanges = await this.syncService.hasPendingChanges(userId, statusRequest.deviceId);
    
    res.status(StatusCodes.OK).json({
      deviceSyncStatus: syncStatus,
      sessionStatus,
      hasPendingChanges,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Perform a quick sync (optimized for minimal changes)
   * @param req Express request
   * @param res Express response
   */
  private quickSync = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.body;
    
    if (!deviceId) {
      throw new AppError('Device ID is required', ErrorCode.BAD_REQUEST);
    }
    
    // Verify device ownership
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found or not authorized', ErrorCode.NOT_FOUND);
    }
    
    // Quick sync optimizes for speed with minimal data
    const result = await this.syncService.quickSync(userId, deviceId);
    
    res.status(StatusCodes.OK).json({
      syncId: result.syncId,
      changes: result.changes,
      hasConflicts: result.hasConflicts,
      conflicts: result.conflicts,
      timestamp: new Date().toISOString(),
      syncCompleted: !result.hasConflicts
    });
  });

  /**
   * Force a full sync
   * @param req Express request
   * @param res Express response
   */
  private forceSync = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.body;
    
    if (!deviceId) {
      throw new AppError('Device ID is required', ErrorCode.BAD_REQUEST);
    }
    
    // Verify device ownership
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found or not authorized', ErrorCode.NOT_FOUND);
    }
    
    // Force sync performs a complete sync of all data
    const result = await this.syncService.forceSync(userId, deviceId);
    
    res.status(StatusCodes.OK).json({
      syncId: result.syncId,
      changes: result.changes,
      timestamp: new Date().toISOString(),
      syncCompleted: true
    });
  });

  /**
   * Perform initial sync for a new device
   * @param req Express request
   * @param res Express response
   */
  private initialSync = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.body;
    
    if (!deviceId) {
      throw new AppError('Device ID is required', ErrorCode.BAD_REQUEST);
    }
    
    // Verify device ownership
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found or not authorized', ErrorCode.NOT_FOUND);
    }
    
    // Initial sync loads all user data for a new device
    const result = await this.syncService.initialSync(userId, deviceId);
    
    res.status(StatusCodes.OK).json({
      syncId: result.syncId,
      data: result.data,
      timestamp: new Date().toISOString(),
      syncCompleted: true
    });
  });

  /**
   * Calculate differences between server and client
   * @param req Express request
   * @param res Express response
   */
  private calculateDiff = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId, lastSyncedAt } = req.query;
    
    if (!deviceId) {
      throw new AppError('Device ID is required', ErrorCode.BAD_REQUEST);
    }
    
    // Verify device ownership
    const device = await this.deviceService.getDeviceById(deviceId as string, userId);
    
    if (!device) {
      throw new AppError('Device not found or not authorized', ErrorCode.NOT_FOUND);
    }
    
    // Calculate differences since last sync
    const diff = await this.syncService.calculateDiff(
      userId,
      deviceId as string,
      lastSyncedAt as string
    );
    
    res.status(StatusCodes.OK).json(diff);
  });

  /**
   * Validate sync data integrity
   * @param req Express request
   * @param res Express response
   */
  private validateSyncData = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId, dataHashes } = req.body;
    
    if (!deviceId) {
      throw new AppError('Device ID is required', ErrorCode.BAD_REQUEST);
    }
    
    // Verify device ownership
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found or not authorized', ErrorCode.NOT_FOUND);
    }
    
    // Validate data integrity
    const validationResult = await this.syncService.validateSyncData(userId, deviceId, dataHashes);
    
    res.status(StatusCodes.OK).json(validationResult);
  });

  /**
   * Repair sync state when inconsistencies are detected
   * @param req Express request
   * @param res Express response
   */
  private repairSyncState = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { deviceId } = req.body;
    
    if (!deviceId) {
      throw new AppError('Device ID is required', ErrorCode.BAD_REQUEST);
    }
    
    // Verify device ownership
    const device = await this.deviceService.getDeviceById(deviceId, userId);
    
    if (!device) {
      throw new AppError('Device not found or not authorized', ErrorCode.NOT_FOUND);
    }
    
    // Repair sync state
    const repairResult = await this.syncService.repairSyncState(userId, deviceId);
    
    res.status(StatusCodes.OK).json({
      repaired: repairResult.repaired,
      repairedItems: repairResult.repairedItems,
      message: repairResult.message,
      timestamp: new Date().toISOString()
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

export default SyncController;
```

## Test Specifications

### Unit Tests
1. **Controller Initialization**
   - Should initialize with all dependencies
   - Should setup all routes correctly

2. **Request Validation**
   - Should validate pull request schema
   - Should validate push changes schema
   - Should validate conflict resolution schema
   - Should validate sync status schema

3. **Route Handlers**
   - Each handler should:
     - Pass the correct data to the service methods
     - Return the correct status code
     - Return the expected response format
     - Handle errors properly
     - Verify device ownership before operations

4. **Device Verification**
   - Should verify device ownership for all operations
   - Should return 404 for devices not owned by the user
   - Should validate device ID format

5. **Sync ID Management**
   - Should generate a unique sync ID when not provided
   - Should use the provided sync ID when available
   - Should track sync session properly

6. **Error Handling**
   - Should handle service errors
   - Should handle validation errors
   - Should provide appropriate error responses for invalid inputs
   - Should handle synchronization conflicts correctly

### Integration Tests
1. **Pull Synchronization**
   - Should pull changes from the server successfully
   - Should handle incremental sync correctly
   - Should handle full sync correctly
   - Should update device sync status during and after sync
   - Should detect and report conflicts properly

2. **Push Synchronization**
   - Should push changes to the server successfully
   - Should handle client-side changes correctly
   - Should detect server-side conflicts during push
   - Should update the device sync status appropriately

3. **Conflict Resolution**
   - Should resolve conflicts with various resolution strategies
   - Should handle merged data properly
   - Should update sync status after conflict resolution
   - Should report remaining conflicts accurately

4. **Sync Status**
   - Should retrieve sync session status correctly
   - Should check device sync status accurately
   - Should report pending changes correctly

5. **Specialized Sync Operations**
   - Should perform quick sync successfully
   - Should execute force sync correctly
   - Should handle initial sync for new devices

6. **Utility Operations**
   - Should calculate differences correctly
   - Should validate data integrity
   - Should repair sync state when needed

7. **End-to-End Sync**
   - Should complete a full sync cycle (pull, push, resolve conflicts)
   - Should handle multiple devices syncing concurrently
   - Should maintain data consistency across devices

## Implementation Notes

### Synchronization Strategy
- Implement optimistic concurrency control for multi-device sync
- Support both full and incremental synchronization
- Track sync sessions with unique IDs
- Implement proper change tracking with timestamps
- Support different sync modes based on device capabilities and network conditions
- Design for minimizing data transfer (differential sync)

### Conflict Resolution
- Implement automatic conflict detection
- Support multiple resolution strategies (server wins, client wins, merge, keep both)
- Provide detailed conflict information to clients
- Design intuitive conflict resolution UI guidance
- Track resolution history for troubleshooting
- Support batch conflict resolution

### Performance Optimization
- Optimize for minimal data transfer
- Implement batching for large dataset synchronization
- Support compression for network efficiency
- Consider pagination for very large datasets
- Optimize database queries for sync operations
- Cache frequently accessed sync metadata

### Security Considerations
- Verify device ownership for all operations
- Validate all input data thoroughly
- Implement proper authentication for sync endpoints
- Support optional encryption for sensitive data
- Prevent unauthorized sync operations
- Validate data integrity using checksums/hashes

### Error Handling
- Implement comprehensive error handling
- Support sync recovery after failures
- Track sync failures with detailed diagnostics
- Provide meaningful error messages to clients
- Handle network interruptions gracefully
- Support resumable sync operations

### Edge Cases
- Handle disconnected operations and later synchronization
- Manage clock skew between devices
- Handle deleted users/devices during sync
- Support sync for shared resources with proper permissions
- Deal with version conflicts in schema changes
- Handle data migration during sync

## Related Files
- srcSudo/services/sync.service.ts
- srcSudo/services/device.service.ts
- srcSudo/services/clip.service.ts
- srcSudo/services/set.service.ts
- srcSudo/services/folder.service.ts
- srcSudo/services/tag.service.ts
- srcSudo/models/interfaces/sync.interface.ts
- srcSudo/repositories/sync.repository.ts
- srcSudo/repositories/clip.repository.ts
- srcSudo/repositories/set.repository.ts
- srcSudo/repositories/folder.repository.ts
- srcSudo/repositories/tag.repository.ts
- srcSudo/utils/sync-helpers.ts
- srcSudo/middlewares/auth.middleware.ts
