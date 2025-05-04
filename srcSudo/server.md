# server.ts

- [x] Test file made
- [x] File made
- [x] File passed the tests

## Purpose

The entry point of the application that bootstraps the Express server. This file handles server initialization, port configuration, and process error handling for graceful shutdowns.

## Dependencies

- http (Node.js core module)
- dotenv
- app.ts (main Express application)

## Inputs/Outputs

- **Input**: Environment variables from .env file (PORT, NODE_ENV)
- **Output**: HTTP server instance

## Data Types

```typescript
// No specific DTOs for server initialization
// Server instance is of type http.Server
```

## API/Methods

No public API methods. This file is responsible for bootstrapping the server with the following functionality:

- Server initialization
- Port configuration
- Error handling process hooks
- Graceful shutdown

## Implementation Notes

1. **Environment Configuration**:

   - Load environment variables using dotenv
   - Set PORT from environment or use default (3000)
   - Configure based on NODE_ENV (development, production, test)

2. **Server Initialization**:

   - Import Express app from app.ts
   - Create HTTP server with app
   - Listen on configured port
   - Log server start information

3. **Error Handling**:

   - Set up unhandledRejection handler
     - Log error details
     - Close server gracefully
     - Exit process with error code
   - Set up uncaughtException handler
     - Log error details
     - Exit process with error code
   - Handle SIGINT for graceful shutdown
     - Close any database connections
     - Shut down server
     - Exit process normally

4. **Node.js Specifics**:
   - Use proper TypeScript types for Node.js objects
   - Handle async operations correctly in shutdown procedures
   - Implement proper logging for server events
