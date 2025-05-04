# logging.middleware.ts

- [x] Test file made
- [x] File made
- [x] File passed the tests

## Purpose

Middleware that provides comprehensive logging for all HTTP requests and responses. Captures request details, timing information, and response data for monitoring, debugging, and audit purposes.

## Dependencies

- express
- morgan (for basic HTTP logging)
- winston (for advanced logging capabilities)
- Custom logger configuration

## Inputs/Outputs

- **Input**: HTTP request and response objects
- **Output**: Log entries with request/response details to console, files, or external services

## Data Types

```typescript
// Logger configuration
interface LoggerConfig {
  level: string;
  format: string;
  outputFile?: string;
  console: boolean;
}

// Log entry structure
interface RequestLogEntry {
  timestamp: string;
  method: string;
  url: string;
  ip: string;
  userId?: string;
  responseTime: number;
  statusCode: number;
  userAgent: string;
  requestId: string;
}

// Extended Express Request
declare namespace Express {
  interface Request {
    startTime?: number;
    requestId?: string;
  }
}
```

## API/Methods

### requestLogger

- Description: Middleware that logs incoming HTTP requests
- Signature: `requestLogger(req: Request, res: Response, next: NextFunction): void`
- Parameters:
  - req: Express Request object
  - res: Express Response object
  - next: Express NextFunction for middleware chain
- Returns: Calls next() after setting up response logging hooks

### errorLogger

- Description: Specialized logger for error events
- Signature: `errorLogger(err: Error, req: Request, res: Response, next: NextFunction): void`
- Parameters:
  - err: Error object thrown in the application
  - req: Express Request object
  - res: Express Response object
  - next: Express NextFunction for error middleware chain
- Returns: Logs error details and passes to next error handler

## Test Specifications

### Unit Tests

- Should generate unique request ID for each request
- Should record request start time
- Should capture core request details (method, URL, IP)
- Should capture response status code and timing
- Should capture user ID when authenticated
- Should support different log formats and levels
- Should redact sensitive information

### Integration Tests

- Should successfully log all API requests
- Should log errors with appropriate level and details
- Should not interfere with request/response flow
- Should handle high-volume request logging efficiently

## Implementation Notes

1. **Request Tracking**:

   - Generate unique request ID for each request for traceability
   - Track request timing from start to finish
   - Capture response status and size

2. **Data Protection**:

   - Redact sensitive data (passwords, tokens, PII) from logs
   - Comply with privacy regulations (GDPR, CCPA)
   - Mask sensitive headers and request bodies

3. **Performance Considerations**:

   - Asynchronous logging to prevent request handling delays
   - Log rotation for high-volume environments
   - Configurable log levels by environment

4. **Contextual Information**:
   - Include user ID for authenticated requests
   - Capture client information (user agent, IP)
   - Store correlation IDs for distributed tracing

## Related Files

- app.ts
- logger.config.ts
- error.middleware.ts
