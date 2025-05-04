import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { mock, MockProxy } from 'jest-mock-extended';
import {
  AuthHandlerFunctions,
  initAuthHandler,
} from '../../../../src/websockets/handlers/auth.handler';
import { UserService } from '../../../../src/services/user.service';
import { TokenService } from '../../../../src/services/token.service';
import { DeviceService } from '../../../../src/services/device.service';

// Mock dependencies
jest.mock('../../../../src/services/user.service');
jest.mock('../../../../src/services/token.service');
jest.mock('../../../../src/services/device.service');
jest.mock('../../../../src/utils/logger');

describe('WebSocket Auth Handler', () => {
  let mockSocket: MockProxy<Socket> & Socket;
  let mockIo: MockProxy<Server> & Server;
  let mockUserService: jest.Mocked<UserService>;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockDeviceService: jest.Mocked<DeviceService>;
  let authHandler: AuthHandlerFunctions;

  // Define interface for socket data to avoid TypeScript errors
  interface SocketData {
    user?: {
      id: string;
      email: string;
    };
    deviceId?: string;
  }

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mocks
    mockSocket = mock<Socket>();
    mockIo = mock<Server>();
    mockUserService = {
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      validateUserPassword: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    mockTokenService = {
      createAuthTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    mockDeviceService = {
      findOrCreateDevice: jest.fn(),
      updateDeviceLastActive: jest.fn(),
    } as unknown as jest.Mocked<DeviceService>;

    // Mock socket methods
    mockSocket.on = jest.fn().mockReturnThis();
    mockSocket.emit = jest.fn().mockReturnThis();
    mockSocket.join = jest.fn().mockReturnThis();
    mockSocket.leave = jest.fn().mockReturnThis();
    mockSocket.disconnect = jest.fn();

    // Set up socket data (initially empty)
    (mockSocket as any).data = {} as SocketData;

    // Initialize the auth handler
    authHandler = initAuthHandler(mockIo, {
      userService: mockUserService,
      tokenService: mockTokenService,
      deviceService: mockDeviceService,
    });
  });

  describe('registerEvents', () => {
    it('should register all auth-related events on the socket', () => {
      // Act
      authHandler.registerEvents(mockSocket);

      // Assert
      expect(mockSocket.on).toHaveBeenCalledWith('auth:login', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('auth:token', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('auth:refresh', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('auth:logout', expect.any(Function));
    });
  });

  describe('handleLogin', () => {
    it('should authenticate user with valid credentials, create device, and emit success', async () => {
      // Arrange
      const credentials = {
        email: 'user@example.com',
        password: 'password123',
        deviceName: 'Test Device',
      };

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
      };

      const mockDevice = {
        id: 'device-123',
        userId: 'user-123',
        name: 'Test Device',
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      };

      mockUserService.findUserByEmail.mockResolvedValue(mockUser);
      mockUserService.validateUserPassword.mockResolvedValue(true);
      mockDeviceService.findOrCreateDevice.mockResolvedValue(mockDevice);
      mockTokenService.createAuthTokens.mockResolvedValue(mockTokens);

      // Extract handler function
      let loginHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'auth:login') {
          loginHandler = handler;
        }
        return mockSocket;
      });

      authHandler.registerEvents(mockSocket);

      // Ensure handler was registered
      expect(loginHandler).toBeDefined();

      // Act
      if (loginHandler) {
        await loginHandler.call(mockSocket, credentials);
      }

      // Assert
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockUserService.validateUserPassword).toHaveBeenCalledWith(
        mockUser,
        credentials.password,
      );
      expect(mockDeviceService.findOrCreateDevice).toHaveBeenCalledWith(
        mockUser.id,
        credentials.deviceName,
      );
      expect(mockTokenService.createAuthTokens).toHaveBeenCalledWith(mockUser.id, mockDevice.id);

      // Check that socket data was updated
      expect((mockSocket as any).data.user).toEqual(mockUser);
      expect((mockSocket as any).data.deviceId).toEqual(mockDevice.id);

      // Check that socket joined the appropriate rooms
      expect(mockSocket.join).toHaveBeenCalledWith(`user:${mockUser.id}`);
      expect(mockSocket.join).toHaveBeenCalledWith(`user:${mockUser.id}:device:${mockDevice.id}`);

      // Check that successful login response was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:login:success', {
        user: mockUser,
        tokens: mockTokens,
        device: mockDevice,
      });
    });

    it('should emit error with invalid email', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
        deviceName: 'Test Device',
      };

      mockUserService.findUserByEmail.mockResolvedValue(null);

      // Extract handler function
      let loginHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'auth:login') {
          loginHandler = handler;
        }
        return mockSocket;
      });

      authHandler.registerEvents(mockSocket);

      // Act
      if (loginHandler) {
        await loginHandler.call(mockSocket, credentials);
      }

      // Assert
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockUserService.validateUserPassword).not.toHaveBeenCalled();
      expect(mockDeviceService.findOrCreateDevice).not.toHaveBeenCalled();
      expect(mockTokenService.createAuthTokens).not.toHaveBeenCalled();

      // Check that error response was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:login:error', {
        message: 'Invalid email or password',
      });
    });

    it('should emit error with invalid password', async () => {
      // Arrange
      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword',
        deviceName: 'Test Device',
      };

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
      };

      mockUserService.findUserByEmail.mockResolvedValue(mockUser);
      mockUserService.validateUserPassword.mockResolvedValue(false);

      // Extract handler function
      let loginHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'auth:login') {
          loginHandler = handler;
        }
        return mockSocket;
      });

      authHandler.registerEvents(mockSocket);

      // Act
      if (loginHandler) {
        await loginHandler.call(mockSocket, credentials);
      }

      // Assert
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockUserService.validateUserPassword).toHaveBeenCalledWith(
        mockUser,
        credentials.password,
      );
      expect(mockDeviceService.findOrCreateDevice).not.toHaveBeenCalled();
      expect(mockTokenService.createAuthTokens).not.toHaveBeenCalled();

      // Check that error response was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:login:error', {
        message: 'Invalid email or password',
      });
    });
  });

  describe('handleTokenAuth', () => {
    it('should authenticate with valid token, update device, and emit success', async () => {
      // Arrange
      const tokenData = {
        token: 'valid-access-token',
        deviceName: 'Test Device',
      };

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
      };

      const mockDevice = {
        id: 'device-123',
        userId: 'user-123',
        name: 'Test Device',
      };

      mockTokenService.verifyAccessToken.mockResolvedValue({
        userId: mockUser.id,
        deviceId: mockDevice.id,
      });
      mockUserService.findUserById.mockResolvedValue(mockUser);
      mockDeviceService.findOrCreateDevice.mockResolvedValue(mockDevice);
      mockDeviceService.updateDeviceLastActive.mockResolvedValue(mockDevice);

      // Extract handler function
      let tokenHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'auth:token') {
          tokenHandler = handler;
        }
        return mockSocket;
      });

      authHandler.registerEvents(mockSocket);

      // Act
      if (tokenHandler) {
        await tokenHandler.call(mockSocket, tokenData);
      }

      // Assert
      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith(tokenData.token);
      expect(mockUserService.findUserById).toHaveBeenCalledWith(mockUser.id);
      expect(mockDeviceService.updateDeviceLastActive).toHaveBeenCalledWith(mockDevice.id);

      // Check that socket data was updated
      expect((mockSocket as any).data.user).toEqual(mockUser);
      expect((mockSocket as any).data.deviceId).toEqual(mockDevice.id);

      // Check that socket joined the appropriate rooms
      expect(mockSocket.join).toHaveBeenCalledWith(`user:${mockUser.id}`);
      expect(mockSocket.join).toHaveBeenCalledWith(`user:${mockUser.id}:device:${mockDevice.id}`);

      // Check that successful auth response was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:token:success', {
        user: mockUser,
        device: mockDevice,
      });
    });

    it('should emit error with invalid token', async () => {
      // Arrange
      const tokenData = {
        token: 'invalid-token',
        deviceName: 'Test Device',
      };

      const error = new Error('Invalid token');
      mockTokenService.verifyAccessToken.mockRejectedValue(error);

      // Extract handler function
      let tokenHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'auth:token') {
          tokenHandler = handler;
        }
        return mockSocket;
      });

      authHandler.registerEvents(mockSocket);

      // Act
      if (tokenHandler) {
        await tokenHandler.call(mockSocket, tokenData);
      }

      // Assert
      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith(tokenData.token);
      expect(mockUserService.findUserById).not.toHaveBeenCalled();
      expect(mockDeviceService.updateDeviceLastActive).not.toHaveBeenCalled();

      // Check that error response was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:token:error', {
        message: error.message,
      });
    });
  });

  describe('handleRefreshToken', () => {
    it('should refresh tokens and emit success', async () => {
      // Arrange
      const refreshData = {
        refreshToken: 'valid-refresh-token',
      };

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      };

      const mockDevice = {
        id: 'device-123',
        userId: 'user-123',
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };

      mockTokenService.verifyRefreshToken.mockResolvedValue({
        userId: mockUser.id,
        deviceId: mockDevice.id,
      });
      mockTokenService.createAuthTokens.mockResolvedValue(mockTokens);

      // Set up socket data as if user was already authenticated
      (mockSocket as any).data = {
        user: mockUser,
        deviceId: mockDevice.id,
      } as SocketData;

      // Extract handler function
      let refreshHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'auth:refresh') {
          refreshHandler = handler;
        }
        return mockSocket;
      });

      authHandler.registerEvents(mockSocket);

      // Act
      if (refreshHandler) {
        await refreshHandler.call(mockSocket, refreshData);
      }

      // Assert
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshData.refreshToken);
      expect(mockTokenService.createAuthTokens).toHaveBeenCalledWith(mockUser.id, mockDevice.id);

      // Check that successful refresh response was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:refresh:success', {
        tokens: mockTokens,
      });
    });

    it('should emit error with invalid refresh token', async () => {
      // Arrange
      const refreshData = {
        refreshToken: 'invalid-refresh-token',
      };

      const error = new Error('Invalid refresh token');
      mockTokenService.verifyRefreshToken.mockRejectedValue(error);

      // Set up socket data as if user was already authenticated
      (mockSocket as any).data = {
        user: { id: 'user-123' },
        deviceId: 'device-123',
      } as SocketData;

      // Extract handler function
      let refreshHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'auth:refresh') {
          refreshHandler = handler;
        }
        return mockSocket;
      });

      authHandler.registerEvents(mockSocket);

      // Act
      if (refreshHandler) {
        await refreshHandler.call(mockSocket, refreshData);
      }

      // Assert
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshData.refreshToken);
      expect(mockTokenService.createAuthTokens).not.toHaveBeenCalled();

      // Check that error response was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:refresh:error', {
        message: error.message,
      });
    });
  });

  describe('handleLogout', () => {
    it('should clear session, leave rooms, and emit success', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      };

      const mockDevice = {
        id: 'device-123',
        userId: 'user-123',
      };

      // Set up socket data as if user was already authenticated
      (mockSocket as any).data = {
        user: mockUser,
        deviceId: mockDevice.id,
      } as SocketData;

      // Extract handler function
      let logoutHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'auth:logout') {
          logoutHandler = handler;
        }
        return mockSocket;
      });

      authHandler.registerEvents(mockSocket);

      // Act
      if (logoutHandler) {
        await logoutHandler.call(mockSocket);
      }

      // Assert
      // Check that socket left the appropriate rooms
      expect(mockSocket.leave).toHaveBeenCalledWith(`user:${mockUser.id}`);
      expect(mockSocket.leave).toHaveBeenCalledWith(`user:${mockUser.id}:device:${mockDevice.id}`);

      // Check that socket data was cleared
      expect((mockSocket as any).data.user).toBeUndefined();
      expect((mockSocket as any).data.deviceId).toBeUndefined();

      // Check that successful logout response was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:logout:success');
    });
  });
});
