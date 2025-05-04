import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { mock, MockProxy } from 'jest-mock-extended';
import {
  SyncHandlerFunctions,
  initSyncHandler,
} from '../../../../src/websockets/handlers/sync.handler';
import { ClipService } from '../../../../src/services/clip.service';
import { FolderService } from '../../../../src/services/folder.service';
import { DeviceService } from '../../../../src/services/device.service';

// Mock dependencies
jest.mock('../../../../src/services/clip.service');
jest.mock('../../../../src/services/folder.service');
jest.mock('../../../../src/services/device.service');
jest.mock('../../../../src/utils/logger');

describe('WebSocket Sync Handler', () => {
  let mockSocket: MockProxy<Socket> & Socket;
  let mockIo: MockProxy<Server> & Server;
  let mockClipService: jest.Mocked<ClipService>;
  let mockFolderService: jest.Mocked<FolderService>;
  let mockDeviceService: jest.Mocked<DeviceService>;
  let syncHandler: SyncHandlerFunctions;

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
    mockClipService = {
      getClips: jest.fn(),
      getClipById: jest.fn(),
      createClip: jest.fn(),
      updateClip: jest.fn(),
      deleteClip: jest.fn(),
      syncClips: jest.fn(),
    } as unknown as jest.Mocked<ClipService>;

    mockFolderService = {
      getFolders: jest.fn(),
      getFolderById: jest.fn(),
      createFolder: jest.fn(),
      updateFolder: jest.fn(),
      deleteFolder: jest.fn(),
      syncFolders: jest.fn(),
    } as unknown as jest.Mocked<FolderService>;

    mockDeviceService = {
      getDevice: jest.fn(),
      updateLastSyncTimestamp: jest.fn(),
    } as unknown as jest.Mocked<DeviceService>;

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

    // Initialize the sync handler
    syncHandler = initSyncHandler(mockIo, {
      clipService: mockClipService,
      folderService: mockFolderService,
      deviceService: mockDeviceService,
    });
  });

  describe('registerEvents', () => {
    it('should register all sync-related events on the socket', () => {
      // Act
      syncHandler.registerEvents(mockSocket);

      // Assert
      expect(mockSocket.on).toHaveBeenCalledWith('sync:start', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('sync:clips', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('sync:folders', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('sync:complete', expect.any(Function));
    });
  });

  describe('handleSyncStart', () => {
    it('should initialize sync and emit success with lastSyncTimestamp', async () => {
      // Arrange
      const lastSyncTimestamp = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago

      mockDeviceService.getDevice.mockResolvedValue({
        id: 'device-123',
        userId: 'user-123',
        name: 'Test Device',
        lastSyncTimestamp,
      });

      // Extract handler function
      let syncStartHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'sync:start') {
          syncStartHandler = handler;
        }
        return mockSocket;
      });

      syncHandler.registerEvents(mockSocket);

      // Ensure handler was registered
      expect(syncStartHandler).toBeDefined();

      // Act
      if (syncStartHandler) {
        await syncStartHandler.call(mockSocket);
      }

      // Assert
      expect(mockDeviceService.getDevice).toHaveBeenCalledWith('device-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('sync:start:success', {
        lastSyncTimestamp: lastSyncTimestamp.toISOString(),
      });
    });

    it('should emit error when unable to get device info', async () => {
      // Arrange
      const error = new Error('Device not found');
      mockDeviceService.getDevice.mockRejectedValue(error);

      // Extract handler function
      let syncStartHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'sync:start') {
          syncStartHandler = handler;
        }
        return mockSocket;
      });

      syncHandler.registerEvents(mockSocket);

      // Act
      if (syncStartHandler) {
        await syncStartHandler.call(mockSocket);
      }

      // Assert
      expect(mockDeviceService.getDevice).toHaveBeenCalledWith('device-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('sync:start:error', {
        message: error.message,
      });
    });
  });

  describe('handleSyncClips', () => {
    it('should sync clips and emit success', async () => {
      // Arrange
      const clipSyncData = {
        clips: [
          { id: 'clip-1', content: 'Updated content', updatedAt: new Date() },
          { id: 'clip-2', content: 'New clip', createdAt: new Date() },
        ],
        deletedClipIds: ['clip-3'],
      };

      const syncResult = {
        added: 1,
        updated: 1,
        deleted: 1,
        conflicted: 0,
      };

      mockClipService.syncClips.mockResolvedValue(syncResult);

      // Extract handler function
      let syncClipsHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'sync:clips') {
          syncClipsHandler = handler;
        }
        return mockSocket;
      });

      syncHandler.registerEvents(mockSocket);

      // Act
      if (syncClipsHandler) {
        await syncClipsHandler.call(mockSocket, clipSyncData);
      }

      // Assert
      expect(mockClipService.syncClips).toHaveBeenCalledWith(
        'user-123',
        'device-123',
        clipSyncData,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('sync:clips:success', syncResult);

      // Should broadcast to other user devices
      expect(mockIo.to).toHaveBeenCalledWith(`user:user-123:devices:except:device-123`);
      expect(mockIo.to(`user:user-123:devices:except:device-123`).emit).toHaveBeenCalledWith(
        'sync:data:changed',
        {
          type: 'clips',
        },
      );
    });

    it('should emit error when unable to sync clips', async () => {
      // Arrange
      const clipSyncData = {
        clips: [{ id: 'clip-1', content: 'Updated content', updatedAt: new Date() }],
        deletedClipIds: [],
      };

      const error = new Error('Failed to sync clips');
      mockClipService.syncClips.mockRejectedValue(error);

      // Extract handler function
      let syncClipsHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'sync:clips') {
          syncClipsHandler = handler;
        }
        return mockSocket;
      });

      syncHandler.registerEvents(mockSocket);

      // Act
      if (syncClipsHandler) {
        await syncClipsHandler.call(mockSocket, clipSyncData);
      }

      // Assert
      expect(mockClipService.syncClips).toHaveBeenCalledWith(
        'user-123',
        'device-123',
        clipSyncData,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('sync:clips:error', {
        message: error.message,
      });
    });
  });

  describe('handleSyncFolders', () => {
    it('should sync folders and emit success', async () => {
      // Arrange
      const folderSyncData = {
        folders: [
          { id: 'folder-1', name: 'Updated folder', updatedAt: new Date() },
          { id: 'folder-2', name: 'New folder', createdAt: new Date() },
        ],
        deletedFolderIds: ['folder-3'],
      };

      const syncResult = {
        added: 1,
        updated: 1,
        deleted: 1,
        conflicted: 0,
      };

      mockFolderService.syncFolders.mockResolvedValue(syncResult);

      // Extract handler function
      let syncFoldersHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'sync:folders') {
          syncFoldersHandler = handler;
        }
        return mockSocket;
      });

      syncHandler.registerEvents(mockSocket);

      // Act
      if (syncFoldersHandler) {
        await syncFoldersHandler.call(mockSocket, folderSyncData);
      }

      // Assert
      expect(mockFolderService.syncFolders).toHaveBeenCalledWith(
        'user-123',
        'device-123',
        folderSyncData,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('sync:folders:success', syncResult);

      // Should broadcast to other user devices
      expect(mockIo.to).toHaveBeenCalledWith(`user:user-123:devices:except:device-123`);
      expect(mockIo.to(`user:user-123:devices:except:device-123`).emit).toHaveBeenCalledWith(
        'sync:data:changed',
        {
          type: 'folders',
        },
      );
    });

    it('should emit error when unable to sync folders', async () => {
      // Arrange
      const folderSyncData = {
        folders: [{ id: 'folder-1', name: 'Updated folder', updatedAt: new Date() }],
        deletedFolderIds: [],
      };

      const error = new Error('Failed to sync folders');
      mockFolderService.syncFolders.mockRejectedValue(error);

      // Extract handler function
      let syncFoldersHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'sync:folders') {
          syncFoldersHandler = handler;
        }
        return mockSocket;
      });

      syncHandler.registerEvents(mockSocket);

      // Act
      if (syncFoldersHandler) {
        await syncFoldersHandler.call(mockSocket, folderSyncData);
      }

      // Assert
      expect(mockFolderService.syncFolders).toHaveBeenCalledWith(
        'user-123',
        'device-123',
        folderSyncData,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('sync:folders:error', {
        message: error.message,
      });
    });
  });

  describe('handleSyncComplete', () => {
    it('should update the device last sync timestamp and emit success', async () => {
      // Arrange
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now as unknown as string);

      mockDeviceService.updateLastSyncTimestamp.mockResolvedValue({
        id: 'device-123',
        userId: 'user-123',
        name: 'Test Device',
        lastSyncTimestamp: now,
      });

      // Extract handler function
      let syncCompleteHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'sync:complete') {
          syncCompleteHandler = handler;
        }
        return mockSocket;
      });

      syncHandler.registerEvents(mockSocket);

      // Act
      if (syncCompleteHandler) {
        await syncCompleteHandler.call(mockSocket);
      }

      // Assert
      expect(mockDeviceService.updateLastSyncTimestamp).toHaveBeenCalledWith('device-123', now);
      expect(mockSocket.emit).toHaveBeenCalledWith('sync:complete:success', {
        syncTimestamp: now.toISOString(),
      });
    });

    it('should emit error when unable to update sync timestamp', async () => {
      // Arrange
      const error = new Error('Failed to update sync timestamp');
      mockDeviceService.updateLastSyncTimestamp.mockRejectedValue(error);

      // Extract handler function
      let syncCompleteHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'sync:complete') {
          syncCompleteHandler = handler;
        }
        return mockSocket;
      });

      syncHandler.registerEvents(mockSocket);

      // Act
      if (syncCompleteHandler) {
        await syncCompleteHandler.call(mockSocket);
      }

      // Assert
      expect(mockDeviceService.updateLastSyncTimestamp).toHaveBeenCalledWith(
        'device-123',
        expect.any(Date),
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('sync:complete:error', {
        message: error.message,
      });
    });
  });

  describe('notifyClientsOfChanges', () => {
    it('should notify other devices of changes', () => {
      // Arrange
      const changeType = 'clips';

      // Act
      syncHandler.notifyClientsOfChanges('user-123', 'device-123', changeType);

      // Assert
      expect(mockIo.to).toHaveBeenCalledWith(`user:user-123:devices:except:device-123`);
      expect(mockIo.to(`user:user-123:devices:except:device-123`).emit).toHaveBeenCalledWith(
        'sync:data:changed',
        {
          type: changeType,
        },
      );
    });
  });
});
