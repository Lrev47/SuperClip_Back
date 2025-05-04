import { Request, Response } from 'express';
import { requestLogger, errorLogger } from '../../../src/middleware/logging.middleware';

// Extend Request for testing
interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  requestId?: string;
  startTime?: number;
  error?: Error;
}

// Extend Response for testing
interface MockResponse extends Response {
  finishCallback?: () => void;
}

// Mock Winston logger
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// Import after mocking
const logger = require('../../../src/utils/logger');

describe('Logging Middleware', () => {
  let mockRequest: Partial<RequestWithUser>;
  let mockResponse: Partial<MockResponse>;
  let nextFunction: jest.Mock;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/test',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent',
      },
      url: '/test',
      originalUrl: '/test',
    };

    // Create a mock response with necessary properties
    const mockWriteHead = jest.fn();
    const mockWrite = jest.fn();
    const mockEnd = jest.fn();
    const mockOn = jest.fn().mockImplementation((event, callback) => {
      if (event === 'finish') {
        // Store the callback to call it later
        mockResponse.finishCallback = callback;
      }
      return mockResponse;
    });

    mockResponse = {
      statusCode: 200,
      getHeader: jest.fn(),
      on: mockOn,
      once: jest.fn(),
      emit: jest.fn(),
      write: mockWrite,
      end: mockEnd,
      writeHead: mockWriteHead,
      finishCallback: undefined,
    };

    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  describe('requestLogger', () => {
    test('should assign unique request ID and start time', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      // Verify request ID and start time were set
      expect(mockRequest.requestId).toBeDefined();
      expect(typeof mockRequest.requestId).toBe('string');
      expect(mockRequest.startTime).toBeDefined();
      expect(typeof mockRequest.startTime).toBe('number');

      // Verify next() was called
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should log response info when response is finished', () => {
      // Mock Date.now for consistent timing tests
      const originalDateNow = Date.now;
      Date.now = jest.fn().mockReturnValue(1000); // Start time

      // Setup request with startTime
      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      // Update mock time for response finish (100ms later)
      (Date.now as jest.Mock).mockReturnValue(1100);

      // Simulate response finish event
      if (mockResponse.finishCallback) {
        mockResponse.finishCallback();
      }

      // Verify logging occurred with request details
      expect(logger.info).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('GET /test'),
        expect.any(Object),
      );
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('200'), expect.any(Object));
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('100ms'),
        expect.any(Object),
      );

      // Restore original Date.now
      Date.now = originalDateNow;
    });

    test('should include user ID in log if present', () => {
      // Setup authenticated request
      mockRequest.user = { id: 'user123', email: 'test@example.com', role: 'USER' };

      // Set up request logging
      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      // Simulate response finish event
      if (mockResponse.finishCallback) {
        mockResponse.finishCallback();
      }

      // Extract the arguments from the logger.info call
      const callArgs = (logger.info as jest.Mock).mock.calls[0];
      const logData = callArgs[1]; // Second parameter contains the metadata

      // Verify user ID was included in log metadata
      expect(logData.userId).toBe('user123');
    });
  });

  describe('errorLogger', () => {
    test('should log error details', () => {
      const error = new Error('Test error message');
      error.stack = 'Error: Test error message\n    at TestFunction';

      // Add error to the request object
      mockRequest.error = error;
      mockRequest.requestId = 'test-id';

      errorLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      // Verify error was logged with details
      expect(logger.error).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        'Test error message',
        expect.objectContaining({
          error: error,
          requestId: 'test-id',
          method: 'GET',
          path: '/test',
          ip: '127.0.0.1',
        }),
      );

      // Verify next was called with the error
      expect(nextFunction).toHaveBeenCalledWith(error);
    });

    test('should include user ID in error log if authenticated', () => {
      // Setup authenticated request
      mockRequest.user = { id: 'user123', email: 'test@example.com', role: 'USER' };
      mockRequest.requestId = 'test-id';

      const error = new Error('Test error message');
      mockRequest.error = error;

      errorLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      // Verify error was logged with user ID
      const logData = (logger.error as jest.Mock).mock.calls[0][1];
      expect(logData.userId).toBe('user123');
    });

    test('should redact sensitive information in logs', () => {
      // Request with sensitive data
      mockRequest.body = {
        email: 'test@example.com',
        password: 'secret123',
        creditCard: '4111111111111111',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      };

      mockRequest.requestId = 'test-id';
      const error = new Error('Test error with sensitive data');
      mockRequest.error = error;

      errorLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      // Get the logged data
      const logData = (logger.error as jest.Mock).mock.calls[0][1];

      // Body should be logged but sensitive fields should be redacted
      expect(logData.body).toBeDefined();
      expect(logData.body.email).toBe('test@example.com'); // Email is not sensitive
      expect(logData.body.password).toBe('[REDACTED]');
      expect(logData.body.creditCard).toBe('[REDACTED]');
      expect(logData.body.token).toBe('[REDACTED]');
    });
  });
});
