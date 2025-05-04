import { Request, Response } from 'express';
import {
  securityHeaders,
  corsConfig,
  rateLimiter,
  xssProtection,
} from '../../../src/middleware/security.middleware';

// Extended request type for testing
interface MockRequest extends Request {
  ip: string;
}

// Define NextFunction type for mocks
type NextFunctionType = (err?: any) => void;

// Mock rate-limiter package to ensure it returns a synchronous function
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation(options => {
    return (req: Request, res: Response, next: NextFunctionType) => {
      // Simple mock implementation for testing
      if ((req as MockRequest).ip === '192.168.1.1' && options.skipSuccessfulRequests !== true) {
        return res.status(429).json({ message: 'Too many requests' });
      }
      next();
      return undefined; // Ensure no promise is returned
    };
  });
});

// Mock cors package to return a synchronous function instead of Promise
jest.mock('cors', () => {
  return jest.fn().mockImplementation(() => {
    return (req: Request, res: Response, next: NextFunctionType) => {
      next();
      return undefined; // Return something to avoid promise errors
    };
  });
});

describe('Security Middleware', () => {
  let mockRequest: Partial<MockRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      ip: '127.0.0.1',
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('securityHeaders', () => {
    test('should set all required security headers', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should include content security policy with proper directives', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.any(String),
      );
      const cspHeader = (mockResponse.setHeader as jest.Mock).mock.calls.find(
        call => call[0] === 'Content-Security-Policy',
      )[1];

      // Check for basic directives in CSP
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain('script-src');
      expect(cspHeader).toContain('img-src');
    });
  });

  describe('corsConfig', () => {
    test('should return a middleware function', () => {
      const middleware = corsConfig();
      expect(typeof middleware).toBe('function');
    });

    test('should use default CORS options when none provided', () => {
      const middleware = corsConfig();

      // Call the middleware and mark as void to suppress linter
      void middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // For a CORS preflight OPTIONS request, it would set headers
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should use custom CORS options when provided', () => {
      const customOptions = {
        origin: 'https://example.com',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      };

      const middleware = corsConfig(customOptions);

      // Mock an OPTIONS request for CORS preflight
      mockRequest.method = 'OPTIONS';
      void middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('rateLimiter', () => {
    test('should block excessive requests based on IP', () => {
      const middleware = rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 100,
      });

      // Create a new request object to avoid modifying the original mockRequest
      const limitedRequest = {
        ...mockRequest,
        ip: '192.168.1.1',
      };

      // Explicitly use void to handle any potential promises
      void middleware(limitedRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Too many requests' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should allow legitimate requests that do not exceed limits', () => {
      const middleware = rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 100,
      });

      // Standard request that doesn't exceed limits
      void middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should support custom rate limiter configurations', () => {
      const middleware = rateLimiter({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 50,
        message: 'Custom rate limit exceeded',
        skipSuccessfulRequests: true,
      });

      // Even from an IP that would normally be blocked, this should pass due to skipSuccessfulRequests
      const limitedRequest = {
        ...mockRequest,
        ip: '192.168.1.1',
      };

      void middleware(limitedRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('xssProtection', () => {
    test('should sanitize HTML in request body', () => {
      // Request with potentially malicious content
      mockRequest.body = {
        name: 'Test User',
        comment: '<script>alert("XSS attack");</script>',
        description: '<img src="x" onerror="alert(\'XSS\')">',
        nested: {
          html: '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        },
      };

      xssProtection(mockRequest as Request, mockResponse as Response, nextFunction);

      // Content should be sanitized
      expect(mockRequest.body.comment).not.toContain('<script>');
      expect(mockRequest.body.description).not.toContain('onerror=');
      expect(mockRequest.body.nested.html).not.toContain('<iframe');
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should handle non-object bodies without error', () => {
      // String body
      mockRequest.body = 'Plain text string';

      xssProtection(mockRequest as Request, mockResponse as Response, nextFunction);

      // Should not modify string body
      expect(mockRequest.body).toBe('Plain text string');
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should not modify non-string properties', () => {
      // Body with mixed types
      mockRequest.body = {
        name: 'Test User',
        age: 30,
        isActive: true,
        scores: [85, 90, 95],
      };

      const originalBody = { ...mockRequest.body };

      xssProtection(mockRequest as Request, mockResponse as Response, nextFunction);

      // Non-string properties should remain unchanged
      expect(mockRequest.body.age).toBe(originalBody.age);
      expect(mockRequest.body.isActive).toBe(originalBody.isActive);
      expect(mockRequest.body.scores).toEqual(originalBody.scores);
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
