# encryption.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This utility file provides secure encryption and hashing functions for sensitive data in the application. It handles password hashing, JWT operations, and general-purpose encryption/decryption functions.

## Dependencies
- External packages:
  - bcrypt
  - jsonwebtoken
  - crypto
- Internal modules:
  - ../config/auth (for getting auth configuration)
  - ../types/common (for error types)

## Inputs/Outputs
- **Input**: Plain text data, encryption keys, configuration options
- **Output**: Encrypted data, hashed passwords, JWT tokens, verification results

## Data Types
```typescript
import { JwtConfig } from '../config/auth';

// JWT token payload
export interface TokenPayload {
  userId: string;
  deviceId?: string;
  hasSubscription?: boolean;
  [key: string]: any;
}

// JWT token response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Password hash options
export interface HashOptions {
  saltRounds?: number;
  pepper?: string;
}
```

## API/Methods
### hashPassword
- Description: Securely hashes a password using bcrypt
- Signature: `hashPassword(password: string, options?: HashOptions): Promise<string>`
- Parameters:
  - password: Plain text password to hash
  - options: Optional hashing configuration
- Returns: Promise resolving to hashed password string
- Throws: Error if hashing fails

### comparePassword
- Description: Compares a plain text password with a hash
- Signature: `comparePassword(password: string, hash: string, options?: HashOptions): Promise<boolean>`
- Parameters:
  - password: Plain text password to verify
  - hash: Stored password hash to compare against
  - options: Optional hashing configuration
- Returns: Promise resolving to boolean indicating match
- Throws: Error if comparison fails

### generateTokens
- Description: Generates JWT access and refresh tokens
- Signature: `generateTokens(payload: TokenPayload, config?: Partial<JwtConfig>): TokenResponse`
- Parameters:
  - payload: Data to encode in the token
  - config: Optional JWT configuration overrides
- Returns: Object containing tokens and expiration
- Throws: Error if token generation fails

### verifyToken
- Description: Verifies and decodes a JWT token
- Signature: `verifyToken(token: string, isRefreshToken: boolean = false): TokenPayload`
- Parameters:
  - token: JWT token to verify
  - isRefreshToken: Whether this is a refresh token
- Returns: Decoded token payload
- Throws: Error if token is invalid or expired

### encrypt
- Description: Encrypts data using AES-256-GCM
- Signature: `encrypt(text: string, key: string): string`
- Parameters:
  - text: Plain text to encrypt
  - key: Encryption key
- Returns: Encrypted string (base64)
- Throws: Error if encryption fails

### decrypt
- Description: Decrypts AES-256-GCM encrypted data
- Signature: `decrypt(encryptedText: string, key: string): string`
- Parameters:
  - encryptedText: Encrypted string (base64)
  - key: Encryption key
- Returns: Decrypted plain text
- Throws: Error if decryption fails

## Test Specifications
### Unit Tests
- Should hash passwords securely
- Should correctly verify passwords against hashes
- Should generate valid JWT tokens with correct payload
- Should verify and decode valid tokens
- Should reject expired or invalid tokens
- Should encrypt and decrypt data correctly
- Should reject decryption with incorrect key

### Integration Tests
- Should integrate with authentication flow
- Should handle token expiration correctly
- Should allow refresh token usage

## Implementation Notes
1. **Security Best Practices**:
   - Use appropriate work factors for bcrypt (higher in production)
   - Implement proper JWT token expiration
   - Use secure encryption algorithms and modes
   - Avoid weak keys and predictable initialization vectors

2. **Performance Considerations**:
   - Hashing is CPU-intensive; consider appropriate cost factors
   - Cache expensive operations where appropriate
   - Use async functions for CPU-bound operations

3. **Edge Cases**:
   - Handle token expiration gracefully
   - Implement proper error messages without revealing sensitive information
   - Add protection against timing attacks

## Related Files
- src/config/auth.ts
- src/middleware/auth.middleware.ts
- src/services/auth.service.ts
- src/controllers/auth.controller.ts
