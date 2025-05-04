# sync.handler.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This handler manages real-time data synchronization through WebSocket connections in the SuperClip application. It enables bidirectional sync of clips, folders, sets, and other user data across multiple devices, providing instant updates when changes occur. The handler supports differential sync, conflict resolution, and optimized data transmission to ensure efficient and reliable synchronization regardless of connection quality or device capabilities.

## Dependencies

- External packages:
  - socket.io (for WebSocket server)
  - lodash (for deep comparison)
- Internal modules:
  - ../../services/sync.service (for sync operations)
  - ../../services/clip.service (for clip operations)
  - ../../services/folder.service (for folder operations)
  - ../../services/set.service (for set operations)
  - ../../types/websocket (for WebSocket type definitions)
  - ../../types/sync (for sync type definitions)
  - ../../utils/logger (for logging)
  - ../middleware/auth.middleware (for authenticated socket)

## Inputs/Outputs

- **Input**: Sync events with data changes from clients or server
- **Output**: Synchronized data and sync status events

## Data Types

```typescript
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/auth.middleware';

// Sync event types
export enum SyncEventType {
  SYNC_REQUEST = 'sync:request',
  SYNC_RESPONSE = 'sync:response',
  SYNC_ERROR = 'sync:error',
  SYNC_COMPLETE = 'sync:complete',
  SYNC_STATUS = 'sync:status',
  SYNC_CONFLICT = 'sync:conflict',
  ENTITY_UPDATED = 'sync:entity_updated',
  ENTITY_CREATED = 'sync:entity_created',
  ENTITY_DELETED = 'sync:entity_deleted',
  SYNC_START = 'sync:start',
  SYNC_PAUSE = 'sync:pause',
  SYNC_RESUME = 'sync:resume',
}

// Entity types that can be synced
export enum SyncEntityType {
  CLIP = 'clip',
  FOLDER = 'folder',
  SET = 'set',
  TAG = 'tag',
  TEMPLATE = 'template',
  SETTING = 'setting',
}

// Sync operation types
export enum SyncOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Sync change record
export interface SyncChange {
  id: string;
  entityType: SyncEntityType;
  operationType: SyncOperationType;
  timestamp: number;
  deviceId: string;
  userId: string;
  data?: any;
  version: number;
}

// Sync request parameters
export interface SyncRequest {
  deviceId: string;
  entities?: SyncEntityType[];
  lastSyncTimestamp?: number;
  limit?: number;
  includeDeleted?: boolean;
}

// Sync status information
export interface SyncStatus {
  deviceId: string;
  userId: string;
  lastSyncTimestamp: number;
  inProgress: boolean;
  entityCounts: Record<SyncEntityType, number>;
  lastError?: string;
  pendingChanges: number;
}

// Sync conflict
export interface SyncConflict {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  serverVersion: any;
  clientVersion: any;
  timestamp: number;
  resolved: boolean;
  winningVersion?: 'server' | 'client' | 'merged';
  mergedData?: any;
}
```

## API/Methods

### registerSyncHandlers

- Description: Registers all sync-related event handlers for a socket
- Signature: `registerSyncHandlers(io: Server, socket: AuthenticatedSocket): void`
- Parameters:
  - io: Socket.IO server instance
  - socket: Authenticated socket connection
- Usage: `registerSyncHandlers(io, socket)`

### handleSyncRequest

- Description: Handles client request for syncing data
- Signature: `handleSyncRequest(io: Server, socket: AuthenticatedSocket, request: SyncRequest): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - socket: Authenticated socket
  - request: Sync request parameters
- Usage: `socket.on(SyncEventType.SYNC_REQUEST, request => handleSyncRequest(io, socket, request))`

### handleEntityUpdated

- Description: Processes updates to entities from clients
- Signature: `handleEntityUpdated(io: Server, socket: AuthenticatedSocket, change: SyncChange): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - socket: Authenticated socket
  - change: Change data for the updated entity
- Usage: `socket.on(SyncEventType.ENTITY_UPDATED, change => handleEntityUpdated(io, socket, change))`

### handleEntityCreated

- Description: Processes newly created entities from clients
- Signature: `handleEntityCreated(io: Server, socket: AuthenticatedSocket, change: SyncChange): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - socket: Authenticated socket
  - change: Change data for the created entity
- Usage: `socket.on(SyncEventType.ENTITY_CREATED, change => handleEntityCreated(io, socket, change))`

### handleEntityDeleted

- Description: Processes entity deletions from clients
- Signature: `handleEntityDeleted(io: Server, socket: AuthenticatedSocket, change: SyncChange): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - socket: Authenticated socket
  - change: Change data for the deleted entity
- Usage: `socket.on(SyncEventType.ENTITY_DELETED, change => handleEntityDeleted(io, socket, change))`

### broadcastEntityChange

- Description: Broadcasts entity changes to relevant clients
- Signature: `broadcastEntityChange(io: Server, change: SyncChange, excludeSocket?: string): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - change: Entity change data
  - excludeSocket: Optional socket ID to exclude from broadcast
- Usage: `broadcastEntityChange(io, change, socket.id)`

### getSyncStatus

- Description: Gets current sync status for a device
- Signature: `getSyncStatus(socket: AuthenticatedSocket, deviceId: string): Promise<SyncStatus>`
- Parameters:
  - socket: Authenticated socket
  - deviceId: Device ID
- Returns: Promise resolving to sync status
- Usage: `const status = await getSyncStatus(socket, deviceId)`

### handleSyncConflictResolution

- Description: Handles client resolution of sync conflicts
- Signature: `handleSyncConflictResolution(socket: AuthenticatedSocket, resolution: { conflictId: string, winningVersion: 'server' | 'client' | 'merged', mergedData?: any }): Promise<void>`
- Parameters:
  - socket: Authenticated socket
  - resolution: Conflict resolution data
- Usage: `socket.on(SyncEventType.SYNC_CONFLICT, resolution => handleSyncConflictResolution(socket, resolution))`

### handleSyncStatusRequest

- Description: Handles client request for sync status
- Signature: `handleSyncStatusRequest(socket: AuthenticatedSocket, deviceId: string): Promise<void>`
- Parameters:
  - socket: Authenticated socket
  - deviceId: Device ID
- Usage: `socket.on(SyncEventType.SYNC_STATUS, deviceId => handleSyncStatusRequest(socket, deviceId))`

## Event Definitions

### Incoming Events (Client to Server)

- **sync:request**: Client requests data sync
- **sync:entity_updated**: Client reports entity update
- **sync:entity_created**: Client reports entity creation
- **sync:entity_deleted**: Client reports entity deletion
- **sync:conflict**: Client resolves sync conflict
- **sync:status**: Client requests sync status
- **sync:pause**: Client requests to pause sync
- **sync:resume**: Client requests to resume sync

### Outgoing Events (Server to Client)

- **sync:response**: Server sends sync data
- **sync:error**: Server reports sync error
- **sync:complete**: Server reports sync completion
- **sync:status**: Server sends sync status
- **sync:conflict**: Server reports sync conflict
- **sync:entity_updated**: Server broadcasts entity update
- **sync:entity_created**: Server broadcasts entity creation
- **sync:entity_deleted**: Server broadcasts entity deletion

## Test Specifications

### Unit Tests

- Should handle sync requests correctly
- Should process entity updates properly
- Should broadcast changes to appropriate clients
- Should detect and handle conflicts properly
- Should maintain accurate sync status
- Should manage conflict resolution correctly
- Should optimize data transfer for different sync scenarios

### Integration Tests

- Should synchronize data across multiple devices
- Should handle offline/reconnection scenarios
- Should maintain data integrity during concurrent changes
- Should respect subscription limitations
- Should perform efficiently with large datasets
- Should handle various connection quality scenarios

## Implementation Notes

1. **Sync Strategy**:

   - Implement delta-sync to minimize data transfer
   - Use timestamps and version tracking for change detection
   - Support both full and incremental sync operations
   - Maintain per-device sync state for reliable resumption
   - Implement batching for large dataset synchronization

2. **Conflict Resolution**:

   - Detect conflicts based on version history
   - Implement server-wins, client-wins, and manual merge strategies
   - Preserve all versions during conflict to prevent data loss
   - Provide clear conflict information to clients
   - Support interactive conflict resolution where appropriate

3. **Performance Considerations**:

   - Optimize payload size with selective field inclusion
   - Implement data compression for large transfers
   - Use pagination for large sync operations
   - Support partial entity sync for large objects
   - Prioritize critical data during constrained bandwidth

4. **Security Aspects**:

   - Validate all incoming sync data
   - Verify permissions for each entity operation
   - Implement rate limiting for sync operations
   - Log suspicious sync patterns
   - Prevent sync operations from exceeding user quotas

5. **Reliability Considerations**:
   - Implement retry logic for failed operations
   - Support resumable sync after disconnection
   - Handle timeouts gracefully
   - Provide feedback on sync progress
   - Implement transactional operations where appropriate

## Related Files

- srcSudo/websockets/server.ts
- srcSudo/websockets/middleware/auth.middleware.ts
- srcSudo/services/sync.service.ts
- srcSudo/repositories/sync.repository.ts
- srcSudo/controllers/sync.controller.ts
- srcSudo/models/sync.model.ts
- srcSudo/types/sync.ts
