import winston from 'winston';

// Create a Winston logger instance with appropriate configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

// When not in production, log to console with more readable format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  );
}

// Export the logger functions directly to match the mocked interface in tests
export const info = (message: string, meta?: Record<string, any>): void => {
  logger.info(message, meta);
};

export const error = (message: string, meta?: Record<string, any>): void => {
  logger.error(message, meta);
};

export default logger;
