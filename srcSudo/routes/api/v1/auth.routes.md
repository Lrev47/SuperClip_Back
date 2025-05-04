# auth.routes.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This file defines the API routes for authentication and authorization in the SuperClip application. It maps HTTP endpoints to the appropriate controller methods in the auth controller and applies necessary middleware for validation, security, and rate limiting. The routes provide functionality for user authentication, token management, and security features.

## Dependencies

- External packages:
  - express
- Internal modules:
  - ../controllers/auth.controller.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/validation.middleware.ts
  - ../middlewares/security.middleware.ts
  - ../middlewares/rateLimit.middleware.ts

## Route Definitions

### Register

- **Method**: POST
- **Path**: `/api/v1/auth/register`
- **Description**: Register a new user account
- **Middleware**:
  - validateBody (validates registration data)
  - rateLimit('registration') (prevents registration abuse)
  - securityHeaders (sets appropriate security headers)
- **Controller**: AuthController.register
- **Auth Required**: No

### Login

- **Method**: POST
- **Path**: `/api/v1/auth/login`
- **Description**: Authenticate user and issue access and refresh tokens
- **Middleware**:
  - validateBody (validates login credentials)
  - rateLimit('login') (prevents brute force attacks)
  - securityHeaders (sets appropriate security headers)
- **Controller**: AuthController.login
- **Auth Required**: No

### Social Login

- **Method**: POST
- **Path**: `/api/v1/auth/social/:provider`
- **Description**: Authenticate user via social provider (Google, Facebook, Apple)
- **Middleware**:
  - validateParams (validates provider)
  - validateBody (validates provider token)
  - rateLimit('social') (prevents social login abuse)
  - securityHeaders (sets appropriate security headers)
- **Controller**: AuthController.socialLogin
- **Auth Required**: No

### Logout

- **Method**: POST
- **Path**: `/api/v1/auth/logout`
- **Description**: Invalidate the user's refresh token
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: AuthController.logout
- **Auth Required**: Yes

### Refresh Token

- **Method**: POST
- **Path**: `/api/v1/auth/refresh-token`
- **Description**: Issue a new access token using a valid refresh token
- **Middleware**:
  - validateBody (validates refresh token)
  - rateLimit('token') (prevents token abuse)
  - securityHeaders (sets appropriate security headers)
- **Controller**: AuthController.refreshToken
- **Auth Required**: No (uses refresh token instead)

### Verify Email

- **Method**: GET
- **Path**: `/api/v1/auth/verify-email/:token`
- **Description**: Verify a user's email address using a verification token
- **Middleware**:
  - validateParams (validates token)
- **Controller**: AuthController.verifyEmail
- **Auth Required**: No (uses verification token instead)

### Resend Verification Email

- **Method**: POST
- **Path**: `/api/v1/auth/resend-verification`
- **Description**: Resend email verification link
- **Middleware**:
  - authenticate (verifies user is logged in)
  - rateLimit('emailVerification') (prevents verification abuse)
- **Controller**: AuthController.resendVerification
- **Auth Required**: Yes

### Forgot Password

- **Method**: POST
- **Path**: `/api/v1/auth/forgot-password`
- **Description**: Request a password reset link
- **Middleware**:
  - validateBody (validates email)
  - rateLimit('passwordReset') (prevents reset request abuse)
- **Controller**: AuthController.forgotPassword
- **Auth Required**: No

### Reset Password

- **Method**: POST
- **Path**: `/api/v1/auth/reset-password`
- **Description**: Reset password using reset token
- **Middleware**:
  - validateBody (validates reset token and new password)
  - rateLimit('passwordReset') (prevents reset abuse)
- **Controller**: AuthController.resetPassword
- **Auth Required**: No (uses reset token instead)

### Enable Two-Factor Authentication

- **Method**: POST
- **Path**: `/api/v1/auth/2fa/enable`
- **Description**: Enable two-factor authentication
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: AuthController.enableTwoFactorAuth
- **Auth Required**: Yes

### Verify Two-Factor Authentication

- **Method**: POST
- **Path**: `/api/v1/auth/2fa/verify`
- **Description**: Verify two-factor authentication code
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates verification code)
- **Controller**: AuthController.verifyTwoFactorAuth
- **Auth Required**: Yes

### Disable Two-Factor Authentication

- **Method**: POST
- **Path**: `/api/v1/auth/2fa/disable`
- **Description**: Disable two-factor authentication
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates verification code)
- **Controller**: AuthController.disableTwoFactorAuth
- **Auth Required**: Yes

### Check Auth Status

- **Method**: GET
- **Path**: `/api/v1/auth/status`
- **Description**: Check if the user is authenticated and get auth status
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: AuthController.checkAuthStatus
- **Auth Required**: Yes

### Request API Key

- **Method**: POST
- **Path**: `/api/v1/auth/api-key`
- **Description**: Generate a new API key for programmatic access
- **Middleware**:
  - authenticate (verifies user is logged in)
  - requireRole(['ADMIN', 'PREMIUM']) (restricts to certain roles)
  - validateBody (validates API key purpose and scope)
- **Controller**: AuthController.generateApiKey
- **Auth Required**: Yes

### Revoke API Key

- **Method**: DELETE
- **Path**: `/api/v1/auth/api-key/:keyId`
- **Description**: Revoke an existing API key
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates key ID)
- **Controller**: AuthController.revokeApiKey
- **Auth Required**: Yes

### List API Keys

- **Method**: GET
- **Path**: `/api/v1/auth/api-keys`
- **Description**: List all active API keys for the user
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: AuthController.listApiKeys
- **Auth Required**: Yes

### Change Password

- **Method**: PUT
- **Path**: `/api/v1/auth/password`
- **Description**: Update the user's password
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates password data)
  - rateLimit('password') (prevents password change abuse)
- **Controller**: AuthController.changePassword
- **Auth Required**: Yes

## Implementation Notes

### Authentication Flow

- Registration creates a new user account and sends verification email
- Login authenticates a user and issues JWT tokens (access and refresh)
- Access tokens are short-lived (15-60 minutes)
- Refresh tokens are longer-lived (7-30 days) and stored securely
- Email verification is required for full account access

### Security Considerations

- Implement proper password hashing using bcrypt
- Store only password hashes, never plain passwords
- Protect against CSRF attacks with token validation
- Set secure HTTP-only cookies for refresh tokens
- Implement rate limiting for sensitive routes
- Use parameterized queries to prevent SQL injection
- Log authentication events for security monitoring
- Implement account lockout after multiple failed attempts
- Validate and sanitize all inputs
- Implement proper CORS policy

### Token Management

- Access tokens should be used for API authentication
- Refresh tokens should be stored securely (HTTP-only cookies)
- Implement token revocation mechanism
- Handle token rotation on potential compromise
- Store token issuance and revocation audit trail

### API Key Management

- API keys should be hashed in the database
- Scope API keys to specific operations
- Implement automatic key rotation policies
- Monitor and alert on unusual API key usage
- Rate limit API key usage

### Error Handling

- Return appropriate HTTP status codes for different error scenarios
- Provide clear error messages without exposing sensitive information
- Log authentication errors for security monitoring
- Handle edge cases like expired tokens gracefully

### Performance Considerations

- Implement efficient token verification
- Cache user permissions where appropriate
- Consider database indexing for auth-related queries
- Use asynchronous processing for email sending operations

## Related Files

- srcSudo/controllers/auth.controller.ts
- srcSudo/services/auth.service.ts
- srcSudo/repositories/user.repository.ts
- srcSudo/models/interfaces/user.interface.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/middleware/validation.middleware.ts
- srcSudo/middleware/security.middleware.ts
- srcSudo/middleware/rateLimit.middleware.ts
