# auth.dto.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines Data Transfer Objects (DTOs) for authentication-related operations in the application. It provides validation schemas for login, token refresh, password reset, and other authentication flows to ensure proper data validation and security.

## Dependencies
- External packages:
  - zod (for schema validation)
- Internal modules:
  - ../utils/validation (for custom validation helpers)

## Inputs/Outputs
- **Input**: Authentication-related data from requests
- **Output**: Validated authentication data objects or validation errors

## Data Types
```typescript
import { z } from 'zod';

// Login request DTO
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
  deviceId: z.string().uuid('Invalid device ID format').optional(),
  deviceName: z.string().optional(),
});
export type LoginDto = z.infer<typeof loginSchema>;

// Login response DTO
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
    isSubscriptionActive: z.boolean(),
  }),
});
export type LoginResponseDto = z.infer<typeof loginResponseSchema>;

// Token refresh request DTO
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

// Token refresh response DTO
export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});
export type RefreshTokenResponseDto = z.infer<typeof refreshTokenResponseSchema>;

// Logout request DTO
export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
  deviceId: z.string().uuid('Invalid device ID format').optional(),
  allDevices: z.boolean().optional().default(false),
});
export type LogoutDto = z.infer<typeof logoutSchema>;

// Password reset request DTO
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});
export type PasswordResetRequestDto = z.infer<typeof passwordResetRequestSchema>;

// Password reset validation DTO
export const passwordResetValidationSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
});
export type PasswordResetValidationDto = z.infer<typeof passwordResetValidationSchema>;

// Password reset confirmation DTO
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});
export type PasswordResetConfirmDto = z.infer<typeof passwordResetConfirmSchema>;

// Device registration DTO
export const registerDeviceSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID format'),
  deviceName: z.string().min(1, 'Device name is required'),
  deviceType: z.string().optional(),
});
export type RegisterDeviceDto = z.infer<typeof registerDeviceSchema>;

// Authentication verification (for middleware)
export const verifyAuthSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  deviceId: z.string().uuid('Invalid device ID format').optional(),
});
export type VerifyAuthDto = z.infer<typeof verifyAuthSchema>;
```

## API/Methods
N/A - This is a schema/type definition file with no runtime methods.

## Test Specifications
### Unit Tests
- Should validate valid login data
- Should reject invalid email formats in login requests
- Should require refresh token for refresh requests
- Should validate password reset token format
- Should enforce password complexity requirements in reset confirmation
- Should validate device registration data correctly

## Implementation Notes
1. **Security Considerations**:
   - Never log tokens or passwords in any form
   - Enforce strong password requirements consistently
   - Validate all input strictly to prevent injection attacks
   - Implement proper CSRF protection for authentication endpoints

2. **Token Handling**:
   - Consider token expiration times in response DTOs
   - Support both access and refresh tokens
   - Allow for device-specific tokens for multi-device support
   - Provide clear error responses for token validation failures

3. **Multi-device Support**:
   - Support device registration with device-specific information
   - Allow for selective logout from specific devices
   - Track device type and name for user convenience

4. **Error Handling**:
   - Provide clear, non-revealing error messages for security
   - Structure validation errors to be easily processed by the frontend
   - Use consistent error formats across all authentication flows

## Related Files
- src/controllers/auth.controller.ts
- src/services/auth.service.ts
- src/middleware/auth.middleware.ts
- src/utils/encryption.ts
- src/dto/user.dto.ts
