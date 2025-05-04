# subscription.middleware.ts

- [x] Test file made
- [x] File made
- [x] File passed the tests

## Purpose

Middleware that validates and enforces subscription-based access control for premium features. Checks user subscription status, manages feature access based on subscription plans, and handles subscription-related routing decisions.

## Dependencies

- express
- User service (for user retrieval)
- Subscription service (for subscription details and validation)
- Authentication middleware (for user identification)

## Inputs/Outputs

- **Input**: HTTP request with authenticated user information
- **Output**: Allowed or denied access to subscription-based features

## Data Types

```typescript
// Subscription plan types
enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

// Subscription status
enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  PAST_DUE = 'PAST_DUE',
  TRIAL = 'TRIAL',
}

// Feature access matrix
interface FeatureAccess {
  // Maps features to required subscription plans
  [feature: string]: SubscriptionPlan[];
}

// Subscription details on request
declare namespace Express {
  interface Request {
    subscription?: {
      plan: SubscriptionPlan;
      status: SubscriptionStatus;
      expiresAt?: Date;
      features: string[];
    };
  }
}
```

## API/Methods

### checkSubscription

- Description: Middleware that validates user subscription status
- Signature: `checkSubscription(req: Request, res: Response, next: NextFunction): Promise<void>`
- Parameters:
  - req: Express Request object with authenticated user
  - res: Express Response object
  - next: Express NextFunction for middleware chain
- Returns: Calls next() if subscription is valid, otherwise sends error response
- Throws: 402 Payment Required or 403 Forbidden for invalid subscriptions

### requireFeatureAccess

- Description: Middleware that checks if user has access to a specific feature
- Signature: `requireFeatureAccess(feature: string): (req: Request, res: Response, next: NextFunction) => Promise<void>`
- Parameters:
  - feature: String identifier of the feature to check access for
- Returns: Middleware function that allows or rejects based on subscription
- Throws: 403 Forbidden if subscription doesn't include feature

### subscriptionUsageTracker

- Description: Tracks usage metrics for subscription limits
- Signature: `subscriptionUsageTracker(usageType: string): (req: Request, res: Response, next: NextFunction) => Promise<void>`
- Parameters:
  - usageType: Type of usage to track (e.g., 'api_calls', 'storage')
- Returns: Middleware function that tracks usage and limits as needed
- Throws: 429 Too Many Requests if usage limit exceeded

## Test Specifications

### Unit Tests

- Should identify user subscription plan from authenticated user
- Should allow access for users with active subscriptions
- Should reject access for expired or invalid subscriptions
- Should validate feature access against subscription plan
- Should track usage correctly for different subscription types
- Should handle edge cases (trial periods, grace periods, etc.)

### Integration Tests

- Should integrate with authentication system correctly
- Should enforce feature restrictions based on subscription plan
- Should track and limit usage based on subscription quotas
- Should handle subscription status changes correctly
- Should allow admin override for subscription checks

## Implementation Notes

1. **Subscription Validation**:

   - Check subscription status (active, canceled, past due, etc.)
   - Validate subscription expiration dates
   - Handle grace periods for expired subscriptions
   - Cache subscription data to minimize database queries

2. **Feature Access Control**:

   - Maintain feature matrix for different subscription plans
   - Support granular feature access controls
   - Enable A/B testing or feature flagging with subscription tiers
   - Support custom enterprise-level feature access

3. **Usage Limits**:

   - Track API call usage against subscription limits
   - Track storage usage against subscription quotas
   - Implement soft and hard limits with appropriate warnings
   - Provide usage metrics to users

4. **Error Handling**:
   - Clear error messages about subscription requirements
   - Upgrade paths in error responses
   - Grace period handling for minor overages
   - Special handling for legacy subscription plans

## Related Files

- auth.middleware.ts
- user.service.ts
- subscription.service.ts
- feature-matrix.config.ts
