# users.routes.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This file defines the API routes for user management and authentication in the SuperClip application. It maps HTTP endpoints to the appropriate controller methods in the user and auth controllers and applies necessary middleware for authentication, validation, and security. The routes provide functionality for user registration, login, profile management, account settings, and security operations.

## Dependencies

- External packages:
  - express
- Internal modules:
  - ../controllers/user.controller.ts
  - ../controllers/auth.controller.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/validation.middleware.ts
  - ../middlewares/security.middleware.ts
  - ../middlewares/rateLimit.middleware.ts

## Route Definitions

### User Registration

- **Method**: POST
- **Path**: `/api/v1/users/register`
- **Description**: Register a new user account
- **Middleware**:
  - validateBody (validates registration data)
  - rateLimit('registration') (prevents registration abuse)
  - securityHeaders (sets appropriate security headers)
- **Controller**: AuthController.register
- **Auth Required**: No

### User Login

- **Method**: POST
- **Path**: `/api/v1/users/login`
- **Description**: Authenticate user and issue access and refresh tokens
- **Middleware**:
  - validateBody (validates login credentials)
  - rateLimit('login') (prevents brute force attacks)
  - securityHeaders (sets appropriate security headers)
- **Controller**: AuthController.login
- **Auth Required**: No

### Logout

- **Method**: POST
- **Path**: `/api/v1/users/logout`
- **Description**: Invalidate the user's refresh token
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: AuthController.logout
- **Auth Required**: Yes

### Refresh Token

- **Method**: POST
- **Path**: `/api/v1/users/refresh-token`
- **Description**: Issue a new access token using a valid refresh token
- **Middleware**:
  - validateBody (validates refresh token)
  - rateLimit('token') (prevents token abuse)
  - securityHeaders (sets appropriate security headers)
- **Controller**: AuthController.refreshToken
- **Auth Required**: No (uses refresh token instead)

### Get Current User

- **Method**: GET
- **Path**: `/api/v1/users/me`
- **Description**: Get the profile of the currently authenticated user
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: UserController.getCurrentUser
- **Auth Required**: Yes

### Update User Profile

- **Method**: PUT
- **Path**: `/api/v1/users/profile`
- **Description**: Update the user's profile information
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates profile data)
- **Controller**: UserController.updateProfile
- **Auth Required**: Yes

### Change Password

- **Method**: PUT
- **Path**: `/api/v1/users/change-password`
- **Description**: Update the user's password
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates password data)
  - rateLimit('password') (prevents password change abuse)
- **Controller**: UserController.changePassword
- **Auth Required**: Yes

### Forgot Password

- **Method**: POST
- **Path**: `/api/v1/users/forgot-password`
- **Description**: Request a password reset link
- **Middleware**:
  - validateBody (validates email)
  - rateLimit('passwordReset') (prevents reset request abuse)
- **Controller**: AuthController.forgotPassword
- **Auth Required**: No

### Reset Password

- **Method**: POST
- **Path**: `/api/v1/users/reset-password`
- **Description**: Reset password using reset token
- **Middleware**:
  - validateBody (validates reset token and new password)
  - rateLimit('passwordReset') (prevents reset abuse)
- **Controller**: AuthController.resetPassword
- **Auth Required**: No (uses reset token instead)

### Verify Email

- **Method**: GET
- **Path**: `/api/v1/users/verify-email/:token`
- **Description**: Verify a user's email address using a verification token
- **Middleware**:
  - validateParams (validates token)
- **Controller**: AuthController.verifyEmail
- **Auth Required**: No (uses verification token instead)

### Resend Verification Email

- **Method**: POST
- **Path**: `/api/v1/users/resend-verification`
- **Description**: Resend email verification link
- **Middleware**:
  - authenticate (verifies user is logged in)
  - rateLimit('emailVerification') (prevents verification abuse)
- **Controller**: AuthController.resendVerification
- **Auth Required**: Yes

### Get User Preferences

- **Method**: GET
- **Path**: `/api/v1/users/preferences`
- **Description**: Get the user's application preferences
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: UserController.getPreferences
- **Auth Required**: Yes

### Update User Preferences

- **Method**: PUT
- **Path**: `/api/v1/users/preferences`
- **Description**: Update the user's application preferences
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates preferences data)
- **Controller**: UserController.updatePreferences
- **Auth Required**: Yes

### Get User Activities

- **Method**: GET
- **Path**: `/api/v1/users/activities`
- **Description**: Get the user's recent activities
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination parameters)
- **Controller**: UserController.getActivities
- **Auth Required**: Yes

### Update Account Status

- **Method**: PUT
- **Path**: `/api/v1/users/status`
- **Description**: Update the user's account status (active, inactive)
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates status data)
- **Controller**: UserController.updateAccountStatus
- **Auth Required**: Yes

### Enable Two-Factor Authentication

- **Method**: POST
- **Path**: `/api/v1/users/2fa/enable`
- **Description**: Enable two-factor authentication
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: AuthController.enableTwoFactorAuth
- **Auth Required**: Yes

### Verify Two-Factor Authentication

- **Method**: POST
- **Path**: `/api/v1/users/2fa/verify`
- **Description**: Verify two-factor authentication code
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates verification code)
- **Controller**: AuthController.verifyTwoFactorAuth
- **Auth Required**: Yes

### Disable Two-Factor Authentication

- **Method**: POST
- **Path**: `/api/v1/users/2fa/disable`
- **Description**: Disable two-factor authentication
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates verification code)
- **Controller**: AuthController.disableTwoFactorAuth
- **Auth Required**: Yes

### Delete Account

- **Method**: DELETE
- **Path**: `/api/v1/users/account`
- **Description**: Permanently delete user account
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates confirmation data)
- **Controller**: UserController.deleteAccount
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

### User Data Management

- Validate all user inputs against strict schemas
- Sanitize inputs to prevent XSS and other injection attacks
- Implement proper data access controls
- Follow data minimization principles
- Support GDPR compliance with data export and deletion
- Encrypt sensitive user data at rest

### Error Handling

- Return appropriate HTTP status codes for different error scenarios
- Provide clear error messages without exposing sensitive information
- Log authentication errors for security monitoring
- Handle edge cases like expired tokens gracefully

### Performance Considerations

- Implement efficient token verification
- Use caching for user preferences and frequently accessed data
- Consider database indexing for user lookup operations
- Optimize email sending operations with queues if high volume

## Related Files

- srcSudo/controllers/user.controller.ts
- srcSudo/controllers/auth.controller.ts
- srcSudo/services/user.service.ts
- srcSudo/services/auth.service.ts
- srcSudo/repositories/user.repository.ts
- srcSudo/models/interfaces/user.interface.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/middleware/validation.middleware.ts
- srcSudo/middleware/security.middleware.ts
- srcSudo/middleware/rateLimit.middleware.ts
