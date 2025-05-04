# subscription.repository.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the repository pattern for Subscription entity operations, providing an abstraction layer for subscription-related database interactions. It handles the creation, retrieval, updating, and tracking of user subscriptions, as well as integration with the Stripe payment processor for premium features and paid tiers.

## Dependencies
- External packages:
  - @prisma/client
  - stripe
- Internal modules:
  - ../models/interfaces/subscription.interface.ts
  - ../utils/error.ts
  - ../config/stripe.ts

## Inputs/Outputs
- **Input**: Subscription data, checkout sessions, webhook events, user IDs
- **Output**: Subscription objects, checkout URLs, subscription status, feature access

## API/Methods
```typescript
import { PrismaClient, Subscription, SubscriptionStatus, Prisma } from '@prisma/client';
import { 
  ISubscription, 
  ISubscriptionWithUser, 
  ISubscriptionDetails,
  ICheckoutSession,
  IPortalSession,
  ISubscriptionFeature,
  ISubscriptionPlan,
  ICoupon
} from '../models/interfaces/subscription.interface';
import Stripe from 'stripe';

export class SubscriptionRepository {
  private prisma: PrismaClient;
  private stripe: Stripe;

  constructor(prisma: PrismaClient, stripe: Stripe) {
    this.prisma = prisma;
    this.stripe = stripe;
  }

  /**
   * Create a subscription record
   * @param subscriptionData Subscription data to create
   * @returns Created subscription
   */
  async create(subscriptionData: {
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd?: boolean;
    metadata?: Record<string, any>;
  }): Promise<ISubscription> {
    // Implementation
  }

  /**
   * Find a subscription by ID
   * @param id Subscription ID
   * @returns Subscription or null if not found
   */
  async findById(id: string): Promise<ISubscription | null> {
    // Implementation
  }

  /**
   * Find a subscription by user ID
   * @param userId User ID
   * @returns Subscription or null if not found
   */
  async findByUserId(userId: string): Promise<ISubscription | null> {
    // Implementation
  }

  /**
   * Find a subscription by Stripe subscription ID
   * @param stripeSubscriptionId Stripe subscription ID
   * @returns Subscription or null if not found
   */
  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<ISubscription | null> {
    // Implementation
  }

  /**
   * Find a subscription by Stripe customer ID
   * @param stripeCustomerId Stripe customer ID
   * @returns Subscription or null if not found
   */
  async findByStripeCustomerId(stripeCustomerId: string): Promise<ISubscription | null> {
    // Implementation
  }

  /**
   * Find a subscription with user data
   * @param id Subscription ID
   * @returns Subscription with user data or null if not found
   */
  async findWithUser(id: string): Promise<ISubscriptionWithUser | null> {
    // Implementation
  }

  /**
   * Get detailed subscription information
   * @param userId User ID
   * @returns Subscription details or null if not found
   */
  async getSubscriptionDetails(userId: string): Promise<ISubscriptionDetails | null> {
    // Implementation
  }

  /**
   * Update a subscription
   * @param id Subscription ID
   * @param subscriptionData Data to update
   * @returns Updated subscription
   */
  async update(
    id: string,
    subscriptionData: Partial<{
      status: SubscriptionStatus;
      stripePriceId: string;
      planId: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      canceledAt: Date;
      metadata: Record<string, any>;
    }>
  ): Promise<ISubscription> {
    // Implementation
  }

  /**
   * Delete a subscription record
   * @param id Subscription ID
   * @returns Deleted subscription
   */
  async delete(id: string): Promise<ISubscription> {
    // Implementation
  }

  /**
   * Create a checkout session for subscription
   * @param checkoutData Checkout session data
   * @returns Checkout session with URL
   */
  async createCheckoutSession(checkoutData: {
    priceId: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    metadata?: Record<string, any>;
    couponId?: string;
  }): Promise<ICheckoutSession> {
    // Implementation
  }

  /**
   * Create a customer portal session
   * @param portalData Portal session data
   * @returns Portal session with URL
   */
  async createPortalSession(portalData: {
    customerId: string;
    returnUrl: string;
  }): Promise<IPortalSession> {
    // Implementation
  }

  /**
   * Process a Stripe webhook event
   * @param event Stripe webhook event
   * @returns Boolean indicating success
   */
  async processWebhookEvent(event: Stripe.Event): Promise<boolean> {
    // Implementation
  }

  /**
   * Cancel a subscription
   * @param userId User ID
   * @param atPeriodEnd Whether to cancel at the end of the current period
   * @returns Updated subscription
   */
  async cancelSubscription(
    userId: string,
    atPeriodEnd: boolean = true
  ): Promise<ISubscription | null> {
    // Implementation
  }

  /**
   * Reactivate a canceled subscription
   * @param userId User ID
   * @returns Updated subscription
   */
  async reactivateSubscription(userId: string): Promise<ISubscription | null> {
    // Implementation
  }

  /**
   * Check if a user has access to a specific feature
   * @param userId User ID
   * @param featureKey Feature key to check
   * @returns Boolean indicating access
   */
  async hasFeatureAccess(userId: string, featureKey: string): Promise<boolean> {
    // Implementation
  }

  /**
   * Get user's subscription features
   * @param userId User ID
   * @returns Array of features with access status
   */
  async getFeatures(userId: string): Promise<ISubscriptionFeature[]> {
    // Implementation
  }

  /**
   * Get user's subscription limits
   * @param userId User ID
   * @returns Object with limit values
   */
  async getLimits(userId: string): Promise<Record<string, number>> {
    // Implementation
  }

  /**
   * Check if a user is within subscription limits
   * @param userId User ID
   * @param limitKey Limit key to check
   * @param currentValue Current value to check against the limit
   * @returns Boolean indicating if within limits
   */
  async isWithinLimits(userId: string, limitKey: string, currentValue: number): Promise<boolean> {
    // Implementation
  }

  /**
   * Get available subscription plans
   * @returns Array of subscription plans
   */
  async getAvailablePlans(): Promise<ISubscriptionPlan[]> {
    // Implementation
  }

  /**
   * Validate a coupon code
   * @param couponCode Coupon code to validate
   * @returns Coupon information or null if invalid
   */
  async validateCoupon(couponCode: string): Promise<ICoupon | null> {
    // Implementation
  }

  /**
   * Get Stripe customer ID for a user
   * @param userId User ID
   * @returns Stripe customer ID or null if not found
   */
  async getStripeCustomerId(userId: string): Promise<string | null> {
    // Implementation
  }

  /**
   * Create or get a Stripe customer for a user
   * @param userData User data for customer creation
   * @returns Stripe customer ID
   */
  async createOrGetCustomer(userData: {
    userId: string;
    email: string;
    name?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a subscription record
- Should find a subscription by ID
- Should find a subscription by user ID
- Should find a subscription by Stripe subscription ID
- Should find a subscription by Stripe customer ID
- Should find a subscription with user data
- Should get detailed subscription information
- Should update a subscription
- Should delete a subscription record
- Should create a checkout session
- Should create a portal session
- Should process a Stripe webhook event
- Should cancel a subscription
- Should reactivate a canceled subscription
- Should check if a user has access to a feature
- Should get user's subscription features
- Should get user's subscription limits
- Should check if a user is within subscription limits
- Should get available subscription plans
- Should validate a coupon code
- Should get Stripe customer ID for a user
- Should create or get a Stripe customer for a user

### Integration Tests
- Should handle subscription creation flow
- Should properly update subscription status based on webhook events
- Should handle subscription cancellation and reactivation
- Should enforce feature access based on subscription plan
- Should enforce subscription limits correctly
- Should handle subscription checkout process
- Should manage Stripe customer data properly
- Should process various webhook event types correctly
- Should validate and apply coupon codes properly

## Implementation Notes
1. **Stripe Integration**:
   - Implement secure Stripe API interactions
   - Handle webhook signature verification
   - Process subscription lifecycle events
   - Manage Stripe customers and subscriptions
   - Support various payment methods and currencies

2. **Subscription Management**:
   - Track subscription status changes
   - Implement subscription lifecycle hooks
   - Handle free trial periods
   - Support subscription upgrades and downgrades
   - Implement proper cancellation and reactivation flows

3. **Feature Access Control**:
   - Define feature access by subscription plan
   - Implement a consistent feature check system
   - Handle granular feature permissions
   - Support feature overrides for special cases
   - Provide clear feature availability information

4. **Limit Enforcement**:
   - Define usage limits by subscription plan
   - Track usage against limits
   - Implement graceful behavior when limits are reached
   - Support custom limits for special accounts
   - Provide clear limit information to users

5. **Security Considerations**:
   - Secure webhook endpoints
   - Store sensitive payment data only in Stripe
   - Validate webhook signatures
   - Implement proper error handling for payment failures
   - Secure customer portal access

6. **Error Handling**:
   - Handle Stripe API errors gracefully
   - Implement retry logic for transient failures
   - Provide meaningful error messages
   - Log payment and subscription errors properly
   - Handle edge cases in subscription lifecycle

## Related Files
- src/models/interfaces/subscription.interface.ts
- src/services/subscription.service.ts
- src/controllers/subscription.controller.ts
- src/config/stripe.ts
- src/repositories/user.repository.ts
- src/middleware/subscription.middleware.ts
