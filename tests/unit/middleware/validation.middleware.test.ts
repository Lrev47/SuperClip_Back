import { Request, Response } from 'express';
import Joi from 'joi';
import {
  validateRequest,
  validateBody,
  validateQuery,
  validateParams,
  ValidationSource,
} from '../../../src/middleware/validation.middleware';

// Mock Joi validation
jest.mock('joi', () => {
  return {
    object: jest.fn(() => ({
      validate: jest.fn(),
    })),
    string: jest.fn(() => ({
      required: jest.fn().mockReturnThis(),
      email: jest.fn().mockReturnThis(),
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
    })),
    number: jest.fn(() => ({
      required: jest.fn().mockReturnThis(),
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
    })),
  };
});

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRequest', () => {
    test('should validate multiple request parts', () => {
      // Create schemas for different parts of the request
      const bodySchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
      });

      const querySchema = Joi.object({
        page: Joi.number().min(1),
        limit: Joi.number().min(1).max(100),
      });

      // Mock successful validation
      (bodySchema.validate as jest.Mock).mockReturnValue({ error: null });
      (querySchema.validate as jest.Mock).mockReturnValue({ error: null });

      const schema = {
        [ValidationSource.BODY]: bodySchema,
        [ValidationSource.QUERY]: querySchema,
      } as Record<ValidationSource, Joi.Schema>;

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Should call validate for each schema
      expect(bodySchema.validate).toHaveBeenCalledWith(mockRequest.body, expect.any(Object));
      expect(querySchema.validate).toHaveBeenCalledWith(mockRequest.query, expect.any(Object));
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should return 400 if validation fails', () => {
      const bodySchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
      });

      // Mock failed validation
      const validationError = new Error('Validation failed') as Joi.ValidationError;
      validationError.details = [
        { message: '"name" is required', path: ['name'], type: 'any.required', context: {} as any },
        {
          message: '"email" must be a valid email',
          path: ['email'],
          type: 'string.email',
          context: {} as any,
        },
      ];

      (bodySchema.validate as jest.Mock).mockReturnValue({ error: validationError });

      const schema = { [ValidationSource.BODY]: bodySchema } as Record<
        ValidationSource,
        Joi.Schema
      >;
      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          details: expect.objectContaining({
            name: expect.arrayContaining([expect.any(String)]),
            email: expect.arrayContaining([expect.any(String)]),
          }),
        }),
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should respect custom validation options', () => {
      const bodySchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
      });

      (bodySchema.validate as jest.Mock).mockReturnValue({ error: null });

      const customOptions = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      };

      const schema = { [ValidationSource.BODY]: bodySchema } as Record<
        ValidationSource,
        Joi.Schema
      >;
      const middleware = validateRequest(schema, customOptions);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(bodySchema.validate).toHaveBeenCalledWith(mockRequest.body, customOptions);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('validateBody', () => {
    test('should validate request body only', () => {
      const bodySchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
      });

      (bodySchema.validate as jest.Mock).mockReturnValue({ error: null });

      const middleware = validateBody(bodySchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(bodySchema.validate).toHaveBeenCalledWith(mockRequest.body, expect.any(Object));
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should return 400 if body validation fails', () => {
      const bodySchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
      });

      // Mock failed validation
      const validationError = new Error('Validation failed') as Joi.ValidationError;
      validationError.details = [
        { message: '"name" is required', path: ['name'], type: 'any.required', context: {} as any },
      ];

      (bodySchema.validate as jest.Mock).mockReturnValue({ error: validationError });

      const middleware = validateBody(bodySchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          details: expect.objectContaining({
            name: expect.arrayContaining([expect.any(String)]),
          }),
        }),
      );
    });
  });

  describe('validateQuery', () => {
    test('should validate request query parameters only', () => {
      const querySchema = Joi.object({
        page: Joi.number().min(1),
        limit: Joi.number().min(1).max(100),
      });

      (querySchema.validate as jest.Mock).mockReturnValue({ error: null });

      const middleware = validateQuery(querySchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(querySchema.validate).toHaveBeenCalledWith(mockRequest.query, expect.any(Object));
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should return 400 if query validation fails', () => {
      const querySchema = Joi.object({
        page: Joi.number().min(1),
        limit: Joi.number().min(1).max(100),
      });

      // Mock failed validation
      const validationError = new Error('Validation failed') as Joi.ValidationError;
      validationError.details = [
        {
          message: '"page" must be greater than or equal to 1',
          path: ['page'],
          type: 'number.min',
          context: {} as any,
        },
      ];

      (querySchema.validate as jest.Mock).mockReturnValue({ error: validationError });

      const middleware = validateQuery(querySchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          details: expect.objectContaining({
            page: expect.arrayContaining([expect.any(String)]),
          }),
        }),
      );
    });
  });

  describe('validateParams', () => {
    test('should validate request route parameters only', () => {
      const paramsSchema = Joi.object({
        id: Joi.string().required(),
      });

      (paramsSchema.validate as jest.Mock).mockReturnValue({ error: null });

      const middleware = validateParams(paramsSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(paramsSchema.validate).toHaveBeenCalledWith(mockRequest.params, expect.any(Object));
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should return 400 if params validation fails', () => {
      const paramsSchema = Joi.object({
        id: Joi.string().required(),
      });

      // Mock failed validation
      const validationError = new Error('Validation failed') as Joi.ValidationError;
      validationError.details = [
        { message: '"id" is required', path: ['id'], type: 'any.required', context: {} as any },
      ];

      (paramsSchema.validate as jest.Mock).mockReturnValue({ error: validationError });

      const middleware = validateParams(paramsSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          details: expect.objectContaining({
            id: expect.arrayContaining([expect.any(String)]),
          }),
        }),
      );
    });
  });
});
