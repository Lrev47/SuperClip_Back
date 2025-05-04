import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, UserRole } from '../../../src/middleware/auth.middleware';

// Mock jwt module
jest.mock('jsonwebtoken');

// Custom request type for testing that includes user property
interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

describe('Auth Middleware', () => {
  let mockRequest: Partial<RequestWithUser>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
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

  describe('authenticate', () => {
    test('should return 401 if no authorization header is present', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 401 if token format is invalid', () => {
      mockRequest.headers = { authorization: 'InvalidFormat' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid token format',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 401 if jwt.verify throws error', () => {
      mockRequest.headers = { authorization: 'Bearer invalidToken' };

      const jwtError = new Error('Invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should set req.user and call next() if token is valid', () => {
      mockRequest.headers = { authorization: 'Bearer validToken' };

      const decodedToken = {
        userId: '123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

      authenticate(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toEqual({
        id: decodedToken.userId,
        email: decodedToken.email,
        role: decodedToken.role,
      });
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should return 403 if token has expired', () => {
      mockRequest.headers = { authorization: 'Bearer expiredToken' };

      const tokenError = new Error('jwt expired');
      tokenError.name = 'TokenExpiredError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw tokenError;
      });

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Token has expired',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    test('should return 403 if user is not authenticated', () => {
      mockRequest = {}; // No user property

      const authorizeFn = authorize([UserRole.USER, UserRole.ADMIN]);
      authorizeFn(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Access denied',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 403 if user role is not authorized', () => {
      mockRequest = {
        user: {
          id: '123',
          email: 'test@example.com',
          role: UserRole.USER,
        },
      };

      const authorizeFn = authorize([UserRole.ADMIN]);
      authorizeFn(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should call next() if user role is authorized', () => {
      mockRequest = {
        user: {
          id: '123',
          email: 'test@example.com',
          role: UserRole.ADMIN,
        },
      };

      const authorizeFn = authorize([UserRole.ADMIN]);
      authorizeFn(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should call next() if user has one of multiple authorized roles', () => {
      mockRequest = {
        user: {
          id: '123',
          email: 'test@example.com',
          role: UserRole.USER,
        },
      };

      const authorizeFn = authorize([UserRole.USER, UserRole.ADMIN]);
      authorizeFn(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
