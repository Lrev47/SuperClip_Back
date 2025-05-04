import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import {
  authenticate,
  validateToken,
  attachUserToSocket,
  verifyDevice,
  handleDisconnect,
} from '../../../../src/websockets/middleware/auth.middleware';
import * as encryption from '../../../../src/utils/encryption';
import * as authService from '../../../../src/services/auth.service';
import * as deviceService from '../../../../src/services/device.service';
import { mock, MockProxy } from 'jest-mock-extended';
import { TokenPayload } from '../../../../src/utils/encryption';
import { AuthenticatedSocket, WebSocketAuthData } from '../../../../src/types/websocket';

// Mock dependencies
jest.mock('../../../../src/utils/encryption');
jest.mock('../../../../src/services/auth.service');
jest.mock('../../../../src/services/device.service');
jest.mock('../../../../src/utils/logger');

describe('WebSocket Auth Middleware', () => {
  let mockSocket: MockProxy<Socket> & Socket;
  let mockNext: jest.Mock;
  let mockUser: any;
  let mockTokenPayload: TokenPayload;
  let mockAuthData: WebSocketAuthData;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up mocks
    mockSocket = mock<Socket>();
    mockNext = jest.fn();
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'USER',
    };

    mockTokenPayload = {
      userId: mockUser.id,
      deviceId: 'device-123',
      hasSubscription: true,
    };

    mockAuthData = {
      token: 'valid-token',
      deviceId: 'device-123',
    };

    // Set up mock socket handshake
    mockSocket.handshake = {
      auth: mockAuthData,
      headers: {},
      query: {},
      address: '',
      issued: 0,
      secure: false,
      time: '',
    };

    // Mock encryption.verifyToken to return valid payload
    (encryption.verifyToken as jest.Mock).mockResolvedValue(mockTokenPayload);

    // Mock authService.getUserById to return user
    (authService.getUserById as jest.Mock).mockResolvedValue(mockUser);

    // Mock deviceService.verifyDeviceForUser to return true
    (deviceService.verifyDeviceForUser as jest.Mock).mockResolvedValue(true);
  });

  describe('authenticate middleware', () => {
    it('should authenticate valid requests with token and attach user', async () => {
      // Arrange
      const authMiddleware = authenticate();

      // Act
      await authMiddleware(mockSocket, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockSocket.user).toEqual(mockUser);
      expect(mockSocket.deviceId).toEqual(mockAuthData.deviceId);
      expect(mockSocket.isAuthenticated).toBe(true);
    });

    it('should reject requests without auth token', async () => {
      // Arrange
      const authMiddleware = authenticate();
      mockSocket.handshake.auth = {};

      // Act
      await authMiddleware(mockSocket, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toContain('Authentication required');
    });

    it('should reject requests with invalid tokens', async () => {
      // Arrange
      const authMiddleware = authenticate();
      (encryption.verifyToken as jest.Mock).mockResolvedValue(null);

      // Act
      await authMiddleware(mockSocket, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toContain('Invalid token');
    });

    it('should reject requests when user not found', async () => {
      // Arrange
      const authMiddleware = authenticate();
      (authService.getUserById as jest.Mock).mockResolvedValue(null);

      // Act
      await authMiddleware(mockSocket, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toContain('User not found');
    });

    it('should reject requests from unauthorized devices', async () => {
      // Arrange
      const authMiddleware = authenticate();
      (deviceService.verifyDeviceForUser as jest.Mock).mockResolvedValue(false);

      // Act
      await authMiddleware(mockSocket, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toContain('Unauthorized device');
    });

    it('should handle errors during authentication', async () => {
      // Arrange
      const authMiddleware = authenticate();
      const error = new Error('Test error');
      (encryption.verifyToken as jest.Mock).mockRejectedValue(error);

      // Act
      await authMiddleware(mockSocket, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toContain('Authentication error');
    });
  });

  describe('validateToken', () => {
    it('should return token payload for valid token', async () => {
      // Act
      const result = await validateToken('valid-token');

      // Assert
      expect(result).toEqual(mockTokenPayload);
      expect(encryption.verifyToken).toHaveBeenCalledWith('valid-token');
    });

    it('should return null for invalid token', async () => {
      // Arrange
      (encryption.verifyToken as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await validateToken('invalid-token');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle errors during token validation', async () => {
      // Arrange
      (encryption.verifyToken as jest.Mock).mockRejectedValue(new Error('Validation error'));

      // Act
      const result = await validateToken('error-token');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('attachUserToSocket', () => {
    it('should attach user to socket if user found', async () => {
      // Act
      const result = await attachUserToSocket(mockSocket, mockUser.id);

      // Assert
      expect(result).toBe(true);
      expect(mockSocket.user).toEqual(mockUser);
    });

    it('should return false if user not found', async () => {
      // Arrange
      (authService.getUserById as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await attachUserToSocket(mockSocket, 'nonexistent-user');

      // Assert
      expect(result).toBe(false);
    });

    it('should handle errors during user retrieval', async () => {
      // Arrange
      (authService.getUserById as jest.Mock).mockRejectedValue(new Error('Retrieval error'));

      // Act
      const result = await attachUserToSocket(mockSocket, mockUser.id);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('verifyDevice', () => {
    it('should return true for valid device', async () => {
      // Act
      const result = await verifyDevice(mockUser.id, 'device-123');

      // Assert
      expect(result).toBe(true);
      expect(deviceService.verifyDeviceForUser).toHaveBeenCalledWith(mockUser.id, 'device-123');
    });

    it('should return false for invalid device', async () => {
      // Arrange
      (deviceService.verifyDeviceForUser as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await verifyDevice(mockUser.id, 'invalid-device');

      // Assert
      expect(result).toBe(false);
    });

    it('should handle errors during device verification', async () => {
      // Arrange
      (deviceService.verifyDeviceForUser as jest.Mock).mockRejectedValue(
        new Error('Verification error'),
      );

      // Act
      const result = await verifyDevice(mockUser.id, 'device-123');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('handleDisconnect', () => {
    it('should handle socket disconnection', () => {
      // Arrange
      const mockAuthSocket = {
        ...mockSocket,
        id: 'socket-123',
        user: mockUser,
        deviceId: 'device-123',
        isAuthenticated: true,
      } as AuthenticatedSocket;

      // Act
      handleDisconnect(mockAuthSocket);

      // Assert
      // Here we would typically verify logging was called correctly,
      // but since we're mocking the logger, we'll just ensure no errors are thrown
      expect(() => handleDisconnect(mockAuthSocket)).not.toThrow();
    });
  });
});
