# logger.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file configures a centralized logging system for the application. It sets up appropriate log levels, formats, and transports based on the environment. It provides a consistent interface for logging throughout the application.

## Dependencies
- External packages:
  - winston
  - morgan
  - dotenv
- Internal modules:
  - ../types/environment

## Inputs/Outputs
- **Input**: Environment variables from .env file (NODE_ENV, LOG_LEVEL, etc.)
- **Output**: Configured logger instance with appropriate transports and formats

## Data Types
```typescript
// Log levels type
type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug' | 'silly';

// Logger configuration options
interface LoggerConfig {
  level: LogLevel;
  format: string; // 'json' | 'simple' | 'detailed'
  transports: {
    console: boolean;
    file: boolean;
    filePath?: string;
  };
  morganFormat?: string; // For HTTP request logging
}

// Log metadata interface
interface LogMeta {
  [key: string]: any;
  userId?: string;
  requestId?: string;
  service?: string;
  timestamp?: string;
}
```

## API/Methods
### getLogger
- Description: Returns the configured logger instance
- Signature: `getLogger(moduleName?: string): Logger`
- Parameters:
  - moduleName: Optional name of the module using the logger (for context)
- Returns: Logger instance with configured transports
- Throws: Error if logger configuration fails

### getMorganMiddleware
- Description: Returns a configured Morgan middleware for HTTP request logging
- Signature: `getMorganMiddleware(): RequestHandler`
- Returns: Express middleware function for HTTP logging
- Throws: Error if Morgan middleware configuration fails

### getLoggerConfig
- Description: Returns the current logger configuration
- Signature: `getLoggerConfig(): LoggerConfig`
- Returns: Object containing the current logger configuration

## Test Specifications
### Unit Tests
- Should configure with default log level when LOG_LEVEL is not set
- Should create logger with the correct transport configuration
- Should format logs correctly based on environment
- Should provide Morgan middleware with correct format

### Integration Tests
- Should log messages to the configured transports
- Should redact sensitive information from logs
- Should include correct metadata in log entries

## Implementation Notes
1. **Environment-specific Configuration**:
   - Use different log levels for development and production
   - Use detailed formats in development, JSON in production
   - Configure file transport with rotation in production

2. **Best Practices**:
   - Implement log sanitization to prevent sensitive data leakage
   - Include request IDs for request tracing
   - Use structured logging format for better searchability

3. **Edge Cases**:
   - Handle circular references in logged objects
   - Consider performance impact of verbose logging
   - Implement log throttling for high-volume logs

## Related Files
- src/utils/logger.ts
- src/middleware/logging.middleware.ts
- src/types/environment.d.ts
- src/app.ts
