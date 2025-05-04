# validation.middleware.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This middleware provides validation mechanisms for WebSocket event data in the SuperClip application. It validates incoming WebSocket messages and event payloads against predefined schemas to ensure data integrity, prevent malformed data processing, and enhance application security. The middleware allows defining validation rules for different events and provides standardized error responses for validation failures.

## Dependencies

- External packages:
  - socket.io (for WebSocket server)
  - zod (for schema validation)
- Internal modules:
  - ../../utils/validation (for validation utilities)
  - ../../types/websocket (for WebSocket type definitions)
  - ../../types/error (for error type definitions)

## Inputs/Outputs

- **Input**: WebSocket event payload and validation schema
- **Output**: Validated payload or error response

## Data Types

```typescript
import { Socket } from 'socket.io';
import { z } from 'zod';

// Event validation schema map
export interface EventSchemaMap {
  [eventName: string]: z.ZodType<any>;
}

// Validation result
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Validation error format
export interface ValidationError {
  path: string;
  message: string;
}

// Validation options
export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
}

// WebSocket validation middleware function type
export type WebSocketValidationMiddleware = (socket: Socket) => void;
```

## API/Methods

### validateEventPayloads

- Description: Main validation middleware that applies schemas to socket events
- Signature: `validateEventPayloads(schemas: EventSchemaMap, options?: ValidationOptions): WebSocketValidationMiddleware`
- Parameters:
  - schemas: Map of event names to Zod schemas
  - options: Optional validation configuration
- Returns: Socket.IO middleware function that validates event payloads
- Usage: `io.use(validateEventPayloads({ 'update:clip': clipUpdateSchema }))`

### validatePayload

- Description: Validates a single event payload against a schema
- Signature: `validatePayload<T>(payload: any, schema: z.ZodType<T>, options?: ValidationOptions): ValidationResult<T>`
- Parameters:
  - payload: Data to validate
  - schema: Zod schema to validate against
  - options: Optional validation configuration
- Returns: Validation result with success flag and data or errors
- Usage: `const result = validatePayload(data, schema)`

### registerEventValidators

- Description: Attaches validation middleware to specific socket events
- Signature: `registerEventValidators(socket: Socket, schemas: EventSchemaMap, options?: ValidationOptions): void`
- Parameters:
  - socket: Socket instance to attach validators to
  - schemas: Map of event names to validation schemas
  - options: Optional validation configuration
- Usage: `registerEventValidators(socket, { 'chat:message': messageSchema })`

### createEventValidator

- Description: Creates a validation middleware for a specific event
- Signature: `createEventValidator<T>(schema: z.ZodType<T>, handler: Function, options?: ValidationOptions): Function`
- Parameters:
  - schema: Zod schema for validation
  - handler: Event handler function
  - options: Optional validation configuration
- Returns: Wrapped handler with validation
- Usage: `socket.on('chat:message', createEventValidator(messageSchema, handleChatMessage))`

### formatValidationError

- Description: Formats validation errors into a standardized structure
- Signature: `formatValidationError(error: z.ZodError): ValidationError[]`
- Parameters:
  - error: Zod error object
- Returns: Array of formatted validation errors
- Usage: `const formattedErrors = formatValidationError(error)`

## Test Specifications

### Unit Tests

- Should validate correct event data successfully
- Should reject invalid event data with proper error messages
- Should respect validation options
- Should correctly format validation errors
- Should apply schema transformations when specified
- Should handle nested object validation

### Integration Tests

- Should intercept events and validate data before handlers
- Should pass valid data to event handlers
- Should prevent invalid data from reaching handlers
- Should maintain proper event flow for valid data
- Should emit validation error events when configured

## Implementation Notes

1. **Validation Strategy**:

   - Define schemas for each WebSocket event type
   - Validate data as early as possible in the event lifecycle
   - Use consistent error response format
   - Consider default values and data transformations
   - Support partial validation for update operations

2. **Performance Considerations**:

   - Cache compiled schemas for better performance
   - Consider the overhead of validation for high-frequency events
   - Optimize validation for critical message paths
   - Use appropriate validation complexity for message importance

3. **Security Aspects**:

   - Validate all user-provided data
   - Set appropriate maximum limits for arrays and string lengths
   - Prevent prototype pollution and injection attacks
   - Sanitize inputs where necessary
   - Reject oversized payloads before validation

4. **Error Handling**:

   - Provide clear, actionable error messages
   - Include field paths in error responses
   - Do not expose internal validation logic
   - Log validation failures appropriately
   - Consider i18n for error messages

5. **Edge Cases**:
   - Handle empty payloads appropriately
   - Set reasonable defaults for optional fields
   - Handle different data types and conversions
   - Consider validation of binary data and file uploads
   - Support conditional validation based on event context

## Related Files

- srcSudo/websockets/server.ts
- srcSudo/websockets/handlers/\*.handler.ts
- srcSudo/utils/validation.ts
- srcSudo/schemas/websocket/\*.schema.ts
- srcSudo/types/websocket.ts
