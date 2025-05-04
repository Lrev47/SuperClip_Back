# auth.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines the authentication configuration settings for the application. It sets up JWT configuration, password hashing options, and authentication-related constants.

## Dependencies
- External packages:
  - jsonwebtoken
  - bcrypt
  - dotenv
- Internal modules:
  - ../types/environment

## Inputs/Outputs
- **Input**: Environment variables from .env file (JWT_SECRET, JWT_EXPIRES_IN, etc.)
- **Output**: Authentication configuration object with all required settings

## Data Types
```typescript
// JWT configuration settings
interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshTokenExpiresIn: string;
  issuer: string;
  audience: string;
}

// Password hashing configuration
interface PasswordHashingConfig {
  saltRounds: number;
  pepper?: string;
}

// Authentication configuration
interface AuthConfig {
  jwt: JwtConfig;
  passwordHashing: PasswordHashingConfig;
  accessTokenCookieName: string;
  refreshTokenCookieName: string;
  secureCookies: boolean;
}
```

## API/Methods
### getAuthConfig
- Description: Returns the authentication configuration
- Signature: `getAuthConfig(): AuthConfig`
- Returns: Complete authentication configuration object
- Throws: Error if required environment variables are missing

### getJwtConfig
- Description: Returns only the JWT configuration part
- Signature: `getJwtConfig(): JwtConfig`
- Returns: JWT configuration settings
- Throws: Error if JWT environment variables are missing

### getPasswordHashingConfig
- Description: Returns password hashing configuration
- Signature: `getPasswordHashingConfig(): PasswordHashingConfig`
- Returns: Password hashing configuration settings

## Test Specifications
### Unit Tests
- Should throw an error when JWT_SECRET is not set
- Should use default values when optional settings are not provided
- Should correctly parse environment variables
- Should return consistent configuration objects

### Integration Tests
- Should allow generating valid JWTs with the configuration
- Should allow verifying JWTs generated with the configuration
- Should properly hash and verify passwords with the configuration

## Implementation Notes
1. **Security Considerations**:
   - Ensure JWT secrets are sufficiently long and random
   - Configure appropriate JWT expiration times
   - Use environment variables for all sensitive configuration

2. **Configuration Validation**:
   - Validate all required environment variables on startup
   - Provide sensible defaults for non-critical settings
   - Log warnings for insecure configurations

3. **Edge Cases**:
   - Handle environment variability (development vs production)
   - Provide different cookie security settings based on environment
   - Consider token revocation strategies

## Related Files
- src/middleware/auth.middleware.ts
- src/services/auth.service.ts
- src/types/environment.d.ts
- src/utils/encryption.ts
