import http from 'http';
import { Express } from 'express';
import { Server } from 'net';

// Mock environment variables
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';

// Mock shutDown function
const mockShutDown = jest.fn();

// Mock Express application
jest.mock('../../src/app', () => {
  const mockApp: Partial<Express> = {
    listen: jest.fn().mockImplementation((port, callback) => {
      if (callback && typeof callback === 'function') callback();
      const mockServer = {
        close: jest.fn(cb => {
          if (cb) cb();
        }),
      } as unknown as Server;
      return mockServer;
    }),
  };
  return mockApp;
});

// Mock Node.js modules
jest.mock('http', () => ({
  createServer: jest.fn(() => ({
    listen: jest.fn((port, cb) => {
      if (cb) cb();
      return {
        close: jest.fn(cb => {
          if (cb) cb();
        }),
        address: jest.fn(() => ({ port })),
      };
    }),
    on: jest.fn(),
  })),
}));

const originalLog = console.log;
const originalError = console.error;
const originalProcess = { ...process };

describe('Server Initialization', () => {
  beforeAll(() => {
    // Mock console methods to prevent output during tests
    console.log = jest.fn();
    console.error = jest.fn();

    // Mock process events
    process.on = jest.fn();
    // Properly type the mock for process.exit
    process.exit = jest.fn() as unknown as (code?: number | string) => never;
  });

  afterAll(() => {
    // Restore console methods
    console.log = originalLog;
    console.error = originalError;

    // Restore process
    process.on = originalProcess.on;
    process.exit = originalProcess.exit;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Override the implementation to mock shutDown
    jest.isolateModules(() => {
      const serverModule = require('../../src/server');
      // Mock the shutDown function
      serverModule.shutDown = mockShutDown;
    });
  });

  it('should initialize an HTTP server with the Express app', () => {
    // Import the server to trigger execution
    jest.isolateModules(() => {
      require('../../src/server');
    });

    expect(http.createServer).toHaveBeenCalled();
  });

  it('should listen on the configured port', () => {
    jest.isolateModules(() => {
      require('../../src/server');
    });

    const server = (http.createServer as jest.Mock).mock.results[0].value;
    expect(server.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });

  it('should set up error handling for unhandled rejections', () => {
    jest.isolateModules(() => {
      require('../../src/server');
    });

    expect(process.on).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
  });

  it('should set up error handling for uncaught exceptions', () => {
    jest.isolateModules(() => {
      require('../../src/server');
    });

    expect(process.on).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
  });

  it('should set up graceful shutdown for SIGINT', () => {
    jest.isolateModules(() => {
      require('../../src/server');
    });

    expect(process.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
  });

  it('should set up graceful shutdown for SIGTERM', () => {
    jest.isolateModules(() => {
      require('../../src/server');
    });

    expect(process.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
  });

  it('should handle unhandled rejection by closing server and exiting process', () => {
    jest.isolateModules(() => {
      require('../../src/server');
    });

    // Get the registered handler
    const unhandledRejectionHandler = (process.on as jest.Mock).mock.calls.find(
      call => call[0] === 'unhandledRejection',
    )?.[1];

    if (!unhandledRejectionHandler) {
      throw new Error('unhandledRejection handler not registered');
    }

    // Create a mock error
    const mockError = new Error('Test error');

    // Trigger the handler
    unhandledRejectionHandler(mockError, 'promise');

    expect(console.error).toHaveBeenCalled();
    expect(mockShutDown).toHaveBeenCalledWith(1);
  });

  it('should handle uncaught exception by logging and exiting process', () => {
    jest.isolateModules(() => {
      require('../../src/server');
    });

    // Get the registered handler
    const uncaughtExceptionHandler = (process.on as jest.Mock).mock.calls.find(
      call => call[0] === 'uncaughtException',
    )?.[1];

    if (!uncaughtExceptionHandler) {
      throw new Error('uncaughtException handler not registered');
    }

    // Create a mock error
    const mockError = new Error('Test error');

    // Trigger the handler
    uncaughtExceptionHandler(mockError);

    expect(console.error).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should handle SIGINT by closing server and exiting process', () => {
    jest.isolateModules(() => {
      require('../../src/server');
    });

    // Get the registered handler
    const sigintHandler = (process.on as jest.Mock).mock.calls.find(
      call => call[0] === 'SIGINT',
    )?.[1];

    if (!sigintHandler) {
      throw new Error('SIGINT handler not registered');
    }

    // Trigger the handler
    sigintHandler();

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('shutting down'));
    expect(mockShutDown).toHaveBeenCalled();
  });
});
