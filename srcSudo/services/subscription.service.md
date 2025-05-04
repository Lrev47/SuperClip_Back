# subscription.service.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the subscription management service for the SuperClip application. It handles user subscription plans, billing cycles, payment processing, feature entitlements, and subscription status management. The service provides functionality for creating, upgrading, downgrading, and canceling subscriptions, as well as managing trial periods, promotional offers, and payment methods. It integrates with external payment processors and implements subscription-based access control.

## Dependencies
- External packages:
  - @prisma/client
  - date-fns
  - uuid
  - zod (for validation)
- Internal modules:
  - ../repositories/subscription.repository.ts
  - ../repositories/user.repository.ts
  - ../repositories/payment.repository.ts
  - ../utils/logger.ts
  - ../utils/error.ts
  - ../models/interfaces/subscription.interface.ts
  - ../config/subscription.config.ts
  - ../services/stripe.service.ts
  - ../services/user.service.ts
  - ../services/notification.service.ts

## Inputs/Outputs
- **Input**: Subscription requests, plan changes, payment information, user contexts
- **Output**: Subscription details, billing information, entitlement status, operation results

## API/Methods
```typescript
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { UserRepository } from '../repositories/user.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { StripeService } from '../services/stripe.service';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { Logger } from '../utils/logger';
import { AppError, ErrorCode } from '../utils/error';
import { SubscriptionConfig } from '../config/subscription.config';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionPlan,
  PaymentMethod,
  User,
  Invoice,
  Prisma
} from '@prisma/client';
import {
  CreateSubscriptionInput,
  SubscriptionDetails,
  SubscriptionUpdateInput,
  PaymentMethodInput,
  InvoiceData,
  SubscriptionEventType,
  SubscriptionEvent,
  EntitlementCheck,
  PromoCodeData,
  SubscriptionPlanDetails,
  BillingAddress,
  SubscriptionReceipt,
  TrialOptions,
  SubscriptionUsage,
  BillingHistory,
  SubscriptionWebhookEvent,
  CancellationReason,
  BillingPeriod,
  TaxInformation
} from '../models/interfaces/subscription.interface';
import { v4 as uuidv4 } from 'uuid';
import * as dateFns from 'date-fns';
import { z } from 'zod';

export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;
  private userRepository: UserRepository;
  private paymentRepository: PaymentRepository;
  private stripeService: StripeService;
  private userService: UserService;
  private notificationService: NotificationService;
  private logger: Logger;
  private config: SubscriptionConfig;

  constructor(
    subscriptionRepository: SubscriptionRepository,
    userRepository: UserRepository,
    paymentRepository: PaymentRepository,
    stripeService: StripeService,
    userService: UserService,
    notificationService: NotificationService,
    logger: Logger,
    config: SubscriptionConfig
  ) {
    this.subscriptionRepository = subscriptionRepository;
    this.userRepository = userRepository;
    this.paymentRepository = paymentRepository;
    this.stripeService = stripeService;
    this.userService = userService;
    this.notificationService = notificationService;
    this.logger = logger;
    this.config = config;
  }

  /**
   * Create a new subscription
   * @param userId User ID
   * @param subscriptionData Subscription creation data
   * @returns Created subscription details
   */
  async createSubscription(
    userId: string,
    subscriptionData: CreateSubscriptionInput
  ): Promise<SubscriptionDetails> {
    // Implementation
  }

  /**
   * Get subscription by ID
   * @param subscriptionId Subscription ID
   * @returns Subscription details
   */
  async getSubscriptionById(
    subscriptionId: string
  ): Promise<SubscriptionDetails | null> {
    // Implementation
  }

  /**
   * Get user's active subscription
   * @param userId User ID
   * @returns Active subscription details
   */
  async getUserSubscription(
    userId: string
  ): Promise<SubscriptionDetails | null> {
    // Implementation
  }

  /**
   * Update subscription
   * @param subscriptionId Subscription ID
   * @param updateData Subscription update data
   * @returns Updated subscription details
   */
  async updateSubscription(
    subscriptionId: string,
    updateData: SubscriptionUpdateInput
  ): Promise<SubscriptionDetails> {
    // Implementation
  }

  /**
   * Cancel subscription
   * @param subscriptionId Subscription ID
   * @param cancellationReason Reason for cancellation
   * @param cancelImmediately Whether to cancel immediately or at period end
   * @returns Cancellation result
   */
  async cancelSubscription(
    subscriptionId: string,
    cancellationReason?: CancellationReason,
    cancelImmediately: boolean = false
  ): Promise<{
    success: boolean;
    endDate: Date;
  }> {
    // Implementation
  }

  /**
   * Reactivate canceled subscription
   * @param subscriptionId Subscription ID
   * @returns Reactivation result
   */
  async reactivateSubscription(
    subscriptionId: string
  ): Promise<{
    success: boolean;
    subscription: SubscriptionDetails;
  }> {
    // Implementation
  }

  /**
   * Change subscription plan
   * @param subscriptionId Subscription ID
   * @param newPlanId New plan ID
   * @param changeOptions Change options
   * @returns Updated subscription
   */
  async changeSubscriptionPlan(
    subscriptionId: string,
    newPlanId: string,
    changeOptions?: {
      prorationMode?: 'immediate' | 'next_billing_cycle';
      effectiveDate?: Date;
    }
  ): Promise<SubscriptionDetails> {
    // Implementation
  }

  /**
   * Get available subscription plans
   * @param countryCode Optional country code for localized pricing
   * @returns List of available plans
   */
  async getSubscriptionPlans(
    countryCode?: string
  ): Promise<SubscriptionPlanDetails[]> {
    // Implementation
  }

  /**
   * Add payment method
   * @param userId User ID
   * @param paymentMethodData Payment method data
   * @returns Added payment method
   */
  async addPaymentMethod(
    userId: string,
    paymentMethodData: PaymentMethodInput
  ): Promise<PaymentMethod> {
    // Implementation
  }

  /**
   * Remove payment method
   * @param paymentMethodId Payment method ID
   * @param userId User ID
   * @returns Removal result
   */
  async removePaymentMethod(
    paymentMethodId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    // Implementation
  }

  /**
   * Set default payment method
   * @param paymentMethodId Payment method ID
   * @param userId User ID
   * @returns Updated payment method
   */
  async setDefaultPaymentMethod(
    paymentMethodId: string,
    userId: string
  ): Promise<PaymentMethod> {
    // Implementation
  }

  /**
   * Get user payment methods
   * @param userId User ID
   * @returns List of payment methods
   */
  async getUserPaymentMethods(
    userId: string
  ): Promise<PaymentMethod[]> {
    // Implementation
  }

  /**
   * Get billing history
   * @param userId User ID
   * @param options Query options
   * @returns Billing history with pagination
   */
  async getBillingHistory(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    items: BillingHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Implementation
  }

  /**
   * Get invoice by ID
   * @param invoiceId Invoice ID
   * @param userId User ID
   * @returns Invoice data
   */
  async getInvoice(
    invoiceId: string,
    userId: string
  ): Promise<InvoiceData | null> {
    // Implementation
  }

  /**
   * Get upcoming invoice
   * @param subscriptionId Subscription ID
   * @returns Upcoming invoice data
   */
  async getUpcomingInvoice(
    subscriptionId: string
  ): Promise<InvoiceData | null> {
    // Implementation
  }

  /**
   * Generate invoice PDF
   * @param invoiceId Invoice ID
   * @param userId User ID
   * @returns PDF generation result
   */
  async generateInvoicePdf(
    invoiceId: string,
    userId: string
  ): Promise<{
    success: boolean;
    url?: string;
  }> {
    // Implementation
  }

  /**
   * Apply promo code
   * @param subscriptionId Subscription ID
   * @param promoCode Promotion code
   * @returns Application result
   */
  async applyPromoCode(
    subscriptionId: string,
    promoCode: string
  ): Promise<{
    success: boolean;
    discount?: {
      amount: number;
      percentage?: number;
      durationType: 'once' | 'forever' | 'limited';
      durationMonths?: number;
    };
  }> {
    // Implementation
  }

  /**
   * Check if user has access to specific feature
   * @param userId User ID
   * @param feature Feature identifier
   * @returns Entitlement check result
   */
  async hasFeatureAccess(
    userId: string,
    feature: string
  ): Promise<EntitlementCheck> {
    // Implementation
  }

  /**
   * Check subscription usage limits
   * @param userId User ID
   * @param resourceType Resource type
   * @returns Usage status
   */
  async checkUsageLimits(
    userId: string,
    resourceType: string
  ): Promise<SubscriptionUsage> {
    // Implementation
  }

  /**
   * Start trial period
   * @param userId User ID
   * @param planId Plan ID
   * @param trialOptions Trial options
   * @returns Trial subscription
   */
  async startTrial(
    userId: string,
    planId: string,
    trialOptions?: TrialOptions
  ): Promise<SubscriptionDetails> {
    // Implementation
  }

  /**
   * Process webhook event
   * @param event Webhook event data
   * @returns Processing result
   */
  async processWebhookEvent(
    event: SubscriptionWebhookEvent
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // Implementation
  }

  /**
   * Update billing address
   * @param userId User ID
   * @param billingAddress Billing address data
   * @returns Updated address
   */
  async updateBillingAddress(
    userId: string,
    billingAddress: BillingAddress
  ): Promise<BillingAddress> {
    // Implementation
  }

  /**
   * Update tax information
   * @param userId User ID
   * @param taxInfo Tax information
   * @returns Updated tax information
   */
  async updateTaxInformation(
    userId: string,
    taxInfo: TaxInformation
  ): Promise<TaxInformation> {
    // Implementation
  }

  /**
   * Get subscription receipt
   * @param invoiceId Invoice ID
   * @param userId User ID
   * @returns Subscription receipt
   */
  async getSubscriptionReceipt(
    invoiceId: string,
    userId: string
  ): Promise<SubscriptionReceipt | null> {
    // Implementation
  }

  /**
   * Calculate proration
   * @param subscriptionId Subscription ID
   * @param newPlanId New plan ID
   * @returns Proration calculation
   */
  async calculateProration(
    subscriptionId: string,
    newPlanId: string
  ): Promise<{
    prorationDate: Date;
    creditAmount: number;
    newAmount: number;
    immediateCharge: number;
  }> {
    // Implementation
  }

  /**
   * Get available promo codes
   * @param userId User ID
   * @returns List of available promo codes
   */
  async getAvailablePromoCodes(
    userId: string
  ): Promise<PromoCodeData[]> {
    // Implementation
  }

  /**
   * Validate payment information
   * @param paymentData Payment data to validate
   * @returns Validation result
   */
  private validatePaymentInfo(
    paymentData: any
  ): { valid: boolean; errors?: string[] } {
    // Implementation
  }

  /**
   * Log subscription event
   * @param event Event data
   * @returns Created event log
   */
  private async logSubscriptionEvent(
    event: SubscriptionEvent
  ): Promise<void> {
    // Implementation
  }

  /**
   * Calculate next billing date
   * @param currentDate Current date
   * @param billingPeriod Billing period
   * @returns Next billing date
   */
  private calculateNextBillingDate(
    currentDate: Date,
    billingPeriod: BillingPeriod
  ): Date {
    // Implementation
  }

  /**
   * Validate subscription plan change
   * @param currentPlan Current plan
   * @param newPlan New plan
   * @returns Validation result
   */
  private validatePlanChange(
    currentPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan
  ): { 
    valid: boolean; 
    isUpgrade: boolean;
    isDifferentBillingPeriod: boolean;
  } {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new subscription successfully
- Should get subscription by ID
- Should get user's active subscription
- Should update subscription details
- Should cancel subscription at period end
- Should cancel subscription immediately
- Should reactivate canceled subscription
- Should change subscription plan (upgrade)
- Should change subscription plan (downgrade)
- Should get available subscription plans
- Should add payment method
- Should remove payment method
- Should set default payment method
- Should get user payment methods
- Should get billing history
- Should get invoice by ID
- Should get upcoming invoice
- Should generate invoice PDF
- Should apply valid promo code
- Should reject invalid promo code
- Should check feature access correctly
- Should check subscription usage limits
- Should start trial period
- Should process webhook events correctly
- Should update billing address
- Should update tax information
- Should get subscription receipt
- Should calculate proration correctly
- Should get available promo codes
- Should validate payment information
- Should log subscription events
- Should calculate next billing date
- Should validate subscription plan changes

### Integration Tests
- Should integrate with subscription repository for CRUD operations
- Should integrate with user repository for user data
- Should integrate with payment repository for payment methods
- Should interact correctly with Stripe service
- Should update user service with plan information
- Should send notifications for subscription events
- Should handle external payment processor webhooks
- Should manage subscription status transitions
- Should enforce feature access based on subscription plan
- Should handle subscription renewal properly
- Should manage trial conversion to paid plan
- Should process refunds correctly
- Should handle payment failures gracefully
- Should maintain billing history accurately
- Should handle currency conversions correctly

## Implementation Notes
1. **Subscription Management**:
   - Implement subscription lifecycle management
   - Support different billing periods (monthly, annual)
   - Implement plan upgrade/downgrade logic
   - Support subscription pause/resume
   - Handle subscription expiration and renewals
   - Support trial periods with conversion
   - Implement subscription status tracking
   - Support prorated billing for plan changes

2. **Payment Processing**:
   - Integrate with Stripe for payment processing
   - Support multiple payment methods per user
   - Implement secure payment information handling
   - Support automatic payment retries
   - Handle failed payments gracefully
   - Support manual payment capture when needed
   - Implement receipt and invoice generation
   - Support tax calculation and handling

3. **Entitlements and Access Control**:
   - Implement feature access control based on plan
   - Support usage-based limitations
   - Implement quota tracking and enforcement
   - Support grace periods for exceeded quotas
   - Implement entitlement checking API
   - Support feature enablement/disablement
   - Handle plan transitions and feature availability
   - Support custom entitlements for specific users

4. **Promotional Offers**:
   - Implement promo code redemption
   - Support different discount types (percentage, fixed)
   - Implement time-limited promotions
   - Support trial extensions
   - Handle referral bonuses
   - Support special offers and campaigns
   - Implement promotion tracking and analytics
   - Support targeted promotions

5. **Security and Compliance**:
   - Implement PCI-compliant payment handling
   - Support secure storage of billing information
   - Implement proper invoice and receipt generation
   - Handle tax compliance for different regions
   - Support GDPR for billing information
   - Implement audit trails for billing events
   - Support subscription data portability
   - Handle secure webhook validation

6. **Error Handling and Edge Cases**:
   - Handle payment failures gracefully
   - Implement retry mechanisms for failed operations
   - Support subscription recovery after errors
   - Handle refund and chargeback scenarios
   - Manage plan changes during billing cycle
   - Handle subscription conflicts
   - Implement fallbacks for service unavailability
   - Manage subscription during account state changes

## Related Files
- src/models/interfaces/subscription.interface.ts
- src/repositories/subscription.repository.ts
- src/repositories/payment.repository.ts
- src/controllers/subscription.controller.ts
- src/routes/subscription.routes.ts
- src/middleware/subscription-access.middleware.ts
- src/config/subscription.config.ts
- src/services/stripe.service.ts
- src/services/user.service.ts
- src/services/notification.service.ts
