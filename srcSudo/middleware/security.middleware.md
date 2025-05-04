# security.middleware.ts

- [x] Test file made
- [x] File made
- [x] File passed the tests

## Purpose

Middleware that implements various security measures to protect the application from common web vulnerabilities and attacks. Manages HTTP security headers, request validation, rate limiting, and other security-related concerns.

## Dependencies

- express
- helmet (for comprehensive security headers)
- express-rate-limit (for rate limiting)
- hpp (for HTTP Parameter Pollution protection)
- cors (for Cross-Origin Resource Sharing configuration)

## Inputs/Outputs

- **Input**: HTTP requests
- **Output**: Enhanced HTTP responses with security headers and protections

## Data Types

```typescript
// Security configuration options
interface SecurityConfig {
  cors: {
    origin: string[] | string | boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    credentials: boolean;
    maxAge: number;
  };
  rateLimiting: {
    windowMs: number;
    max: number;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  contentSecurity: {
    directives: Record<string, string[] | boolean>;
  };
}

// Rate limiter configuration for specific routes
interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string | object;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}
```

## API/Methods

### securityHeaders

- Description: Middleware that sets various security HTTP headers
- Signature: `securityHeaders(req: Request, res: Response, next: NextFunction): void`
- Parameters:
  - req: Express Request object
  - res: Express Response object
  - next: Express NextFunction for middleware chain
- Returns: Calls next() after setting security headers

### corsConfig

- Description: Configures Cross-Origin Resource Sharing (CORS) policy
- Signature: `corsConfig(options?: CorsOptions): (req: Request, res: Response, next: NextFunction) => void`
- Parameters:
  - options: Optional CORS configuration options
- Returns: CORS middleware function

### rateLimiter

- Description: Limits number of requests a client can make in a given time window
- Signature: `rateLimiter(options?: RateLimiterOptions): (req: Request, res: Response, next: NextFunction) => void`
- Parameters:
  - options: Optional rate limiting configuration options
- Returns: Rate limiter middleware function

### xssProtection

- Description: Provides protection against Cross-Site Scripting (XSS) attacks
- Signature: `xssProtection(req: Request, res: Response, next: NextFunction): void`
- Parameters:
  - req: Express Request object
  - res: Express Response object
  - next: Express NextFunction for middleware chain
- Returns: Calls next() after sanitizing request

## Test Specifications

### Unit Tests

- Should set all required security headers
- Should properly configure CORS with different options
- Should limit requests according to rate limiting configuration
- Should sanitize inputs to prevent XSS
- Should block HTTP Parameter Pollution attacks
- Should validate content security policy

### Integration Tests

- Should protect application from common security vulnerabilities
- Should properly handle CORS preflight requests
- Should enforce rate limits across multiple requests
- Should block malicious payloads and requests

### Security Tests

- Should pass OWASP Top 10 vulnerability checks
- Should resist common attack vectors

## Implementation Notes

1. **HTTP Security Headers**:

   - Set X-Content-Type-Options: nosniff
   - Set X-XSS-Protection: 1; mode=block
   - Set Content-Security-Policy with appropriate directives
   - Set Strict-Transport-Security for HTTPS enforcement
   - Set X-Frame-Options to prevent clickjacking

2. **Request Rate Limiting**:

   - Configure different rate limits for public vs. authenticated routes
   - Implement IP-based and user-based rate limiting
   - Configure appropriate response for rate limit exceeded

3. **Cross-Origin Resource Sharing**:

   - Configure different CORS policies for different environments
   - Allow specific origins in production
   - Handle preflight requests properly
   - Support credentials for authenticated requests when needed

4. **Input Validation**:
   - Sanitize user inputs to prevent XSS attacks
   - Validate request parameters and body
   - Prevent HTTP Parameter Pollution

## Related Files

- app.ts
- config.ts
- validation.middleware.ts
