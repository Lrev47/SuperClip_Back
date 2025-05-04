# auth.middleware.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This middleware provides authentication and authorization mechanisms for WebSocket connections in the SuperClip application. It verifies connection requests, authenticates users via JWT tokens, and ensures that only authorized users can establish and maintain WebSocket connections. It also attaches user and device information to the socket for use by WebSocket handlers.

## Dependencies

- External packages:
  - socket.io (for WebSocket server)
  - jsonwebtoken (for token verification)
- Internal modules:
  - ../../utils/encryption (for token verification)
  - ../../services/auth.service (for user verification)
  - ../../services/device.service (for device validation)
  - ../../types/websocket (for WebSocket type definitions)

## Inputs/Outputs

- **Input**: Socket connection handshake with authentication data
- **Output**: Authenticated socket connection or disconnection with error

## Data Types

```typescript
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

// Authentication data in handshake
export interface WebSocketAuthData {
  token?: string;
  deviceId?: string;
}

// Extended socket with user and device information
export interface AuthenticatedSocket
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap> {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  deviceId?: string;
  isAuthenticated: boolean;
}

// Middleware function type
export type WebSocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;
```

## API/Methods

### authenticate

- Description: Main authentication middleware for WebSocket connections
- Signature: `authenticate(): WebSocketMiddleware`
- Returns: Socket.IO middleware function that authenticates connections
- Usage: `io.use(authenticate())`

### validateToken

- Description: Validates the JWT token provided in the connection handshake
- Signature: `validateToken(token: string): Promise<TokenPayload | null>`
- Parameters:
  - token: JWT token string from handshake
- Returns: Promise resolving to token payload or null if invalid
- Usage: `const payload = await validateToken(socket.handshake.auth.token)`

### attachUserToSocket

- Description: Attaches user data to the socket instance
- Signature: `attachUserToSocket(socket: Socket, userId: string): Promise<boolean>`
- Parameters:
  - socket: Socket instance
  - userId: User ID from token
- Returns: Promise resolving to boolean indicating success
- Usage: `await attachUserToSocket(socket, payload.userId)`

### verifyDevice

- Description: Verifies if the device is authorized for this user
- Signature: `verifyDevice(userId: string, deviceId: string): Promise<boolean>`
- Parameters:
  - userId: User ID from token
  - deviceId: Device ID from handshake
- Returns: Promise resolving to boolean indicating if device is valid
- Usage: `const isValidDevice = await verifyDevice(payload.userId, socket.handshake.auth.deviceId)`

### handleDisconnect

- Description: Handles logging and cleanup on socket disconnection
- Signature: `handleDisconnect(socket: AuthenticatedSocket): void`
- Parameters:
  - socket: Authenticated socket instance
- Usage: `socket.on('disconnect', () => handleDisconnect(socket))`

## Test Specifications

### Unit Tests

- Should reject connections without authentication token
- Should reject connections with invalid tokens
- Should reject connections with expired tokens
- Should reject connections with unauthorized devices
- Should properly attach user data to socket
- Should track connected users and devices

### Integration Tests

- Should authenticate valid WebSocket connections
- Should maintain authentication across reconnects
- Should properly disconnect unauthorized attempts
- Should handle concurrent connections from the same user

## Implementation Notes

1. **Security Considerations**:

   - Validate tokens on every connection
   - Implement rate limiting for connection attempts
   - Monitor and log failed authentication attempts
   - Handle reconnection attempts securely
   - Validate origin of WebSocket connections

2. **Performance Considerations**:

   - Cache user data to avoid repeated database lookups
   - Use efficient token validation
   - Properly manage socket connections and disconnections
   - Consider the impact of many simultaneous connections

3. **Connection Lifecycle**:

   - Connection attempt with auth data
   - Token validation
   - User data retrieval and validation
   - Device validation (if applicable)
   - Connection established or rejected
   - Periodic revalidation of long-lived connections
   - Proper cleanup on disconnection

4. **Error Handling**:

   - Provide clear error messages for connection issues
   - Log authentication failures
   - Handle different types of auth failures appropriately
   - Avoid exposing sensitive information in error messages

5. **Edge Cases**:
   - Handle token expiration during active connections
   - Manage device revocation during active connections
   - Accommodate users connecting from multiple devices
   - Handle network interruptions gracefully

## Related Files

- srcSudo/websockets/server.ts
- srcSudo/websockets/handlers/auth.handler.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/services/auth.service.ts
- srcSudo/services/device.service.ts
- srcSudo/types/websocket.ts
