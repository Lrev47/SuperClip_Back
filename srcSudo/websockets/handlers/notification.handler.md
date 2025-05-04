# notification.handler.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This handler manages real-time notification delivery through WebSocket connections in the SuperClip application. It handles the sending, receiving, and management of various notification types including system alerts, sharing notifications, collaboration updates, and application events. The handler enables instant notification delivery to users across multiple devices and supports features like notification filtering, prioritization, and acknowledgment.

## Dependencies

- External packages:
  - socket.io (for WebSocket server)
- Internal modules:
  - ../../services/notification.service (for notification operations)
  - ../../services/user.service (for user preferences)
  - ../../types/websocket (for WebSocket type definitions)
  - ../../types/notification (for notification type definitions)
  - ../../utils/logger (for logging)
  - ../middleware/auth.middleware (for authenticated socket)

## Inputs/Outputs

- **Input**: Notification events and related data from server or clients
- **Output**: Notification events delivered to appropriate clients

## Data Types

```typescript
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/auth.middleware';

// Notification event types
export enum NotificationEventType {
  NEW = 'notification:new',
  READ = 'notification:read',
  READ_ALL = 'notification:read_all',
  DELETE = 'notification:delete',
  DELETE_ALL = 'notification:delete_all',
  UPDATE = 'notification:update',
  GET = 'notification:get',
  COUNT = 'notification:count',
  SETTINGS = 'notification:settings',
  ACK = 'notification:ack',
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Notification categories
export enum NotificationCategory {
  SYSTEM = 'system',
  SECURITY = 'security',
  SHARE = 'share',
  SUBSCRIPTION = 'subscription',
  CLIP_UPDATE = 'clip_update',
  FOLDER_UPDATE = 'folder_update',
  SET_UPDATE = 'set_update',
  COLLABORATION = 'collaboration',
}

// Notification data
export interface NotificationData {
  id?: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  createdAt?: number;
  expiresAt?: number;
  read?: boolean;
  data?: Record<string, any>;
  actionUrl?: string;
  targetDeviceId?: string;
}

// Notification settings
export interface NotificationSettings {
  enabledCategories: NotificationCategory[];
  minPriority: NotificationPriority;
  muteUntil?: number;
  doNotDisturb: boolean;
  soundEnabled: boolean;
  desktopNotificationsEnabled: boolean;
}

// Notification count response
export interface NotificationCountResponse {
  total: number;
  unread: number;
  byCategory: Record<NotificationCategory, number>;
}
```

## API/Methods

### registerNotificationHandlers

- Description: Registers all notification-related event handlers for a socket
- Signature: `registerNotificationHandlers(io: Server, socket: AuthenticatedSocket): void`
- Parameters:
  - io: Socket.IO server instance
  - socket: Authenticated socket connection
- Usage: `registerNotificationHandlers(io, socket)`

### handleGetNotifications

- Description: Handles request for retrieving notifications
- Signature: `handleGetNotifications(socket: AuthenticatedSocket, data?: { limit?: number, offset?: number, category?: NotificationCategory }): Promise<void>`
- Parameters:
  - socket: Authenticated socket
  - data: Optional query parameters
- Usage: `socket.on(NotificationEventType.GET, data => handleGetNotifications(socket, data))`

### handleNotificationRead

- Description: Marks notification(s) as read
- Signature: `handleNotificationRead(io: Server, socket: AuthenticatedSocket, data: { id: string | string[] }): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - socket: Authenticated socket
  - data: Notification ID or array of IDs
- Usage: `socket.on(NotificationEventType.READ, data => handleNotificationRead(io, socket, data))`

### handleNotificationDelete

- Description: Deletes notification(s)
- Signature: `handleNotificationDelete(socket: AuthenticatedSocket, data: { id: string | string[] }): Promise<void>`
- Parameters:
  - socket: Authenticated socket
  - data: Notification ID or array of IDs
- Usage: `socket.on(NotificationEventType.DELETE, data => handleNotificationDelete(socket, data))`

### sendNotification

- Description: Sends a notification to specific user(s)
- Signature: `sendNotification(io: Server, notification: NotificationData): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - notification: Notification data
- Usage: `sendNotification(io, { userId, title, message, category, priority })`

### broadcastNotification

- Description: Broadcasts a notification to multiple users
- Signature: `broadcastNotification(io: Server, userIds: string[], notification: Omit<NotificationData, 'userId'>): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - userIds: Array of user IDs
  - notification: Notification data without userId
- Usage: `broadcastNotification(io, affectedUsers, { title, message, category, priority })`

### handleNotificationSettings

- Description: Gets or updates notification settings
- Signature: `handleNotificationSettings(socket: AuthenticatedSocket, settings?: Partial<NotificationSettings>): Promise<void>`
- Parameters:
  - socket: Authenticated socket
  - settings: Optional settings to update
- Usage: `socket.on(NotificationEventType.SETTINGS, settings => handleNotificationSettings(socket, settings))`

### handleNotificationCount

- Description: Gets count of notifications
- Signature: `handleNotificationCount(socket: AuthenticatedSocket): Promise<void>`
- Parameters:
  - socket: Authenticated socket
- Usage: `socket.on(NotificationEventType.COUNT, () => handleNotificationCount(socket))`

### handleNotificationAck

- Description: Acknowledges receipt of a notification
- Signature: `handleNotificationAck(socket: AuthenticatedSocket, data: { id: string }): Promise<void>`
- Parameters:
  - socket: Authenticated socket
  - data: Notification ID
- Usage: `socket.on(NotificationEventType.ACK, data => handleNotificationAck(socket, data))`

## Event Definitions

### Incoming Events (Client to Server)

- **notification:get**: Request notifications
- **notification:read**: Mark notification(s) as read
- **notification:read_all**: Mark all notifications as read
- **notification:delete**: Delete notification(s)
- **notification:delete_all**: Delete all notifications
- **notification:settings**: Get or update notification settings
- **notification:count**: Get notification count
- **notification:ack**: Acknowledge notification receipt

### Outgoing Events (Server to Client)

- **notification:new**: New notification
- **notification:update**: Notification update
- **notification:count**: Notification count update

## Test Specifications

### Unit Tests

- Should retrieve user notifications correctly
- Should mark notifications as read correctly
- Should delete notifications correctly
- Should send notifications to specific users
- Should broadcast notifications to multiple users
- Should handle notification settings updates
- Should calculate notification counts correctly
- Should acknowledge notifications correctly

### Integration Tests

- Should deliver notifications in real-time
- Should respect user notification settings
- Should synchronize notification state across devices
- Should handle high volume of notifications
- Should maintain notification persistence correctly
- Should filter notifications by category

## Implementation Notes

1. **Notification Delivery Strategy**:

   - Deliver notifications in real-time to all active user devices
   - Store notifications for offline users
   - Support read status synchronization across devices
   - Implement notification expiration for time-sensitive alerts
   - Consider delivery priority for urgent notifications

2. **Performance Considerations**:

   - Implement pagination for notification history
   - Optimize delivery to multiple recipients
   - Handle high-volume notification scenarios
   - Consider caching frequently accessed notification data
   - Implement efficient notification storage and retrieval

3. **User Preferences**:

   - Support granular notification preferences
   - Allow category-based notification filtering
   - Implement do-not-disturb functionality
   - Support device-specific notification settings
   - Allow temporary notification muting

4. **Security Aspects**:

   - Verify recipient authorization for each notification
   - Sanitize notification content
   - Protect against notification spoofing
   - Implement rate limiting for notification requests
   - Log notification delivery for audit purposes

5. **Edge Cases**:
   - Handle notifications for users with multiple active sessions
   - Manage notification delivery during service disruptions
   - Implement retry logic for notification delivery failures
   - Support offline notification queuing
   - Handle notification storage limits and cleanup

## Related Files

- srcSudo/websockets/server.ts
- srcSudo/websockets/middleware/auth.middleware.ts
- srcSudo/services/notification.service.ts
- srcSudo/repositories/notification.repository.ts
- srcSudo/models/notification.model.ts
- srcSudo/types/notification.ts
