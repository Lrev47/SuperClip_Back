# logger.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This utility provides a centralized logging system for the application. It offers structured logging across different environments with varying log levels and supports multiple output formats and destinations. The logger captures application events, errors, and performance metrics to aid in monitoring, debugging, and auditing.

## Dependencies
- External packages:
  - winston (for logging framework)
  - morgan (for HTTP request logging)
  - express (for middleware integration)
- Internal modules:
  - ../config/environment (for environment-specific configurations)

## Inputs/Outputs
- **Input**: Log messages, metadata, log level
- **Output**: Formatted log entries to console, files, or external services

## Data Types
```typescript
import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
}

// Log metadata interface
export interface LogMetadata {
  [key: string]: any;
  timestamp?: string;
  level?: string;
  service?: string;
  correlation_id?: string;
}

// Logger configuration options
export interface LoggerOptions {
  level: LogLevel;
  format?: string; // 'json' | 'simple' | 'pretty'
  transports?: Transport[];
  silent?: boolean;
  service?: string;
}

// HTTP request logging options
export interface RequestLoggerOptions {
  format?: string;
  skip?: (req: Request, res: Response) => boolean;
}
```

## API/Methods
### createLogger
- Description: Creates and configures a new logger instance
- Signature: `createLogger(options?: LoggerOptions): winston.Logger`
- Parameters:
  - options: Configuration options for the logger
- Returns: Configured Winston logger instance
- Usage: `const logger = createLogger({ level: LogLevel.INFO })`

### logger
- Description: Default pre-configured logger instance for application-wide use
- Usage: `logger.info('User logged in', { userId: user.id })`

### log
- Description: Log a message with specified level and metadata
- Signature: `log(level: LogLevel, message: string, metadata?: LogMetadata): void`
- Parameters:
  - level: Severity level of the log message
  - message: The log message
  - metadata: Additional contextual information
- Usage: `log(LogLevel.INFO, 'Database connection established', { dbName: 'main' })`

### error, warn, info, debug
- Description: Convenience methods for logging at specific levels
- Signatures:
  - `error(message: string, metadata?: LogMetadata): void`
  - `warn(message: string, metadata?: LogMetadata): void`
  - `info(message: string, metadata?: LogMetadata): void`
  - `debug(message: string, metadata?: LogMetadata): void`
- Usage: `info('Server started', { port: config.port })`

### requestLogger
- Description: Middleware for logging HTTP requests
- Signature: `requestLogger(options?: RequestLoggerOptions): RequestHandler`
- Parameters:
  - options: Configuration options for request logging
- Returns: Express middleware function
- Usage: `app.use(requestLogger())`

### errorLogger
- Description: Middleware for logging errors in request processing
- Signature: `errorLogger(): ErrorRequestHandler`
- Returns: Express error handling middleware
- Usage: `app.use(errorLogger())`

### startRequestTimer
- Description: Middleware to start timing request duration
- Signature: `startRequestTimer(): RequestHandler`
- Returns: Express middleware function
- Usage: `app.use(startRequestTimer())`

### logRequestDuration
- Description: Logs the duration of request processing
- Signature: `logRequestDuration(req: Request, res: Response): void`
- Parameters:
  - req: Express request object
  - res: Express response object
- Usage: Used internally or `app.use((req, res, next) => { next(); logRequestDuration(req, res); })`

## Test Specifications
### Unit Tests
- Should create a logger with default options
- Should log messages at different levels correctly
- Should format logs according to configuration
- Should include metadata in log messages
- Should respect log level filtering (e.g., debug logs shouldn't appear when level is set to info)
- Should handle errors in the logging process gracefully

### Integration Tests
- Should log HTTP requests correctly
- Should measure and log request duration accurately
- Should integrate with Express middleware chain properly
- Should log to files (if configured) with proper rotation
- Should capture and log uncaught exceptions

## Implementation Notes
1. **Environment-specific Configuration**:
   - Development: Pretty console output with all levels
   - Testing: Minimal or silent logging
   - Production: JSON format with file transport and error reporting

2. **Performance Considerations**:
   - Use asynchronous logging when appropriate
   - Implement log rotation for file transports
   - Consider batching logs for external transports

3. **Security Aspects**:
   - Never log sensitive information (passwords, tokens, PII)
   - Implement proper sanitization for user inputs
   - Consider encryption for logs containing sensitive data

4. **Best Practices**:
   - Use correlation IDs to track requests across services
   - Include contextual information in logs
   - Structure logs consistently for easier parsing
   - Set appropriate log levels for different environments

5. **Edge Cases**:
   - Handle circular references in log metadata
   - Gracefully handle transport failures
   - Implement fallback mechanism for critical logs

## Related Files
- src/config/logger.config.ts
- src/middleware/logging.middleware.ts
- src/app.ts (for logger initialization)
- src/types/logger.ts (optional type definitions)
