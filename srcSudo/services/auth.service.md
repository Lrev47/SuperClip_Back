# auth.service.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the authentication and authorization service for the SuperClip application. It handles user registration, login, account verification, password management, session management, token validation, and permission enforcement. The service is responsible for securing API endpoints, managing refresh tokens, implementing multi-factor authentication, and handling OAuth integration for third-party authentication providers.

## Dependencies
- External packages:
  - @prisma/client
  - bcrypt (for password hashing)
  - jsonwebtoken (for JWT generation/validation)
  - zod (for validation)
  - crypto (Node.js built-in)
  - uuid
  - date-fns
  - nodemailer (for sending verification emails)
  - speakeasy (for TOTP generation/validation)
  - qrcode (for generating MFA QR codes)
- Internal modules:
  - ../repositories/user.repository.ts
  - ../repositories/device.repository.ts
  - ../repositories/token.repository.ts
  - ../utils/logger.ts
  - ../utils/error.ts
  - ../utils/validators.ts
  - ../utils/email.ts
  - ../models/interfaces/auth.interface.ts
  - ../models/interfaces/user.interface.ts
  - ../config/auth.config.ts
  - ../services/device.service.ts

## Inputs/Outputs
- **Input**: User credentials, registration data, token refresh requests, password reset requests, MFA setup/verification data
- **Output**: Authentication tokens, user data, verification status, operation results

## API/Methods
```typescript
import { UserRepository } from '../repositories/user.repository';
import { DeviceRepository } from '../repositories/device.repository';
import { TokenRepository } from '../repositories/token.repository';
import { Logger } from '../utils/logger';
import { AppError, ErrorCode } from '../utils/error';
import { EmailService } from '../utils/email';
import { AuthConfig } from '../config/auth.config';
import { DeviceService } from '../services/device.service';
import {
  User,
  Token,
  TokenType,
  Device,
  AuthMethod,
  MfaMethod,
  UserStatus,
  Prisma
} from '@prisma/client';
import {
  RegisterUserInput,
  LoginInput,
  AuthTokens,
  ResetPasswordInput,
  UpdatePasswordInput,
  MfaSetupResponse,
  VerificationResult,
  AuthUserResponse,
  OAuthProviderData,
  LoginAttempt,
  RefreshTokenResponse
} from '../models/interfaces/auth.interface';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as dateFns from 'date-fns';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { z } from 'zod';

export class AuthService {
  private userRepository: UserRepository;
  private deviceRepository: DeviceRepository;
  private tokenRepository: TokenRepository;
  private deviceService: DeviceService;
  private emailService: EmailService;
  private logger: Logger;
  private config: AuthConfig;

  constructor(
    userRepository: UserRepository,
    deviceRepository: DeviceRepository,
    tokenRepository: TokenRepository,
    deviceService: DeviceService,
    emailService: EmailService,
    logger: Logger,
    config: AuthConfig
  ) {
    this.userRepository = userRepository;
    this.deviceRepository = deviceRepository;
    this.tokenRepository = tokenRepository;
    this.deviceService = deviceService;
    this.emailService = emailService;
    this.logger = logger;
    this.config = config;
  }

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Created user and generated tokens
   */
  async registerUser(userData: RegisterUserInput): Promise<{
    user: AuthUserResponse;
    tokens: AuthTokens;
  }> {
    // Implementation
  }

  /**
   * Login user with email and password
   * @param loginData Login credentials
   * @param ipAddress User's IP address
   * @param userAgent User's browser agent
   * @returns User data and auth tokens
   */
  async login(
    loginData: LoginInput,
    ipAddress: string,
    userAgent: string
  ): Promise<{
    user: AuthUserResponse;
    tokens: AuthTokens;
    requiresMfa: boolean;
  }> {
    // Implementation
  }

  /**
   * Verify multi-factor authentication token
   * @param userId User ID
   * @param token MFA token
   * @param mfaMethod MFA method used
   * @returns Verification result with tokens if successful
   */
  async verifyMfaToken(
    userId: string,
    token: string,
    mfaMethod: MfaMethod
  ): Promise<{
    success: boolean;
    tokens?: AuthTokens;
  }> {
    // Implementation
  }

  /**
   * Setup multi-factor authentication
   * @param userId User ID
   * @param mfaMethod MFA method to setup
   * @returns MFA setup data
   */
  async setupMfa(
    userId: string,
    mfaMethod: MfaMethod
  ): Promise<MfaSetupResponse> {
    // Implementation
  }

  /**
   * Finalize MFA setup by verifying the initial token
   * @param userId User ID
   * @param token MFA token
   * @param mfaMethod MFA method used
   * @returns Success status
   */
  async finalizeMfaSetup(
    userId: string,
    token: string,
    mfaMethod: MfaMethod
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Disable multi-factor authentication
   * @param userId User ID
   * @param currentPassword Current password for verification
   * @returns Success status
   */
  async disableMfa(
    userId: string,
    currentPassword: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Refresh authentication tokens
   * @param refreshToken Refresh token
   * @param ipAddress User's IP address
   * @param userAgent User's browser agent
   * @returns New set of tokens
   */
  async refreshTokens(
    refreshToken: string,
    ipAddress: string,
    userAgent: string
  ): Promise<RefreshTokenResponse> {
    // Implementation
  }

  /**
   * Logout user from current device
   * @param userId User ID
   * @param refreshToken Refresh token
   * @returns Success status
   */
  async logout(
    userId: string,
    refreshToken: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Logout user from all devices
   * @param userId User ID
   * @param currentPassword Current password for verification
   * @returns Success status and count of sessions terminated
   */
  async logoutAllDevices(
    userId: string,
    currentPassword: string
  ): Promise<{
    success: boolean;
    count: number;
  }> {
    // Implementation
  }

  /**
   * Verify user email
   * @param token Verification token
   * @returns Verification result
   */
  async verifyEmail(token: string): Promise<VerificationResult> {
    // Implementation
  }

  /**
   * Resend email verification
   * @param email User email
   * @returns Success status
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Request password reset
   * @param email User email
   * @returns Success status
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Reset password with token
   * @param resetData Password reset data
   * @returns Success status
   */
  async resetPassword(resetData: ResetPasswordInput): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Update user password
   * @param userId User ID
   * @param passwordData Current and new password
   * @returns Success status
   */
  async updatePassword(
    userId: string,
    passwordData: UpdatePasswordInput
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Get user's active sessions
   * @param userId User ID
   * @returns Array of active sessions
   */
  async getUserSessions(userId: string): Promise<{
    id: string;
    deviceInfo: {
      name: string;
      type: string;
      lastActive: Date;
      ipAddress: string;
      userAgent: string;
    };
  }[]> {
    // Implementation
  }

  /**
   * Authenticate with OAuth provider
   * @param provider OAuth provider (google, apple, etc.)
   * @param providerData Provider-specific data
   * @param ipAddress User's IP address
   * @param userAgent User's browser agent
   * @returns User data and auth tokens
   */
  async authenticateWithOAuth(
    provider: string,
    providerData: OAuthProviderData,
    ipAddress: string,
    userAgent: string
  ): Promise<{
    user: AuthUserResponse;
    tokens: AuthTokens;
    isNewUser: boolean;
  }> {
    // Implementation
  }

  /**
   * Check if token is valid and not expired
   * @param token JWT token
   * @returns Token validity
   */
  async verifyToken(token: string): Promise<{
    valid: boolean;
    payload?: any;
  }> {
    // Implementation
  }

  /**
   * Get user details from valid access token
   * @param token Access token
   * @returns User data
   */
  async getUserFromToken(token: string): Promise<AuthUserResponse | null> {
    // Implementation
  }

  /**
   * Check if user has permission for specific action
   * @param userId User ID
   * @param permission Required permission
   * @param resourceId Optional resource ID for resource-specific permissions
   * @returns Whether user has permission
   */
  async hasPermission(
    userId: string,
    permission: string,
    resourceId?: string
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Generate secure tokens for authentication
   * @param userId User ID
   * @param deviceId Device ID
   * @returns Access and refresh tokens
   */
  private generateTokens(userId: string, deviceId: string): AuthTokens {
    // Implementation
  }

  /**
   * Create refresh token and store in database
   * @param userId User ID
   * @param deviceId Device ID
   * @param ipAddress IP address
   * @param userAgent User agent string
   * @returns Generated refresh token
   */
  private async createRefreshToken(
    userId: string,
    deviceId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<string> {
    // Implementation
  }

  /**
   * Hash password with bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    // Implementation
  }

  /**
   * Compare password with stored hash
   * @param password Plain text password
   * @param hashedPassword Stored password hash
   * @returns Whether password matches
   */
  private async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    // Implementation
  }

  /**
   * Generate verification token
   * @param userId User ID
   * @param type Token type
   * @param expiresIn Expiration time in minutes
   * @returns Generated token
   */
  private async generateVerificationToken(
    userId: string,
    type: TokenType,
    expiresIn: number = 60 * 24 // 24 hours
  ): Promise<string> {
    // Implementation
  }

  /**
   * Track login attempt for rate limiting
   * @param email User email
   * @param ipAddress IP address
   * @param success Whether login was successful
   * @returns Updated login attempt count
   */
  private async trackLoginAttempt(
    email: string,
    ipAddress: string,
    success: boolean
  ): Promise<LoginAttempt> {
    // Implementation
  }

  /**
   * Check if account is locked due to too many failed attempts
   * @param email User email
   * @param ipAddress IP address
   * @returns Whether account is temporarily locked
   */
  private async isAccountLocked(
    email: string,
    ipAddress: string
  ): Promise<boolean> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should register a new user successfully
- Should hash passwords during registration
- Should generate proper tokens on login
- Should validate login credentials
- Should prevent login with incorrect password
- Should track login attempts for rate limiting
- Should lock accounts after multiple failed login attempts
- Should refresh tokens successfully
- Should invalidate used refresh tokens
- Should logout by invalidating refresh token
- Should logout from all devices
- Should verify email address with token
- Should resend verification email
- Should generate password reset token
- Should reset password with valid token
- Should reject invalid password reset tokens
- Should update user password with verification
- Should track user sessions
- Should setup multi-factor authentication
- Should verify MFA tokens
- Should disable MFA with password verification
- Should authenticate with OAuth providers
- Should link multiple OAuth providers to a single account
- Should verify JWTs and extract payload
- Should check user permissions correctly
- Should handle token expiration
- Should validate tokens against token blacklist
- Should generate secure cryptographically sound tokens
- Should properly hash and verify passwords
- Should handle validation errors for inputs

### Integration Tests
- Should integrate with user repository for user operations
- Should integrate with device repository for device management
- Should integrate with token repository for token operations
- Should integrate with email service for notifications
- Should integrate with device service for device verification
- Should ensure consistent token lifecycle management
- Should maintain authentication state across requests
- Should enforce password policies
- Should properly handle account verification
- Should ensure MFA workflow integrity
- Should implement proper rate limiting
- Should maintain secure session management
- Should enforce proper token rotation
- Should implement proper error handling
- Should support OAuth authentication flows
- Should integrate with external OAuth providers
- Should properly handle token revocation

## Implementation Notes
1. **Authentication Flow**:
   - Implement email/password authentication
   - Support OAuth authentication flows (Google, Apple, Microsoft, etc.)
   - Implement JWT-based authentication with access and refresh tokens
   - Enforce proper token lifecycle management
   - Implement secure session handling
   - Support remembering devices for trusted environments
   - Consider implementing passwordless login options
   - Implement strong rate limiting to prevent brute force attacks

2. **Password Management**:
   - Use strong password hashing with bcrypt
   - Implement password strength requirements
   - Support secure password reset flows
   - Implement account recovery mechanisms
   - Track password history to prevent reuse
   - Enforce periodic password rotation for sensitive accounts
   - Implement secure password storage practices
   - Support password change notification

3. **Multi-Factor Authentication**:
   - Support TOTP-based authentication (Google Authenticator, Authy)
   - Implement backup codes for account recovery
   - Support email and SMS verification codes as fallback
   - Consider WebAuthn/FIDO2 support for passwordless authentication
   - Implement proper MFA enrollment flow
   - Support MFA method management
   - Provide clear instructions for MFA setup
   - Implement proper rate limiting for MFA attempts

4. **Token Management**:
   - Implement short-lived access tokens (15-30 minutes)
   - Use refresh tokens with proper rotation
   - Maintain token blacklist for revoked tokens
   - Implement proper token validation
   - Include necessary claims in tokens
   - Support token revocation for security events
   - Implement secure token storage in database
   - Consider using signed JWT for stateless authentication

5. **Security Considerations**:
   - Implement proper input validation
   - Apply rate limiting for sensitive operations
   - Track and log authentication events
   - Implement account lockout after failed attempts
   - Support IP-based restrictions for sensitive accounts
   - Implement suspicious activity detection
   - Maintain audit trails for security-relevant actions
   - Consider implementing risk-based authentication
   - Protect against common authentication vulnerabilities

6. **Error Handling and Edge Cases**:
   - Handle account verification gracefully
   - Deal with expired tokens appropriately
   - Support account migration and merging
   - Handle device changes and new device login alerts
   - Implement appropriate error messages without information leakage
   - Provide secure account recovery options
   - Handle concurrent login attempts
   - Support graceful degradation for MFA

## Related Files
- src/models/interfaces/auth.interface.ts
- src/models/interfaces/user.interface.ts
- src/repositories/user.repository.ts
- src/repositories/token.repository.ts
- src/repositories/device.repository.ts
- src/controllers/auth.controller.ts
- src/routes/auth.routes.ts
- src/middleware/auth.middleware.ts
- src/middleware/rate-limiter.middleware.ts
- src/utils/validators.ts
- src/utils/email.ts
- src/config/auth.config.ts
- src/services/device.service.ts
