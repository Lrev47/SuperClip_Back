import { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';

/**
 * Security Headers Middleware
 * Adds various security headers to responses to protect against common attacks
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent browsers from incorrectly detecting non-scripts as scripts
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Force HTTPS by telling browsers to always use it
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self';",
  );

  next();
};

/**
 * CORS Configuration Middleware
 * Configures Cross-Origin Resource Sharing policy
 */
export const corsConfig = (options?: CorsOptions) => {
  const defaultOptions: CorsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://superclip.example.com']
        : true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400, // 24 hours
  };

  return cors(options || defaultOptions);
};

/**
 * Rate Limiter Middleware
 * Limits number of requests a client can make in a given time window
 */
export const rateLimiter = (options?: any) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the RateLimit-* headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
    message: {
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit. Please try again later.',
    },
    skip: (req: Request) => {
      // Skip rate limiting for admin users or internal services if needed
      const isInternalRequest = req.headers['x-api-key'] === process.env.INTERNAL_API_KEY;
      return isInternalRequest;
    },
  };

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * XSS Protection Middleware
 * Sanitizes user input to prevent Cross-Site Scripting (XSS) attacks
 */
export const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip if no body or body is not an object
  if (!req.body || typeof req.body !== 'object') {
    next();
    return;
  }

  // Sanitize a string to prevent XSS
  const sanitizeString = (input: string): string => {
    // Replace potentially dangerous HTML content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '')
      .replace(/on\w+=\w+/g, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  };

  // Function to sanitize an object's string properties
  const sanitizeObject = (obj: Record<string, any>): void => {
    Object.keys(obj).forEach(key => {
      // If property is a string, sanitize it
      if (typeof obj[key] === 'string') {
        // Use a function that removes potential XSS content
        obj[key] = sanitizeString(obj[key]);
      }
      // If property is an object, recursively sanitize
      else if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        sanitizeObject(obj[key]);
      }
      // If property is an array, sanitize each string item
      else if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any, index: number) => {
          if (typeof item === 'string') {
            obj[key][index] = sanitizeString(item);
          } else if (item && typeof item === 'object') {
            sanitizeObject(item);
          }
        });
      }
    });
  };

  // Apply sanitization to the request body
  sanitizeObject(req.body);

  next();
};
