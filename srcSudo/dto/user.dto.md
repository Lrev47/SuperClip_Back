# user.dto.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines Data Transfer Objects (DTOs) for user-related operations in the application. It provides validation schemas for user registration, login, profile updates, and user responses, ensuring data consistency and security.

## Dependencies
- External packages:
  - zod (for schema validation)
- Internal modules:
  - ../utils/validation (for custom validation helpers)

## Inputs/Outputs
- **Input**: User data from requests or database
- **Output**: Validated user data objects or validation errors

## Data Types
```typescript
import { z } from 'zod';

// User registration request DTO
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
  deviceId: z.string().uuid('Invalid device ID format').optional(),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;

// User login request DTO
export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().uuid('Invalid device ID format').optional(),
  deviceName: z.string().optional(),
});
export type LoginUserDto = z.infer<typeof loginUserSchema>;

// User profile update request DTO
export const updateUserSchema = z.object({
  name: z.string().max(100, 'Name cannot exceed 100 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .optional(),
}).refine(data => {
  // If newPassword is provided, currentPassword must also be provided
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required when setting a new password",
  path: ["currentPassword"],
});
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// Change password request DTO
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

// User response DTO (to client)
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  isSubscriptionActive: z.boolean().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});
export type UserResponseDto = z.infer<typeof userResponseSchema>;

// Password reset request DTO
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});
export type PasswordResetRequestDto = z.infer<typeof passwordResetRequestSchema>;

// Password reset confirmation DTO
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});
export type PasswordResetConfirmDto = z.infer<typeof passwordResetConfirmSchema>;
```

## API/Methods
N/A - This is a schema/type definition file with no runtime methods.

## Test Specifications
### Unit Tests
- Should validate valid user registration data
- Should reject invalid email formats
- Should reject weak passwords
- Should require current password when new password is provided
- Should validate user response format correctly
- Should validate password reset requests correctly

## Implementation Notes
1. **Security Considerations**:
   - Never include password in response DTOs
   - Enforce strong password requirements
   - Validate email formats strictly
   - Require current password verification for password changes

2. **Validation Strategy**:
   - Use Zod for all validation to ensure type safety
   - Include helpful error messages for validation failures
   - Implement custom refinements for complex validation logic
   - Keep password validation requirements consistent across schemas

3. **Error Handling**:
   - Provide clear error messages for each validation constraint
   - Structure error responses to be easily consumed by frontend

4. **Extension Points**:
   - Consider adding support for social login DTOs if needed
   - Allow for additional user profile fields in the future
   - Consider internationalization for error messages

## Related Files
- src/controllers/auth.controller.ts
- src/services/user.service.ts
- src/models/interfaces/user.interface.ts
- src/middleware/validation.middleware.ts
