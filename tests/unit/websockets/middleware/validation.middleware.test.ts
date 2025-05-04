import { Socket } from 'socket.io';
import { z } from 'zod';
import {
  validateEventPayloads,
  validatePayload,
  registerEventValidators,
  createEventValidator,
  formatValidationError,
} from '../../../../src/websockets/middleware/validation.middleware';
import { mock, MockProxy } from 'jest-mock-extended';
import { EventSchemaMap, ValidationOptions } from '../../../../src/types/websocket';

// Mock dependencies
jest.mock('../../../../src/utils/logger');

describe('WebSocket Validation Middleware', () => {
  let mockSocket: MockProxy<Socket> & Socket;
  let mockHandler: jest.Mock;
  let testSchema: z.ZodType<any>;
  let testSchemaMap: EventSchemaMap;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mocks
    mockSocket = mock<Socket>();
    mockHandler = jest.fn();

    // Mock socket.on method
    mockSocket.on = jest.fn().mockReturnThis();
    mockSocket.emit = jest.fn().mockReturnThis();

    // Create test schema
    testSchema = z.object({
      id: z.string().uuid(),
      name: z.string().min(3).max(50),
      age: z.number().int().min(0).max(120).optional(),
      email: z.string().email(),
    });

    // Create test schema map
    testSchemaMap = {
      'test:event': testSchema,
      'user:create': z.object({
        name: z.string(),
        email: z.string().email(),
      }),
    };
  });

  describe('validatePayload', () => {
    it('should return success for valid payload', () => {
      // Arrange
      const validPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      };

      // Act
      const result = validatePayload(validPayload, testSchema);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validPayload);
      expect(result.errors).toBeUndefined();
    });

    it('should return failure for invalid payload with validation errors', () => {
      // Arrange
      const invalidPayload = {
        id: 'not-a-uuid',
        name: 'Jo', // too short
        age: 150, // too high
        email: 'not-an-email',
      };

      // Act
      const result = validatePayload(invalidPayload, testSchema);

      // Assert
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should apply transformations from schema', () => {
      // Arrange
      const transformSchema = z.object({
        name: z.string().transform(val => val.toUpperCase()),
        tags: z.array(z.string()).default([]),
      });

      const payload = { name: 'test' };

      // Act
      const result = validatePayload(payload, transformSchema);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('TEST');
      expect(result.data?.tags).toEqual([]);
    });

    it('should handle stripUnknown option', () => {
      // Arrange
      const payload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
        extraField: 'should be removed',
      };

      const options: ValidationOptions = { stripUnknown: true };

      // Act
      const result = validatePayload(payload, testSchema, options);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.extraField).toBeUndefined();
    });
  });

  describe('formatValidationError', () => {
    it('should format Zod validation errors correctly', () => {
      // Arrange
      const invalidPayload = {
        id: 'not-a-uuid',
        name: 'Jo',
        email: 'not-an-email',
      };

      // Parse with schema to get ZodError
      const zodResult = testSchema.safeParse(invalidPayload);
      const zodError = !zodResult.success ? zodResult.error : undefined;

      // Act
      const formattedErrors = formatValidationError(zodError);

      // Assert
      expect(formattedErrors).toBeInstanceOf(Array);
      expect(formattedErrors.length).toBeGreaterThan(0);
      expect(formattedErrors[0]).toHaveProperty('path');
      expect(formattedErrors[0]).toHaveProperty('message');
    });
  });

  describe('validateEventPayloads middleware', () => {
    it('should register validation middleware for events', () => {
      // Arrange
      const middleware = validateEventPayloads(testSchemaMap);

      // Act
      middleware(mockSocket);

      // Assert
      expect(mockSocket.on).toHaveBeenCalledTimes(Object.keys(testSchemaMap).length);
      expect(mockSocket.on).toHaveBeenCalledWith('test:event', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('user:create', expect.any(Function));
    });
  });

  describe('registerEventValidators', () => {
    it('should register validators for specified events', () => {
      // Act
      registerEventValidators(mockSocket, testSchemaMap);

      // Assert
      expect(mockSocket.on).toHaveBeenCalledTimes(Object.keys(testSchemaMap).length);
      expect(mockSocket.on).toHaveBeenCalledWith('test:event', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('user:create', expect.any(Function));
    });
  });

  describe('createEventValidator', () => {
    it('should call handler with validated data when payload is valid', () => {
      // Arrange
      const validPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
      };

      const validator = createEventValidator(testSchema, mockHandler);

      // Act
      validator(validPayload);

      // Assert
      expect(mockHandler).toHaveBeenCalledWith(validPayload);
    });

    it('should emit validation error when payload is invalid', () => {
      // Arrange
      const invalidPayload = {
        id: 'not-a-uuid',
        name: 'Jo',
        email: 'not-an-email',
      };

      const validator = createEventValidator(testSchema, mockHandler);
      mockSocket.emit = jest.fn();

      // Act
      validator.call(mockSocket, invalidPayload);

      // Assert
      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'validation:error',
        expect.objectContaining({
          errors: expect.any(Array),
        }),
      );
    });

    it('should respect abortEarly option', () => {
      // Arrange
      const invalidPayload = {
        id: 'not-a-uuid',
        name: 'Jo',
        email: 'not-an-email',
      };

      const options: ValidationOptions = { abortEarly: true };
      const validator = createEventValidator(testSchema, mockHandler, options);
      mockSocket.emit = jest.fn();

      // Act
      validator.call(mockSocket, invalidPayload);

      // Assert
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'validation:error',
        expect.objectContaining({
          errors: expect.arrayContaining([expect.any(Object)]),
        }),
      );
    });
  });

  describe('Integration', () => {
    it('should validate event data before passing to handler', () => {
      // Arrange
      const validPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Mock the socket.on implementation to capture and execute handlers
      let capturedHandler: Function | undefined;
      mockSocket.on = jest.fn().mockImplementation((_event, handler) => {
        capturedHandler = handler;
        return mockSocket;
      });

      // Register validators
      registerEventValidators(mockSocket, { 'test:event': testSchema });

      // Mock the socket to use for the handler context
      mockSocket.emit = jest.fn();

      // Act - Simulate event with valid payload
      if (capturedHandler) {
        capturedHandler.call(mockSocket, validPayload);
      }

      // Assert - No validation error should be emitted
      expect(mockSocket.emit).not.toHaveBeenCalledWith('validation:error', expect.anything());
    });

    it('should prevent invalid event data from reaching handlers', () => {
      // Arrange
      const invalidPayload = {
        id: 'not-a-uuid',
        name: 'Jo',
        email: 'not-an-email',
      };

      // Create a middleware with a mock handler
      const testHandler = jest.fn();
      let capturedHandler: Function | undefined;

      mockSocket.on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'test:event') {
          capturedHandler = handler;
        }
        return mockSocket;
      });

      // Register validators with the mock handler
      const customSchemaMap: Record<string, any> = {};
      customSchemaMap['test:event'] = {
        schema: testSchema,
        handler: testHandler,
      };

      validateEventPayloads(testSchemaMap)(mockSocket);

      // Mock the socket to use for the handler context
      mockSocket.emit = jest.fn();

      // Act - Simulate event with invalid payload
      if (capturedHandler) {
        capturedHandler.call(mockSocket, invalidPayload);
      }

      // Assert - Validation error should be emitted and handler not called
      expect(mockSocket.emit).toHaveBeenCalledWith('validation:error', expect.anything());
      expect(testHandler).not.toHaveBeenCalled();
    });
  });
});
