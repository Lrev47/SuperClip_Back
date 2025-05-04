# constants.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines application-wide constants that are used across different modules. It centralizes configuration values, limits, and defaults to ensure consistency throughout the application.

## Dependencies
- External packages: None
- Internal modules:
  - ../types/environment (for type definitions only)

## Inputs/Outputs
- **Input**: None (hardcoded values, some derived from environment variables)
- **Output**: Exported constant values and objects

## Data Types
```typescript
// API versioning
interface ApiVersions {
  current: string;
  supported: string[];
}

// Pagination defaults
interface PaginationDefaults {
  limit: number;
  maxLimit: number;
}

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  max: number;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  message: string;
}

// Content types supported
enum ClipType {
  TEXT = 'TEXT',
  CODE = 'CODE',
  AI_PROMPT = 'AI_PROMPT',
  IMAGE_URL = 'IMAGE_URL',
  RICH_TEXT = 'RICH_TEXT',
  SNIPPET = 'SNIPPET'
}

// Sync status types
enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING = 'PENDING',
  CONFLICT = 'CONFLICT',
  LOCAL_ONLY = 'LOCAL_ONLY'
}
```

## API/Methods
No methods, only exported constants:

### API Configuration
- `API_VERSIONS`: Object containing current and supported API versions
- `BASE_API_PATH`: Base path for all API endpoints (e.g., '/api')
- `DEFAULT_PAGINATION`: Default pagination settings for list endpoints

### Security Constants
- `PASSWORD_MIN_LENGTH`: Minimum password length
- `PASSWORD_MAX_LENGTH`: Maximum password length
- `TOKEN_EXPIRY`: JWT token expiration time
- `RATE_LIMIT`: Rate limiting configuration for API endpoints

### Application Limits
- `MAX_CLIP_SIZE`: Maximum size of clip content in bytes
- `MAX_FOLDER_DEPTH`: Maximum nesting level for folders
- `MAX_TAGS_PER_CLIP`: Maximum number of tags per clip

### Entity Constants
- `CLIP_TYPES`: Enum mapping of all supported clip content types
- `SYNC_STATUS_TYPES`: Enum mapping of all synchronization status types

## Test Specifications
### Unit Tests
- Should export all required constants
- Should have consistent values across environments
- Should have valid values for all configuration objects

## Implementation Notes
1. **Maintenance Considerations**:
   - Keep related constants grouped together for readability
   - Document each constant with clear purpose
   - Consider using enums for type safety with string values

2. **Best Practices**:
   - Export constants as frozen objects to prevent modification
   - Use TypeScript's const assertions for better type inference
   - Consider using environment variables for values that might change

3. **Edge Cases**:
   - Ensure constants are compatible with database schema limits
   - Consider internationalization implications for text constants
   - Document any performance implications of limit values

## Related Files
- src/types/environment.d.ts
- src/app.ts
- src/middleware/validation.middleware.ts
- src/middleware/security.middleware.ts
