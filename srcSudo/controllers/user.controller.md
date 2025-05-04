# user.controller.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the HTTP request handlers/controllers for user-related operations in the SuperClip application. It processes incoming API requests for user registration, authentication, profile management, account settings, and user preferences. The controller validates user input data, interacts with the user service layer, and formats appropriate HTTP responses. It serves as the interface between the client applications and the user business logic.

## Dependencies
- External packages:
  - express
  - zod (for request validation)
  - http-status-codes
  - multer (for file uploads)
  - express-validator (for request validation)
- Internal modules:
  - ../services/user.service.ts
  - ../services/auth.service.ts
  - ../services/email.service.ts
  - ../utils/async-handler.ts
  - ../utils/error.ts
  - ../utils/logger.ts
  - ../utils/validators.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/rate-limiter.middleware.ts
  - ../models/interfaces/user.interface.ts
  - ../config/user.config.ts

## Inputs/Outputs
- **Input**: HTTP requests (GET, POST, PUT, DELETE) with parameters, query strings, request bodies, authorization headers, and file uploads
- **Output**: HTTP responses with appropriate status codes, user data in JSON format, error messages, and authentication tokens

## Data Types
```typescript
// Request validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  timezone: z.string().optional(),
  language: z.string().optional(),
  acceptedTerms: z.boolean().refine(val => val === true, { message: "Terms must be accepted" })
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  profilePicture: z.string().optional(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    desktop: z.boolean().optional()
  }).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"]
});

const updateEmailSchema = z.object({
  newEmail: z.string().email(),
  password: z.string()
});

const updatePreferencesSchema = z.object({
  language: z.string().optional(),
  timezone: z.string().optional(),
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
  clipboardDefaults: z.object({
    autoDeleteDays: z.number().min(0).optional(),
    defaultPrivacy: z.enum(['PUBLIC', 'PRIVATE', 'RESTRICTED']).optional(),
    defaultSyncStatus: z.enum(['SYNC', 'NO_SYNC']).optional()
  }).optional(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    desktop: z.boolean().optional(),
    loginAlert: z.boolean().optional(),
    syncEvents: z.boolean().optional(),
    marketingEmails: z.boolean().optional()
  }).optional()
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"]
});

const deleteAccountSchema = z.object({
  password: z.string(),
  reason: z.enum([
    'FOUND_ALTERNATIVE',
    'TOO_COMPLEX',
    'NOT_USEFUL',
    'PRIVACY_CONCERNS',
    'OTHER'
  ]).optional(),
  feedback: z.string().optional()
});
```

## API/Methods
```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { asyncHandler } from '../utils/async-handler';
import { AppError, ErrorCode } from '../utils/error';
import { Logger } from '../utils/logger';
import { validateRequest } from '../utils/validators';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { rateLimiter } from '../middlewares/rate-limiter.middleware';
import { 
  CreateUserInput, 
  UpdateUserInput,
  UserPreferences
} from '../models/interfaces/user.interface';
import { z } from 'zod';
import { UserConfig } from '../config/user.config';

export class UserController {
  private router: Router;
  private userService: UserService;
  private authService: AuthService;
  private emailService: EmailService;
  private logger: Logger;
  private config: UserConfig;
  private upload: multer.Multer;

  constructor(
    userService: UserService,
    authService: AuthService,
    emailService: EmailService,
    logger: Logger,
    config: UserConfig
  ) {
    this.router = Router();
    this.userService = userService;
    this.authService = authService;
    this.emailService = emailService;
    this.logger = logger;
    this.config = config;
    
    // Configure multer for profile picture uploads
    this.upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, this.config.uploadsDirectory);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, 'profile-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
        }
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'));
        }
      }
    });
    
    this.setupRoutes();
  }

  /**
   * Setup all user routes
   */
  private setupRoutes(): void {
    // Public routes
    this.router.post('/', validateRequest(createUserSchema), this.createUser);
    this.router.post('/verify-email/:token', this.verifyEmail);
    this.router.post('/forgot-password', validateRequest(forgotPasswordSchema), rateLimiter({ max: 5, windowMs: 60 * 60 * 1000 }), this.forgotPassword);
    this.router.post('/reset-password', validateRequest(resetPasswordSchema), this.resetPassword);
    
    // Protected routes
    this.router.use(authenticate);
    
    // User profile management
    this.router.get('/me', this.getCurrentUser);
    this.router.put('/me', validateRequest(updateUserSchema), this.updateCurrentUser);
    this.router.delete('/me', validateRequest(deleteAccountSchema), this.deleteAccount);
    
    // Password and email management
    this.router.post('/change-password', validateRequest(changePasswordSchema), this.changePassword);
    this.router.post('/update-email', validateRequest(updateEmailSchema), this.updateEmail);
    this.router.post('/resend-verification', this.resendVerificationEmail);
    
    // Profile picture
    this.router.post('/profile-picture', this.upload.single('profilePicture'), this.uploadProfilePicture);
    this.router.delete('/profile-picture', this.removeProfilePicture);
    
    // User preferences
    this.router.get('/preferences', this.getUserPreferences);
    this.router.put('/preferences', validateRequest(updatePreferencesSchema), this.updateUserPreferences);
    
    // User data
    this.router.get('/export-data', this.exportUserData);
    
    // Admin routes
    this.router.get('/', authorize(['ADMIN']), this.listUsers);
    this.router.get('/:userId', authorize(['ADMIN']), this.getUserById);
    this.router.put('/:userId', authorize(['ADMIN']), this.updateUser);
    this.router.post('/:userId/status', authorize(['ADMIN']), this.changeUserStatus);
  }

  /**
   * Create a new user
   * @param req Express request
   * @param res Express response
   */
  private createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData: CreateUserInput = req.body;
    
    // Check if email already exists
    const existingUser = await this.userService.findByEmail(userData.email);
    
    if (existingUser) {
      throw new AppError('Email already in use', ErrorCode.BAD_REQUEST);
    }
    
    // Create the user
    const user = await this.userService.createUser(userData);
    
    // Send verification email
    await this.authService.sendVerificationEmail(user.id, user.email);
    
    res.status(StatusCodes.CREATED).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      message: 'User created successfully. Please verify your email.'
    });
  });

  /**
   * Verify user email
   * @param req Express request
   * @param res Express response
   */
  private verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    
    const result = await this.authService.verifyEmailToken(token);
    
    if (!result.success) {
      throw new AppError(result.message || 'Invalid or expired token', ErrorCode.BAD_REQUEST);
    }
    
    res.status(StatusCodes.OK).json({
      message: 'Email verified successfully',
      redirectUrl: this.config.clientUrls.emailVerificationSuccess
    });
  });

  /**
   * Handle forgot password request
   * @param req Express request
   * @param res Express response
   */
  private forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    // Always return success to prevent email enumeration
    const user = await this.userService.findByEmail(email);
    
    if (user) {
      await this.authService.sendPasswordResetEmail(user.id, email);
    }
    
    res.status(StatusCodes.OK).json({
      message: 'If the email exists in our system, a password reset link has been sent.'
    });
  });

  /**
   * Reset user password
   * @param req Express request
   * @param res Express response
   */
  private resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    
    const result = await this.authService.resetPassword(token, newPassword);
    
    if (!result.success) {
      throw new AppError(result.message || 'Invalid or expired token', ErrorCode.BAD_REQUEST);
    }
    
    res.status(StatusCodes.OK).json({
      message: 'Password reset successfully',
      redirectUrl: this.config.clientUrls.passwordResetSuccess
    });
  });

  /**
   * Get current user profile
   * @param req Express request
   * @param res Express response
   */
  private getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const user = await this.userService.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', ErrorCode.NOT_FOUND);
    }
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    
    res.status(StatusCodes.OK).json(userWithoutPassword);
  });

  /**
   * Update current user profile
   * @param req Express request
   * @param res Express response
   */
  private updateCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const updateData: UpdateUserInput = req.body;
    
    // Prevent email update through this endpoint
    if (updateData.email) {
      throw new AppError('Email cannot be updated through this endpoint. Use /update-email instead.', ErrorCode.BAD_REQUEST);
    }
    
    const updatedUser = await this.userService.updateUser(userId, updateData);
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(StatusCodes.OK).json(userWithoutPassword);
  });

  /**
   * Change user password
   * @param req Express request
   * @param res Express response
   */
  private changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const result = await this.authService.changePassword(userId, currentPassword, newPassword);
    
    if (!result.success) {
      throw new AppError(result.message || 'Failed to change password', ErrorCode.BAD_REQUEST);
    }
    
    res.status(StatusCodes.OK).json({
      message: 'Password changed successfully'
    });
  });

  /**
   * Update user email
   * @param req Express request
   * @param res Express response
   */
  private updateEmail = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { newEmail, password } = req.body;
    
    // Verify the user's password first
    const passwordValid = await this.authService.verifyPassword(userId, password);
    
    if (!passwordValid) {
      throw new AppError('Invalid password', ErrorCode.UNAUTHORIZED);
    }
    
    // Check if email is already in use
    const existingUser = await this.userService.findByEmail(newEmail);
    
    if (existingUser) {
      throw new AppError('Email already in use', ErrorCode.BAD_REQUEST);
    }
    
    // Update email and mark as unverified
    await this.userService.updateEmail(userId, newEmail);
    
    // Send verification to new email
    await this.authService.sendVerificationEmail(userId, newEmail);
    
    res.status(StatusCodes.OK).json({
      message: 'Email updated. Please verify your new email address.'
    });
  });

  /**
   * Resend verification email
   * @param req Express request
   * @param res Express response
   */
  private resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const user = await this.userService.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', ErrorCode.NOT_FOUND);
    }
    
    if (user.emailVerified) {
      return res.status(StatusCodes.OK).json({
        message: 'Email is already verified'
      });
    }
    
    await this.authService.sendVerificationEmail(userId, user.email);
    
    res.status(StatusCodes.OK).json({
      message: 'Verification email sent successfully'
    });
  });

  /**
   * Upload profile picture
   * @param req Express request
   * @param res Express response
   */
  private uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    if (!req.file) {
      throw new AppError('No file uploaded', ErrorCode.BAD_REQUEST);
    }
    
    const filePath = req.file.path;
    const fileUrl = `${this.config.baseUrl}/uploads/${req.file.filename}`;
    
    // Update user profile with picture URL
    await this.userService.updateProfilePicture(userId, fileUrl);
    
    res.status(StatusCodes.OK).json({
      message: 'Profile picture uploaded successfully',
      profilePicture: fileUrl
    });
  });

  /**
   * Remove profile picture
   * @param req Express request
   * @param res Express response
   */
  private removeProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    await this.userService.removeProfilePicture(userId);
    
    res.status(StatusCodes.OK).json({
      message: 'Profile picture removed successfully'
    });
  });

  /**
   * Get user preferences
   * @param req Express request
   * @param res Express response
   */
  private getUserPreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const preferences = await this.userService.getUserPreferences(userId);
    
    res.status(StatusCodes.OK).json(preferences);
  });

  /**
   * Update user preferences
   * @param req Express request
   * @param res Express response
   */
  private updateUserPreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const preferencesData: UserPreferences = req.body;
    
    const updatedPreferences = await this.userService.updateUserPreferences(userId, preferencesData);
    
    res.status(StatusCodes.OK).json(updatedPreferences);
  });

  /**
   * Export user data
   * @param req Express request
   * @param res Express response
   */
  private exportUserData = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const userData = await this.userService.exportUserData(userId);
    
    res.setHeader('Content-Disposition', 'attachment; filename="user-data-export.json"');
    res.setHeader('Content-Type', 'application/json');
    
    res.status(StatusCodes.OK).json(userData);
  });

  /**
   * Delete user account
   * @param req Express request
   * @param res Express response
   */
  private deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { password, reason, feedback } = req.body;
    
    // Verify password first
    const passwordValid = await this.authService.verifyPassword(userId, password);
    
    if (!passwordValid) {
      throw new AppError('Invalid password', ErrorCode.UNAUTHORIZED);
    }
    
    // Store deletion reason if provided
    if (reason) {
      await this.userService.storeDeletionFeedback(userId, reason, feedback);
    }
    
    // Delete the account
    await this.userService.deleteUser(userId);
    
    res.status(StatusCodes.OK).json({
      message: 'Account deleted successfully'
    });
  });

  /**
   * List users (admin only)
   * @param req Express request
   * @param res Express response
   */
  private listUsers = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const search = req.query.search as string;
    const status = req.query.status as string;
    
    const users = await this.userService.listUsers({
      limit,
      page,
      search,
      status
    });
    
    res.status(StatusCodes.OK).json(users);
  });

  /**
   * Get user by ID (admin only)
   * @param req Express request
   * @param res Express response
   */
  private getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    const user = await this.userService.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', ErrorCode.NOT_FOUND);
    }
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    
    res.status(StatusCodes.OK).json(userWithoutPassword);
  });

  /**
   * Update user (admin only)
   * @param req Express request
   * @param res Express response
   */
  private updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updateData = req.body;
    
    const user = await this.userService.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', ErrorCode.NOT_FOUND);
    }
    
    const updatedUser = await this.userService.updateUser(userId, updateData);
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(StatusCodes.OK).json(userWithoutPassword);
  });

  /**
   * Change user status (admin only)
   * @param req Express request
   * @param res Express response
   */
  private changeUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { status, reason } = req.body;
    
    if (!['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].includes(status)) {
      throw new AppError('Invalid status', ErrorCode.BAD_REQUEST);
    }
    
    const user = await this.userService.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', ErrorCode.NOT_FOUND);
    }
    
    await this.userService.changeUserStatus(userId, status, reason);
    
    res.status(StatusCodes.OK).json({
      message: `User status changed to ${status} successfully`
    });
  });

  /**
   * Get router
   * @returns Express router
   */
  public getRouter(): Router {
    return this.router;
  }
}

export default UserController;
```

## Test Specifications

### Unit Tests
1. **Controller Initialization**
   - Should initialize with all dependencies
   - Should setup all routes

2. **Request Validation**
   - Should validate user creation request
   - Should validate user update request
   - Should validate password change request
   - Should validate email update request
   - Should validate preferences update request
   - Should validate forgot password request
   - Should validate reset password request

3. **Route Handlers**
   - Each handler should:
     - Pass the correct data to the service methods
     - Return the correct status code
     - Return the correct response format
     - Handle errors properly

4. **Authorization**
   - Should check if user is authenticated for protected routes
   - Should verify user permissions for admin routes
   - Should validate password for sensitive operations

5. **Error Handling**
   - Should handle service errors
   - Should handle validation errors
   - Should handle not found errors
   - Should handle authentication errors
   - Should handle file upload errors

### Integration Tests
1. **User Registration and Authentication**
   - Should create a new user with valid data
   - Should verify email with valid token
   - Should handle forgot password requests
   - Should reset password with valid token

2. **Profile Management**
   - Should retrieve current user profile
   - Should update user profile
   - Should change password with valid credentials
   - Should update email with valid credentials
   - Should upload and remove profile pictures

3. **User Preferences**
   - Should retrieve user preferences
   - Should update user preferences

4. **Account Operations**
   - Should export user data
   - Should delete account with valid password

5. **Admin Operations**
   - Should list users with pagination and filters
   - Should retrieve specific user details
   - Should update user details
   - Should change user status

6. **Security Features**
   - Should enforce rate limiting for sensitive endpoints
   - Should handle file upload security restrictions
   - Should prevent unauthorized profile access

## Implementation Notes

### Error Handling and Logging
- Implement consistent error handling across all endpoints
- Log authentication and account modification events for audit purposes
- Validate all input data thoroughly before processing
- Handle edge cases like invalid files, expired tokens
- Track login attempts and alert on suspicious behavior
- Standardize error messages to avoid information disclosure

### Security Considerations
- Password policies should be enforced consistently
- Store passwords securely using strong hashing algorithms
- Implement account locking after multiple failed attempts
- Send notifications for security-sensitive operations
- Rate limit sensitive operations
- Implement proper session management
- Sanitize user inputs to prevent injection attacks
- Set secure and HttpOnly flags for authentication cookies
- Validate file uploads thoroughly (type, size, content)
- Follow OWASP guidelines for user account management

### Performance Optimization
- Cache user profile data when appropriate
- Optimize database queries for user lookups
- Implement proper indexing for user-related tables
- Use pagination for user listing and history
- Process file uploads efficiently
- Limit size and dimensions of profile pictures

### User Experience
- Send welcome emails to new users
- Provide clear feedback on validation errors
- Offer self-service options for account recovery
- Support progressive profile completion
- Implement proper notifications for account changes
- Design mobile-friendly profile management
- Support accessibility standards in user interfaces

### Edge Cases
- Handle account merges or identity conflicts
- Address users with multiple email addresses
- Support reactivation of deleted accounts
- Handle duplicate registration attempts
- Address invalid or malformed email addresses
- Support international character sets for names
- Implement proper cleanup for orphaned user data
- Handle cases where verification emails cannot be delivered

## Related Files
- srcSudo/services/user.service.ts
- srcSudo/services/auth.service.ts
- srcSudo/services/email.service.ts
- srcSudo/middlewares/auth.middleware.ts
- srcSudo/middlewares/rate-limiter.middleware.ts
- srcSudo/models/interfaces/user.interface.ts
- srcSudo/repositories/user.repository.ts
- srcSudo/utils/async-handler.ts
- srcSudo/utils/error.ts
- srcSudo/utils/validators.ts
- srcSudo/config/user.config.ts
