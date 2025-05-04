# auth.handler.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This handler manages authentication-related WebSocket events in the SuperClip application. It handles user authentication status updates, session management, and device authorization through WebSocket connections. The handler enables real-time authentication state synchronization across multiple devices and provides immediate feedback for authentication events like login, logout, or session expiration.

## Dependencies

- External packages:
  - socket.io (for WebSocket server)
- Internal modules:
  - ../../services/auth.service (for authentication operations)
  - ../../services/device.service (for device management)
  - ../../services/session.service (for session tracking)
  - ../../types/websocket (for WebSocket type definitions)
  - ../../utils/logger (for logging)

## Inputs/Outputs

- **Input**: Authentication-related socket events and associated data
- **Output**: Socket events with authentication status updates and session information

## Data Types

```typescript
import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/auth.middleware';

// Authentication event types
export enum AuthEventType {
  LOGIN = 'auth:login',
  LOGOUT = 'auth:logout',
  SESSION_EXPIRED = 'auth:session_expired',
  DEVICE_AUTHORIZED = 'auth:device_authorized',
  DEVICE_REVOKED = 'auth:device_revoked',
  SESSION_UPDATE = 'auth:session_update',
  AUTHENTICATE = 'auth:authenticate',
  AUTHENTICATION_FAILED = 'auth:authentication_failed',
  AUTHENTICATION_SUCCESS = 'auth:authentication_success',
}

// Authentication event data
export interface AuthEventData {
  userId?: string;
  deviceId?: string;
  sessionId?: string;
  timestamp?: number;
  reason?: string;
  token?: string;
  expiresAt?: number;
}

// Session information
export interface SessionInfo {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  lastActive: number;
  isCurrentSession: boolean;
}
```

## API/Methods

### registerAuthHandlers

- Description: Registers all authentication-related event handlers for a socket
- Signature: `registerAuthHandlers(io: Server, socket: AuthenticatedSocket): void`
- Parameters:
  - io: Socket.IO server instance
  - socket: Authenticated socket connection
- Usage: `registerAuthHandlers(io, socket)`

### handleAuthenticate

- Description: Handles client-initiated authentication using token
- Signature: `handleAuthenticate(io: Server, socket: Socket, data: AuthEventData): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - socket: Socket connection
  - data: Authentication data with token
- Usage: `socket.on(AuthEventType.AUTHENTICATE, data => handleAuthenticate(io, socket, data))`

### handleLogout

- Description: Handles user logout events
- Signature: `handleLogout(io: Server, socket: AuthenticatedSocket, data: AuthEventData): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - socket: Authenticated socket
  - data: Logout event data
- Usage: `socket.on(AuthEventType.LOGOUT, data => handleLogout(io, socket, data))`

### broadcastSessionExpired

- Description: Broadcasts session expiration to all user's devices
- Signature: `broadcastSessionExpired(io: Server, userId: string, sessionId: string): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - userId: ID of user whose session expired
  - sessionId: ID of expired session
- Usage: `broadcastSessionExpired(io, user.id, session.id)`

### broadcastDeviceRevoked

- Description: Broadcasts device revocation to affected devices
- Signature: `broadcastDeviceRevoked(io: Server, userId: string, deviceId: string): Promise<void>`
- Parameters:
  - io: Socket.IO server instance
  - userId: User ID
  - deviceId: Revoked device ID
- Usage: `broadcastDeviceRevoked(io, user.id, device.id)`

### getUserActiveSessions

- Description: Gets active sessions for a user
- Signature: `getUserActiveSessions(userId: string, currentSessionId: string): Promise<SessionInfo[]>`
- Parameters:
  - userId: User ID
  - currentSessionId: Current session ID
- Returns: Promise resolving to array of session information
- Usage: `const sessions = await getUserActiveSessions(user.id, socket.id)`

### handleSessionRequest

- Description: Handles client request for active sessions
- Signature: `handleSessionRequest(socket: AuthenticatedSocket): Promise<void>`
- Parameters:
  - socket: Authenticated socket
- Usage: `socket.on(AuthEventType.SESSION_UPDATE, () => handleSessionRequest(socket))`

## Event Definitions

### Incoming Events (Client to Server)

- **auth:authenticate**: Client authenticates with token
- **auth:logout**: Client initiates logout
- **auth:session_update**: Client requests current sessions

### Outgoing Events (Server to Client)

- **auth:authentication_success**: Authentication successful
- **auth:authentication_failed**: Authentication failed
- **auth:session_expired**: Session has expired
- **auth:device_revoked**: Device access revoked
- **auth:session_update**: Update of active sessions

## Test Specifications

### Unit Tests

- Should handle authentication with valid token
- Should reject authentication with invalid token
- Should properly handle logout requests
- Should broadcast session expiration correctly
- Should retrieve active user sessions correctly
- Should handle session update requests
- Should broadcast device revocation properly

### Integration Tests

- Should authenticate socket connections correctly
- Should manage concurrent sessions from different devices
- Should propagate authentication events to all user devices
- Should maintain session list accuracy
- Should terminate connections for revoked devices

## Implementation Notes

1. **Authentication Flow**:

   - Client initiates authentication with token
   - Server validates token and attaches user data
   - Server notifies client of authentication result
   - Server maintains mapping of userId to connected sockets

2. **Session Management**:

   - Track active sessions per user
   - Update session activity timestamps
   - Support viewing and managing sessions from any device
   - Handle session timeout and expiration
   - Support forced logout from other sessions

3. **Security Considerations**:

   - Verify token on every authentication event
   - Use secure token handling practices
   - Implement rate limiting for authentication attempts
   - Log suspicious authentication activities
   - Promptly broadcast revocation events

4. **Multi-device Support**:

   - Handle same user connecting from multiple devices
   - Synchronize authentication state across devices
   - Allow selective session termination
   - Support different revocation scopes (single device, all devices)

5. **Error Handling**:
   - Send clear error messages for authentication failures
   - Handle timeout and network errors gracefully
   - Log authentication errors for security monitoring
   - Implement reconnection strategies for temporary issues

## Related Files

- srcSudo/websockets/server.ts
- srcSudo/websockets/middleware/auth.middleware.ts
- srcSudo/services/auth.service.ts
- srcSudo/services/session.service.ts
- srcSudo/services/device.service.ts
- srcSudo/controllers/auth.controller.ts
