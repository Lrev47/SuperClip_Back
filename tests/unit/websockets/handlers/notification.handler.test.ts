import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { mock, MockProxy } from 'jest-mock-extended';
import {
  NotificationHandlerFunctions,
  initNotificationHandler,
} from '../../../../src/websockets/handlers/notification.handler';
import { NotificationService } from '../../../../src/services/notification.service';
import { UserService } from '../../../../src/services/user.service';

// Mock dependencies
jest.mock('../../../../src/services/notification.service');
jest.mock('../../../../src/services/user.service');
jest.mock('../../../../src/utils/logger');

describe('WebSocket Notification Handler', () => {
  let mockSocket: MockProxy<Socket> & Socket;
  let mockIo: MockProxy<Server> & Server;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockUserService: jest.Mocked<UserService>;
  let notificationHandler: NotificationHandlerFunctions;

  // Define interface for socket data to avoid TypeScript errors
  interface SocketData {
    user?: {
      id: string;
    };
    deviceId?: string;
  }

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mocks
    mockSocket = mock<Socket>();
    mockIo = mock<Server>();
    mockNotificationService = {
      getUserNotifications: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      createNotification: jest.fn(),
      subscribeToNotifications: jest.fn(),
      unsubscribeFromNotifications: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    mockUserService = {
      findById: jest.fn(),
      updateUserPreferences: jest.fn(),
      getUserNotificationPreferences: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    // Mock socket methods
    mockSocket.on = jest.fn().mockReturnThis();
    mockSocket.emit = jest.fn().mockReturnThis();
    mockSocket.join = jest.fn().mockReturnThis();
    mockSocket.leave = jest.fn().mockReturnThis();

    // Set up socket data with user information
    (mockSocket as any).data = {
      user: { id: 'user-123' },
      deviceId: 'device-123',
    } as SocketData;

    // Initialize the notification handler
    notificationHandler = initNotificationHandler(mockIo, {
      notificationService: mockNotificationService,
      userService: mockUserService,
    });
  });

  describe('registerEvents', () => {
    it('should register all notification-related events on the socket', () => {
      // Act
      notificationHandler.registerEvents(mockSocket);

      // Assert
      expect(mockSocket.on).toHaveBeenCalledWith('notification:get', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('notification:markAsRead', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith(
        'notification:markAllAsRead',
        expect.any(Function),
      );
      expect(mockSocket.on).toHaveBeenCalledWith('notification:delete', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith(
        'notification:preferences:get',
        expect.any(Function),
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'notification:preferences:update',
        expect.any(Function),
      );
    });
  });

  describe('handleGetNotifications', () => {
    it('should fetch and emit user notifications', async () => {
      // Arrange
      const mockNotifications = [
        { id: 'notification-1', message: 'Test notification 1', read: false },
        { id: 'notification-2', message: 'Test notification 2', read: true },
      ];

      mockNotificationService.getUserNotifications.mockResolvedValue(mockNotifications);

      // Get the get notifications handler function
      let getNotificationsHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:get') {
          getNotificationsHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await getNotificationsHandler.call(mockSocket);

      // Assert
      expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith('user-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:get:success', {
        notifications: mockNotifications,
      });
    });

    it('should emit error on failure to fetch notifications', async () => {
      // Arrange
      const error = new Error('Failed to fetch notifications');
      mockNotificationService.getUserNotifications.mockRejectedValue(error);

      // Get the get notifications handler function
      let getNotificationsHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:get') {
          getNotificationsHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await getNotificationsHandler.call(mockSocket);

      // Assert
      expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith('user-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:get:error', {
        message: error.message,
      });
    });
  });

  describe('handleMarkAsRead', () => {
    it('should mark notification as read and emit success', async () => {
      // Arrange
      const markAsReadData = {
        notificationId: 'notification-1',
      };

      mockNotificationService.markAsRead.mockResolvedValue(true);

      // Get the mark as read handler function
      let markAsReadHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:markAsRead') {
          markAsReadHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await markAsReadHandler.call(mockSocket, markAsReadData);

      // Assert
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(
        'user-123',
        markAsReadData.notificationId,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:markAsRead:success', {
        notificationId: markAsReadData.notificationId,
      });
    });

    it('should emit error on failure to mark notification as read', async () => {
      // Arrange
      const markAsReadData = {
        notificationId: 'invalid-notification-id',
      };

      const error = new Error('Notification not found');
      mockNotificationService.markAsRead.mockRejectedValue(error);

      // Get the mark as read handler function
      let markAsReadHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:markAsRead') {
          markAsReadHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await markAsReadHandler.call(mockSocket, markAsReadData);

      // Assert
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(
        'user-123',
        markAsReadData.notificationId,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:markAsRead:error', {
        message: error.message,
      });
    });
  });

  describe('handleMarkAllAsRead', () => {
    it('should mark all notifications as read and emit success', async () => {
      // Arrange
      mockNotificationService.markAllAsRead.mockResolvedValue(true);

      // Get the mark all as read handler function
      let markAllAsReadHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:markAllAsRead') {
          markAllAsReadHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await markAllAsReadHandler.call(mockSocket);

      // Assert
      expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith('user-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:markAllAsRead:success');
    });

    it('should emit error on failure to mark all notifications as read', async () => {
      // Arrange
      const error = new Error('Failed to mark all notifications as read');
      mockNotificationService.markAllAsRead.mockRejectedValue(error);

      // Get the mark all as read handler function
      let markAllAsReadHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:markAllAsRead') {
          markAllAsReadHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await markAllAsReadHandler.call(mockSocket);

      // Assert
      expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith('user-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:markAllAsRead:error', {
        message: error.message,
      });
    });
  });

  describe('handleDeleteNotification', () => {
    it('should delete notification and emit success', async () => {
      // Arrange
      const deleteData = {
        notificationId: 'notification-1',
      };

      mockNotificationService.deleteNotification.mockResolvedValue(true);

      // Get the delete notification handler function
      let deleteNotificationHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:delete') {
          deleteNotificationHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await deleteNotificationHandler.call(mockSocket, deleteData);

      // Assert
      expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith(
        'user-123',
        deleteData.notificationId,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:delete:success', {
        notificationId: deleteData.notificationId,
      });
    });

    it('should emit error on failure to delete notification', async () => {
      // Arrange
      const deleteData = {
        notificationId: 'invalid-notification-id',
      };

      const error = new Error('Notification not found');
      mockNotificationService.deleteNotification.mockRejectedValue(error);

      // Get the delete notification handler function
      let deleteNotificationHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:delete') {
          deleteNotificationHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await deleteNotificationHandler.call(mockSocket, deleteData);

      // Assert
      expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith(
        'user-123',
        deleteData.notificationId,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:delete:error', {
        message: error.message,
      });
    });
  });

  describe('handleGetNotificationPreferences', () => {
    it('should fetch and emit notification preferences', async () => {
      // Arrange
      const mockPreferences = {
        emailNotifications: true,
        pushNotifications: true,
        notificationTypes: {
          sync: true,
          security: true,
          updates: false,
        },
      };

      mockUserService.getUserNotificationPreferences.mockResolvedValue(mockPreferences);

      // Get the get preferences handler function
      let getPreferencesHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:preferences:get') {
          getPreferencesHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await getPreferencesHandler.call(mockSocket);

      // Assert
      expect(mockUserService.getUserNotificationPreferences).toHaveBeenCalledWith('user-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:preferences:get:success', {
        preferences: mockPreferences,
      });
    });

    it('should emit error on failure to fetch notification preferences', async () => {
      // Arrange
      const error = new Error('Failed to fetch notification preferences');
      mockUserService.getUserNotificationPreferences.mockRejectedValue(error);

      // Get the get preferences handler function
      let getPreferencesHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:preferences:get') {
          getPreferencesHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await getPreferencesHandler.call(mockSocket);

      // Assert
      expect(mockUserService.getUserNotificationPreferences).toHaveBeenCalledWith('user-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:preferences:get:error', {
        message: error.message,
      });
    });
  });

  describe('handleUpdateNotificationPreferences', () => {
    it('should update notification preferences and emit success', async () => {
      // Arrange
      const updatePreferencesData = {
        emailNotifications: false,
        pushNotifications: true,
        notificationTypes: {
          sync: true,
          security: true,
          updates: true,
        },
      };

      mockUserService.updateUserPreferences.mockResolvedValue({
        ...updatePreferencesData,
      });

      // Get the update preferences handler function
      let updatePreferencesHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:preferences:update') {
          updatePreferencesHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await updatePreferencesHandler.call(mockSocket, updatePreferencesData);

      // Assert
      expect(mockUserService.updateUserPreferences).toHaveBeenCalledWith(
        'user-123',
        updatePreferencesData,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:preferences:update:success', {
        preferences: updatePreferencesData,
      });
    });

    it('should emit error on failure to update notification preferences', async () => {
      // Arrange
      const updatePreferencesData = {
        emailNotifications: false,
        pushNotifications: true,
        notificationTypes: {
          sync: true,
          security: true,
          updates: true,
        },
      };

      const error = new Error('Failed to update notification preferences');
      mockUserService.updateUserPreferences.mockRejectedValue(error);

      // Get the update preferences handler function
      let updatePreferencesHandler: Function;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'notification:preferences:update') {
          updatePreferencesHandler = handler;
        }
        return mockSocket;
      });

      notificationHandler.registerEvents(mockSocket);

      // Act
      await updatePreferencesHandler.call(mockSocket, updatePreferencesData);

      // Assert
      expect(mockUserService.updateUserPreferences).toHaveBeenCalledWith(
        'user-123',
        updatePreferencesData,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:preferences:update:error', {
        message: error.message,
      });
    });
  });

  describe('broadcastNotification', () => {
    it('should broadcast notification to user', () => {
      // Arrange
      const notification = {
        id: 'notification-123',
        userId: 'user-123',
        message: 'Test notification',
        timestamp: new Date(),
        read: false,
      };

      // Act
      notificationHandler.broadcastNotification(notification);

      // Assert
      expect(mockIo.to).toHaveBeenCalledWith(`user:${notification.userId}`);
      expect(mockIo.to('user:user-123').emit).toHaveBeenCalledWith('notification:new', {
        notification,
      });
    });
  });
});
