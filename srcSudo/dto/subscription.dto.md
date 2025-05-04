# subscription.dto.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file defines Data Transfer Objects (DTOs) for subscription-related operations in the application. It provides validation schemas for creating, updating, and managing user subscriptions through the Stripe payment processor, enabling premium features and paid tiers.

## Dependencies
- External packages:
  - zod (for schema validation)
- Internal modules:
  - ../utils/validation (for custom validation helpers)
  - ../config/stripe (for subscription plan constants)

## Inputs/Outputs
- **Input**: Subscription data from requests, webhooks, or client
- **Output**: Validated subscription data objects or validation errors

## Data Types
```typescript
import { z } from 'zod';

// Create subscription checkout session request DTO
export const createCheckoutSessionSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  successUrl: z.string().url('Success URL must be a valid URL'),
  cancelUrl: z.string().url('Cancel URL must be a valid URL'),
  customerId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  couponId: z.string().optional(),
});
export type CreateCheckoutSessionDto = z.infer<typeof createCheckoutSessionSchema>;

// Create checkout session response DTO
export const checkoutSessionResponseSchema = z.object({
  sessionId: z.string(),
  url: z.string().url(),
});
export type CheckoutSessionResponseDto = z.infer<typeof checkoutSessionResponseSchema>;

// Create portal session request DTO
export const createPortalSessionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  returnUrl: z.string().url('Return URL must be a valid URL'),
});
export type CreatePortalSessionDto = z.infer<typeof createPortalSessionSchema>;

// Create portal session response DTO
export const portalSessionResponseSchema = z.object({
  url: z.string().url(),
});
export type PortalSessionResponseDto = z.infer<typeof portalSessionResponseSchema>;

// Subscription webhook event DTO
export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.any()),
  }),
  created: z.number(),
  livemode: z.boolean(),
});
export type WebhookEventDto = z.infer<typeof webhookEventSchema>;

// Subscription status DTO
export const subscriptionStatusSchema = z.object({
  customerId: z.string(),
  subscriptionId: z.string(),
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired']),
  planId: z.string(),
  priceId: z.string(),
  currentPeriodStart: z.date().or(z.string()),
  currentPeriodEnd: z.date().or(z.string()),
  cancelAtPeriodEnd: z.boolean(),
  canceledAt: z.date().or(z.string()).nullable(),
  endedAt: z.date().or(z.string()).nullable(),
  trialEnd: z.date().or(z.string()).nullable(),
  quantity: z.number().int().positive(),
});
export type SubscriptionStatusDto = z.infer<typeof subscriptionStatusSchema>;

// Subscription query DTO
export const subscriptionQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});
export type SubscriptionQueryDto = z.infer<typeof subscriptionQuerySchema>;

// Subscription response DTO
export const subscriptionResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired']),
  planName: z.string(),
  currentPeriodEnd: z.date().or(z.string()),
  cancelAtPeriodEnd: z.boolean(),
  features: z.array(z.object({
    name: z.string(),
    description: z.string(),
    enabled: z.boolean(),
  })),
  limits: z.record(z.number()),
});
export type SubscriptionResponseDto = z.infer<typeof subscriptionResponseSchema>;

// Coupon validation DTO
export const validateCouponSchema = z.object({
  couponCode: z.string().min(1, 'Coupon code is required'),
});
export type ValidateCouponDto = z.infer<typeof validateCouponSchema>;

// Coupon response DTO
export const couponResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  amountOff: z.number().nullable(),
  percentOff: z.number().nullable(),
  duration: z.enum(['once', 'repeating', 'forever']),
  durationInMonths: z.number().nullable(),
  valid: z.boolean(),
  expiresAt: z.date().or(z.string()).nullable(),
});
export type CouponResponseDto = z.infer<typeof couponResponseSchema>;

// Pricing plan DTO
export const pricingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  prices: z.array(z.object({
    id: z.string(),
    interval: z.enum(['month', 'year']),
    currency: z.string(),
    unitAmount: z.number(),
    formattedPrice: z.string(),
  })),
  features: z.array(z.object({
    name: z.string(),
    description: z.string(),
    included: z.boolean(),
  })),
  limits: z.record(z.number()),
  popular: z.boolean().optional(),
});
export type PricingPlanDto = z.infer<typeof pricingPlanSchema>;
```

## API/Methods
N/A - This is a schema/type definition file with no runtime methods.

## Test Specifications
### Unit Tests
- Should validate valid checkout session creation data
- Should reject invalid URLs for success and cancel URLs
- Should validate portal session creation data
- Should validate webhook event data structure
- Should validate subscription status data
- Should handle pricing plan data correctly

## Implementation Notes
1. **Stripe Integration**:
   - Align DTOs with Stripe API requirements
   - Support webhook validation and processing
   - Handle Stripe customer and subscription IDs consistently
   - Implement proper error handling for Stripe API interactions

2. **Subscription Management**:
   - Support various subscription states and transitions
   - Handle subscription upgrades, downgrades, and cancellations
   - Implement trial periods and subscription renewal logic
   - Track subscription feature access and limits

3. **Payment Processing**:
   - Support secure checkout through Stripe Checkout
   - Handle coupon and discount application
   - Implement customer portal for self-service subscription management
   - Process webhook events for subscription lifecycle updates

4. **Security Considerations**:
   - Validate webhook signatures
   - Securely store and handle payment information
   - Implement proper authorization for subscription management
   - Handle failed payments and subscription recovery

## Related Files
- src/controllers/subscription.controller.ts
- src/services/subscription.service.ts
- src/config/stripe.ts
- src/middleware/subscription.middleware.ts
