# sync.routes.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This file defines the API routes for synchronization in the SuperClip application. It maps HTTP endpoints to the appropriate controller methods in the sync controller and applies necessary middleware for authentication, validation, and security. The routes provide functionality for syncing clips, folders, sets, and other data between devices, handling conflict resolution, and managing sync status and preferences.

## Dependencies

- External packages:
  - express
- Internal modules:
  - ../controllers/sync.controller.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/validation.middleware.ts
  - ../middlewares/security.middleware.ts
  - ../middlewares/subscription.middleware.ts
  - ../middlewares/rateLimit.middleware.ts

## Route Definitions

### Get Sync Status

- **Method**: GET
- **Path**: `/api/v1/sync/status`
- **Description**: Get the current sync status for the user across all devices
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: SyncController.getSyncStatus
- **Auth Required**: Yes

### Initiate Full Sync

- **Method**: POST
- **Path**: `/api/v1/sync/full`
- **Description**: Initiate a full sync for all data
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates sync options)
  - requireFeatureAccess('sync') (verifies user has sync feature access)
  - rateLimit('sync') (prevents sync abuse)
- **Controller**: SyncController.initiateFullSync
- **Auth Required**: Yes

### Sync Clips

- **Method**: POST
- **Path**: `/api/v1/sync/clips`
- **Description**: Sync clips only
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates clip sync data)
  - requireFeatureAccess('sync') (verifies user has sync feature access)
  - rateLimit('sync') (prevents sync abuse)
- **Controller**: SyncController.syncClips
- **Auth Required**: Yes

### Sync Folders

- **Method**: POST
- **Path**: `/api/v1/sync/folders`
- **Description**: Sync folders only
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates folder sync data)
  - requireFeatureAccess('sync') (verifies user has sync feature access)
  - rateLimit('sync') (prevents sync abuse)
- **Controller**: SyncController.syncFolders
- **Auth Required**: Yes

### Sync Sets

- **Method**: POST
- **Path**: `/api/v1/sync/sets`
- **Description**: Sync sets only
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates set sync data)
  - requireFeatureAccess('sync') (verifies user has sync feature access)
  - rateLimit('sync') (prevents sync abuse)
- **Controller**: SyncController.syncSets
- **Auth Required**: Yes

### Sync Tags

- **Method**: POST
- **Path**: `/api/v1/sync/tags`
- **Description**: Sync tags only
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates tag sync data)
  - requireFeatureAccess('sync') (verifies user has sync feature access)
  - rateLimit('sync') (prevents sync abuse)
- **Controller**: SyncController.syncTags
- **Auth Required**: Yes

### Sync Templates

- **Method**: POST
- **Path**: `/api/v1/sync/templates`
- **Description**: Sync templates only
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates template sync data)
  - requireFeatureAccess('sync') (verifies user has sync feature access)
  - rateLimit('sync') (prevents sync abuse)
- **Controller**: SyncController.syncTemplates
- **Auth Required**: Yes

### Get Changes

- **Method**: GET
- **Path**: `/api/v1/sync/changes`
- **Description**: Get changes since last sync
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates timestamp and entity types)
  - requireFeatureAccess('sync') (verifies user has sync feature access)
- **Controller**: SyncController.getChanges
- **Auth Required**: Yes

### Submit Changes

- **Method**: POST
- **Path**: `/api/v1/sync/changes`
- **Description**: Submit local changes to the server
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates changes data)
  - requireFeatureAccess('sync') (verifies user has sync feature access)
  - checkStorageLimit (verifies user has not exceeded storage quota)
  - rateLimit('sync') (prevents sync abuse)
- **Controller**: SyncController.submitChanges
- **Auth Required**: Yes

### Get Sync History

- **Method**: GET
- **Path**: `/api/v1/sync/history`
- **Description**: Get the history of sync operations
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination parameters)
- **Controller**: SyncController.getSyncHistory
- **Auth Required**: Yes

### Get Sync Conflicts

- **Method**: GET
- **Path**: `/api/v1/sync/conflicts`
- **Description**: Get current sync conflicts that need resolution
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination parameters)
- **Controller**: SyncController.getSyncConflicts
- **Auth Required**: Yes

### Resolve Conflict

- **Method**: POST
- **Path**: `/api/v1/sync/conflicts/:conflictId/resolve`
- **Description**: Resolve a specific sync conflict
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates conflict ID)
  - validateBody (validates resolution data)
- **Controller**: SyncController.resolveConflict
- **Auth Required**: Yes

### Update Sync Settings

- **Method**: PUT
- **Path**: `/api/v1/sync/settings`
- **Description**: Update user's global sync settings
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates sync settings)
  - requireFeatureAccess('sync') (verifies user has sync feature access)
- **Controller**: SyncController.updateSyncSettings
- **Auth Required**: Yes

### Get Sync Settings

- **Method**: GET
- **Path**: `/api/v1/sync/settings`
- **Description**: Get user's global sync settings
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: SyncController.getSyncSettings
- **Auth Required**: Yes

### Pause Sync

- **Method**: POST
- **Path**: `/api/v1/sync/pause`
- **Description**: Temporarily pause syncing
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: SyncController.pauseSync
- **Auth Required**: Yes

### Resume Sync

- **Method**: POST
- **Path**: `/api/v1/sync/resume`
- **Description**: Resume syncing after being paused
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: SyncController.resumeSync
- **Auth Required**: Yes

### Get Sync Statistics

- **Method**: GET
- **Path**: `/api/v1/sync/stats`
- **Description**: Get statistics about sync operations and usage
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: SyncController.getSyncStats
- **Auth Required**: Yes

### Reset Sync

- **Method**: POST
- **Path**: `/api/v1/sync/reset`
- **Description**: Reset sync state and start fresh (for troubleshooting)
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates reset confirmation)
- **Controller**: SyncController.resetSync
- **Auth Required**: Yes

## Implementation Notes

### Sync Management

- Implement an efficient delta-sync mechanism to only transfer changed data
- Support both full and partial sync operations
- Maintain sync timestamps for each entity type and device
- Implement conflict detection and resolution strategies
- Support offline operation with local changes queue
- Track sync history for debugging and troubleshooting
- Implement sync status indicators for better UX

### Conflict Resolution

- Implement automatic conflict resolution for non-critical conflicts
- Provide clear UI for manual conflict resolution when needed
- Support different resolution strategies (server wins, client wins, merge)
- Track conflict resolution choices for future automation
- Preserve all versions during conflict to prevent data loss
- Implement timeout for unresolved conflicts with fallback strategy

### Security Considerations

- Authenticate all sync operations
- Encrypt data during transmission
- Validate sync data for integrity and authenticity
- Check permissions before syncing shared resources
- Implement rate limiting to prevent abuse
- Log sync operations for security monitoring
- Sanitize sync data to prevent injection attacks

### Performance Considerations

- Optimize sync payload size with compression and selective fields
- Implement batch operations for multiple changes
- Use websockets for real-time sync when possible
- Implement retry logic with exponential backoff
- Consider bandwidth usage and provide options for metered connections
- Optimize conflict detection algorithms
- Support partial sync for large datasets

### Data Management

- Implement proper versioning for synced entities
- Handle deleted items appropriately (soft delete with tombstones)
- Manage attachment syncing separately from metadata
- Support selective sync for different data types
- Implement sync prioritization for critical data
- Maintain consistent data state across devices
- Support data migration during version changes

## Related Files

- srcSudo/controllers/sync.controller.ts
- srcSudo/services/sync.service.ts
- srcSudo/repositories/sync.repository.ts
- srcSudo/models/interfaces/sync.interface.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/middleware/validation.middleware.ts
- srcSudo/middleware/subscription.middleware.ts
- srcSudo/middleware/rateLimit.middleware.ts
