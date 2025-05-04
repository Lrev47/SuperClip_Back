# auth.controller.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the authentication controller for the SuperClip application. It handles HTTP request and response processing for all authentication-related operations, including user registration, login, logout, token refreshing, password management, email verification, and multi-factor authentication. It acts as the interface between the client applications and the auth service, implementing proper input validation, error handling, and response formatting.

## Dependencies
- External packages:
  - express
  - zod (for validation)
  - cookie-parser
- Internal modules:
  - ../services/auth.service.ts
  - ../utils/logger.ts
  - ../utils/error.ts
  - ../utils/response.ts
  - ../utils/validators.ts
  - ../middleware/rate-limit.middleware.ts
  - ../models/interfaces/auth.interface.ts
  - ../config/auth.config.ts

## Inputs/Outputs
- **Input**: HTTP requests with authentication data, headers, cookies, query parameters
- **Output**: HTTP responses with authentication results, tokens, user data, status codes

## API/Methods
```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { Logger } from '../utils/logger';
import { AppError, ErrorCode } from '../utils/error';
import { ResponseHandler } from '../utils/response';
import { validateRequest } from '../utils/validators';
import { 
  RegisterUserSchema, 
  LoginSchema, 
  PasswordResetRequestSchema,
  PasswordResetSchema,
  PasswordUpdateSchema,
  MfaSetupSchema,
  MfaVerifySchema,
  EmailVerificationSchema
} from '../models/schemas/auth.schema';
import { AuthConfig } from '../config/auth.config';
import { MfaMethod } from '@prisma/client';
import { z } from 'zod';

export class AuthController {
  private authService: AuthService;
  private logger: Logger;
  private config: AuthConfig;
  private responseHandler: ResponseHandler;

  constructor(
    authService: AuthService,
    logger: Logger,
    config: AuthConfig
  ) {
    this.authService = authService;
    this.logger = logger;
    this.config = config;
    this.responseHandler = new ResponseHandler(logger);
  }

  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = validateRequest(req.body, RegisterUserSchema);
      
      const result = await this.authService.registerUser(validatedData);
      
      this.setAuthCookies(res, result.tokens);
      
      this.responseHandler.success(res, {
        message: 'User registered successfully',
        user: result.user,
        tokens: this.config.sendTokensInResponse ? result.tokens : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * @route POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = validateRequest(req.body, LoginSchema);
      
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent') || '';
      
      const result = await this.authService.login(validatedData, ipAddress, userAgent);
      
      if (result.requiresMfa) {
        return this.responseHandler.success(res, {
          requiresMfa: true,
          userId: result.user.id
        });
      }
      
      this.setAuthCookies(res, result.tokens);
      
      this.responseHandler.success(res, {
        message: 'Login successful',
        user: result.user,
        tokens: this.config.sendTokensInResponse ? result.tokens : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify MFA token
   * @route POST /api/auth/mfa/verify
   */
  async verifyMfaToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = validateRequest(req.body, MfaVerifySchema);
      
      const result = await this.authService.verifyMfaToken(
        validatedData.userId,
        validatedData.token,
        validatedData.method as MfaMethod
      );
      
      if (!result.success) {
        throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid MFA token');
      }
      
      this.setAuthCookies(res, result.tokens!);
      
      this.responseHandler.success(res, {
        message: 'MFA verification successful',
        tokens: this.config.sendTokensInResponse ? result.tokens : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Setup MFA
   * @route POST /api/auth/mfa/setup
   */
  async setupMfa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = validateRequest(req.body, MfaSetupSchema);
      
      const result = await this.authService.setupMfa(
        req.user.id,
        validatedData.method as MfaMethod
      );
      
      this.responseHandler.success(res, {
        message: 'MFA setup initiated',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Finalize MFA setup
   * @route POST /api/auth/mfa/finalize
   */
  async finalizeMfaSetup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = validateRequest(req.body, MfaVerifySchema);
      
      const result = await this.authService.finalizeMfaSetup(
        req.user.id,
        validatedData.token,
        validatedData.method as MfaMethod
      );
      
      this.responseHandler.success(res, {
        message: 'MFA setup completed',
        success: result.success
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Disable MFA
   * @route DELETE /api/auth/mfa
   */
  async disableMfa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword } = req.body;
      
      if (!currentPassword) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Current password is required');
      }
      
      const result = await this.authService.disableMfa(req.user.id, currentPassword);
      
      this.responseHandler.success(res, {
        message: 'MFA disabled successfully',
        success: result.success
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh authentication tokens
   * @route POST /api/auth/refresh
   */
  async refreshTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        throw new AppError(ErrorCode.UNAUTHORIZED, 'Refresh token is required');
      }
      
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent') || '';
      
      const result = await this.authService.refreshTokens(refreshToken, ipAddress, userAgent);
      
      this.setAuthCookies(res, result.tokens);
      
      this.responseHandler.success(res, {
        message: 'Tokens refreshed successfully',
        tokens: this.config.sendTokensInResponse ? result.tokens : undefined,
        user: result.user
      });
    } catch (error) {
      // Clear cookies even on error
      this.clearAuthCookies(res);
      next(error);
    }
  }

  /**
   * Logout user from current device
   * @route POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      
      if (refreshToken) {
        await this.authService.logout(req.user.id, refreshToken);
      }
      
      this.clearAuthCookies(res);
      
      this.responseHandler.success(res, {
        message: 'Logged out successfully'
      });
    } catch (error) {
      this.clearAuthCookies(res);
      next(error);
    }
  }

  /**
   * Logout user from all devices
   * @route POST /api/auth/logout-all
   */
  async logoutAllDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword } = req.body;
      
      if (!currentPassword) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Current password is required');
      }
      
      const result = await this.authService.logoutAllDevices(req.user.id, currentPassword);
      
      this.clearAuthCookies(res);
      
      this.responseHandler.success(res, {
        message: 'Logged out from all devices',
        count: result.count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email address
   * @route GET /api/auth/verify-email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.query.token as string;
      
      if (!token) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Verification token is required');
      }
      
      const result = await this.authService.verifyEmail(token);
      
      // For web clients, redirect to a verification result page
      if (req.get('Accept')?.includes('text/html')) {
        return res.redirect(`${this.config.clientUrl}/email-verified?success=${result.success}`);
      }
      
      this.responseHandler.success(res, {
        message: result.success ? 'Email verified successfully' : 'Email verification failed',
        success: result.success
      });
    } catch (error) {
      // For web clients, redirect to an error page
      if (req.get('Accept')?.includes('text/html')) {
        return res.redirect(`${this.config.clientUrl}/email-verification-error`);
      }
      next(error);
    }
  }

  /**
   * Resend verification email
   * @route POST /api/auth/resend-verification
   */
  async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Email is required');
      }
      
      const result = await this.authService.resendVerificationEmail(email);
      
      this.responseHandler.success(res, {
        message: 'Verification email sent if the email exists',
        success: result.success
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   * @route POST /api/auth/forgot-password
   */
  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = validateRequest(req.body, PasswordResetRequestSchema);
      
      await this.authService.requestPasswordReset(validatedData.email);
      
      // Always return success even if email doesn't exist (security)
      this.responseHandler.success(res, {
        message: 'Password reset instructions sent if the email exists'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with token
   * @route POST /api/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = validateRequest(req.body, PasswordResetSchema);
      
      const result = await this.authService.resetPassword(validatedData);
      
      this.responseHandler.success(res, {
        message: 'Password reset successfully',
        success: result.success
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user password
   * @route PUT /api/auth/password
   */
  async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = validateRequest(req.body, PasswordUpdateSchema);
      
      const result = await this.authService.updatePassword(req.user.id, validatedData);
      
      this.responseHandler.success(res, {
        message: 'Password updated successfully',
        success: result.success
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's active sessions
   * @route GET /api/auth/sessions
   */
  async getUserSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await this.authService.getUserSessions(req.user.id);
      
      this.responseHandler.success(res, {
        sessions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticate with OAuth provider
   * @route POST /api/auth/oauth/:provider
   */
  async oauthAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider } = req.params;
      const providerData = req.body;
      
      if (!provider || !providerData) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Provider and authentication data are required');
      }
      
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent') || '';
      
      const result = await this.authService.authenticateWithOAuth(
        provider,
        providerData,
        ipAddress,
        userAgent
      );
      
      this.setAuthCookies(res, result.tokens);
      
      this.responseHandler.success(res, {
        message: result.isNewUser ? 'Account created successfully' : 'Login successful',
        user: result.user,
        isNewUser: result.isNewUser,
        tokens: this.config.sendTokensInResponse ? result.tokens : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user (from token)
   * @route GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.responseHandler.success(res, {
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set authentication cookies
   * @param res Express response object
   * @param tokens Auth tokens
   */
  private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }): void {
    // Set refresh token as HTTP Only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.config.refreshTokenExpiresIn * 1000 // convert seconds to milliseconds
    });
    
    // Set access token as non-HTTP Only cookie if configured
    if (this.config.storeAccessTokenInCookie) {
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: false, // Accessible by client JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: this.config.accessTokenExpiresIn * 1000 // convert seconds to milliseconds
      });
    }
  }

  /**
   * Clear authentication cookies
   * @param res Express response object
   */
  private clearAuthCookies(res: Response): void {
    res.clearCookie('refreshToken');
    
    if (this.config.storeAccessTokenInCookie) {
      res.clearCookie('accessToken');
    }
  }
}
```

## Test Specifications
### Unit Tests
- Should validate registration input correctly
- Should handle user registration process
- Should set auth cookies on successful registration
- Should validate login input correctly
- Should handle MFA verification during login if required
- Should handle login process for users without MFA
- Should validate MFA token input correctly
- Should handle MFA verification correctly
- Should handle MFA setup initiation
- Should validate MFA setup finalization
- Should handle MFA finalization correctly
- Should require current password for disabling MFA
- Should handle MFA disabling correctly
- Should require refresh token for token refreshing
- Should handle token refreshing correctly
- Should clear cookies on refresh token failure
- Should handle logout process
- Should clear cookies on logout
- Should require current password for logging out all devices
- Should handle logout from all devices correctly
- Should validate email verification token
- Should handle email verification redirects for web clients
- Should handle email verification for API clients
- Should validate email for verification resending
- Should handle verification email resending
- Should validate password reset request input
- Should handle password reset requests securely
- Should validate password reset input
- Should handle password reset process
- Should validate password update input
- Should require authentication for password updates
- Should handle password update process
- Should require authentication for getting user sessions
- Should handle retrieving user sessions
- Should validate OAuth provider and data
- Should handle OAuth authentication process
- Should require authentication for getting current user
- Should handle retrieving current user
- Should set appropriate cookies for authentication
- Should clear cookies correctly

### Integration Tests
- Should integrate with auth service for registration
- Should integrate with auth service for login
- Should integrate with auth service for MFA operations
- Should integrate with auth service for token refreshing
- Should integrate with auth service for logout operations
- Should integrate with auth service for email verification
- Should integrate with auth service for password operations
- Should integrate with auth service for OAuth authentication
- Should integrate with auth service for user session management
- Should handle error processing correctly
- Should implement rate limiting for sensitive endpoints
- Should validate inputs before processing
- Should set secure cookies in production environment
- Should manage token storage based on configuration
- Should respond with appropriate HTTP status codes
- Should format responses consistently
- Should handle authentication errors gracefully

## Implementation Notes
1. **Request Processing**:
   - Implement thorough validation for all inputs
   - Use Zod schemas for structured validation
   - Extract common validation logic into reusable functions
   - Parse request parameters, body, query consistently
   - Validate content types for file uploads
   - Handle multipart form data correctly
   - Process headers appropriately for client information
   - Extract IP address and user agent data securely

2. **Response Handling**:
   - Implement consistent response format
   - Structure error responses uniformly
   - Set appropriate HTTP status codes
   - Include only necessary information in responses
   - Implement cookie-based authentication where appropriate
   - Support both cookie and header-based token handling
   - Provide helpful error messages without revealing sensitive information
   - Support different response formats (JSON, redirects) based on client needs

3. **Security Considerations**:
   - Implement rate limiting for sensitive endpoints
   - Use HTTP-only cookies for refresh tokens
   - Implement CSRF protection
   - Validate token ownership before processing
   - Implement proper error handling to prevent information leakage
   - Use secure and same-site cookies in production
   - Implement IP-based rate limiting for login attempts
   - Clear sensitive data in error scenarios
   - Prevent timing attacks by using consistent response times

4. **Authentication Flow**:
   - Support complete registration flow with verification
   - Implement multi-step login with MFA
   - Support social login integration
   - Implement password reset flow
   - Support session management and termination
   - Implement proper token refresh mechanisms
   - Handle authentication edge cases (expired tokens, invalid refresh)
   - Support different authentication methods based on client type

5. **Error Handling**:
   - Use Next function for Express error processing
   - Create specific error types for different scenarios
   - Implement centralized error handling
   - Log errors appropriately without sensitive data
   - Return user-friendly error messages
   - Include error codes for client processing
   - Handle both expected and unexpected errors
   - Implement validation error formatting

6. **Integration with Services**:
   - Delegate business logic to auth service
   - Focus controller on HTTP processing
   - Pass properly validated data to services
   - Handle service response translation to HTTP
   - Implement proper error propagation
   - Use dependency injection for service access
   - Keep controllers thin and focused on request/response handling
   - Support service-level tracing and logging

## Related Files
- src/routes/auth.routes.ts
- src/middleware/auth.middleware.ts
- src/middleware/rate-limit.middleware.ts
- src/services/auth.service.ts
- src/models/schemas/auth.schema.ts
- src/models/interfaces/auth.interface.ts
- src/utils/response.ts
- src/utils/validators.ts
- src/config/auth.config.ts
