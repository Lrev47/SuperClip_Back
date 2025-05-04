import { Request, Response } from 'express';
import { errorHandler, notFoundHandler } from '../../../src/middleware/error.middleware';

// Mock console.error to prevent test output pollution
console.error = jest.fn();

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/test',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();

    // Reset environment for each test
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  describe('notFoundHandler', () => {
    test('should return 404 with route information', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Not Found',
        message: `Route ${mockRequest.method} ${mockRequest.path} not found`,
      });
    });
  });

  describe('errorHandler', () => {
    test('should handle generic errors with 500 status code', () => {
      const error = new Error('Test error message');

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal Server Error',
          message: 'Test error message',
          stack: expect.any(String),
        }),
      );
      expect(console.error).toHaveBeenCalled();
    });

    test('should use status code from ApiError', () => {
      // Simulate an ApiError with custom status code
      const error = new Error('Not authorized') as any;
      error.statusCode = 401;

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal Server Error',
          message: 'Not authorized',
          stack: expect.any(String),
        }),
      );
    });

    test('should include validation errors for ValidationError', () => {
      // Simulate a ValidationError
      const error = new Error('Validation failed') as any;
      error.statusCode = 400;
      error.errors = {
        email: ['Email is required'],
        password: ['Password must be at least 8 characters'],
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal Server Error',
          message: 'Validation failed',
          errors: error.errors,
          stack: expect.any(String),
        }),
      );
    });

    test('should omit stack trace in production environment', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error message');

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
      // Stack trace should not be included in the response
      expect((mockResponse.json as jest.Mock).mock.calls[0][0].stack).toBeUndefined();
    });

    test('should use original error message in non-production environment', () => {
      const error = new Error('Test error message');

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error message',
        }),
      );
    });

    test('should use generic error message in production environment', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error message');

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'An unexpected error occurred',
        }),
      );
    });
  });
});
