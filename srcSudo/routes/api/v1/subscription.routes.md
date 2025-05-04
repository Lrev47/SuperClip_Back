# subscription.routes.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This file defines the API routes for subscription management in the SuperClip application. It maps HTTP endpoints to the appropriate controller methods in the subscription controller and applies necessary middleware for authentication, validation, and security. The routes provide functionality for viewing, purchasing, upgrading, downgrading, and managing subscriptions, as well as handling billing, invoices, and feature access.

## Dependencies

- External packages:
  - express
- Internal modules:
  - ../controllers/subscription.controller.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/validation.middleware.ts
  - ../middlewares/security.middleware.ts
  - ../middlewares/rateLimit.middleware.ts

## Route Definitions

### Get Current Subscription

- **Method**: GET
- **Path**: `/api/v1/subscription`
- **Description**: Get the user's current subscription plan and status
- **Middleware**:
  - authenticate (verifies user is logged in)
- **Controller**: SubscriptionController.getCurrentSubscription
- **Auth Required**: Yes

### Get Subscription Plans

- **Method**: GET
- **Path**: `/api/v1/subscription/plans`
- **Description**: Get available subscription plans with pricing and features
- **Middleware**:
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.getSubscriptionPlans
- **Auth Required**: No

### Get Plan Details

- **Method**: GET
- **Path**: `/api/v1/subscription/plans/:planId`
- **Description**: Get detailed information about a specific plan
- **Middleware**:
  - validateParams (validates plan ID)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.getPlanDetails
- **Auth Required**: No

### Subscribe

- **Method**: POST
- **Path**: `/api/v1/subscription/subscribe`
- **Description**: Purchase a new subscription
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates plan ID and payment details)
  - rateLimit('subscription') (prevents subscription abuse)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.subscribe
- **Auth Required**: Yes

### Upgrade Subscription

- **Method**: POST
- **Path**: `/api/v1/subscription/upgrade`
- **Description**: Upgrade to a higher tier subscription plan
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates new plan ID)
  - rateLimit('subscription') (prevents subscription abuse)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.upgradeSubscription
- **Auth Required**: Yes

### Downgrade Subscription

- **Method**: POST
- **Path**: `/api/v1/subscription/downgrade`
- **Description**: Downgrade to a lower tier subscription plan
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates new plan ID)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.downgradeSubscription
- **Auth Required**: Yes

### Cancel Subscription

- **Method**: POST
- **Path**: `/api/v1/subscription/cancel`
- **Description**: Cancel the current subscription
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates cancellation reason)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.cancelSubscription
- **Auth Required**: Yes

### Reactivate Subscription

- **Method**: POST
- **Path**: `/api/v1/subscription/reactivate`
- **Description**: Reactivate a canceled subscription before it expires
- **Middleware**:
  - authenticate (verifies user is logged in)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.reactivateSubscription
- **Auth Required**: Yes

### Update Payment Method

- **Method**: PUT
- **Path**: `/api/v1/subscription/payment-method`
- **Description**: Update the payment method for the subscription
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates payment method details)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.updatePaymentMethod
- **Auth Required**: Yes

### Get Payment Methods

- **Method**: GET
- **Path**: `/api/v1/subscription/payment-methods`
- **Description**: Get the user's saved payment methods
- **Middleware**:
  - authenticate (verifies user is logged in)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.getPaymentMethods
- **Auth Required**: Yes

### Delete Payment Method

- **Method**: DELETE
- **Path**: `/api/v1/subscription/payment-methods/:methodId`
- **Description**: Delete a saved payment method
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates payment method ID)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.deletePaymentMethod
- **Auth Required**: Yes

### Get Invoices

- **Method**: GET
- **Path**: `/api/v1/subscription/invoices`
- **Description**: Get the user's subscription invoices
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateQuery (validates pagination parameters)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.getInvoices
- **Auth Required**: Yes

### Get Invoice

- **Method**: GET
- **Path**: `/api/v1/subscription/invoices/:invoiceId`
- **Description**: Get a specific invoice by ID
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates invoice ID)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.getInvoice
- **Auth Required**: Yes

### Download Invoice PDF

- **Method**: GET
- **Path**: `/api/v1/subscription/invoices/:invoiceId/pdf`
- **Description**: Download a specific invoice as PDF
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates invoice ID)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.downloadInvoicePdf
- **Auth Required**: Yes

### Get Subscription Usage

- **Method**: GET
- **Path**: `/api/v1/subscription/usage`
- **Description**: Get the user's subscription usage metrics
- **Middleware**:
  - authenticate (verifies user is logged in)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.getSubscriptionUsage
- **Auth Required**: Yes

### Apply Coupon

- **Method**: POST
- **Path**: `/api/v1/subscription/apply-coupon`
- **Description**: Apply a coupon code to the subscription
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateBody (validates coupon code)
  - rateLimit('coupon') (prevents coupon abuse)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.applyCoupon
- **Auth Required**: Yes

### Get Applied Coupons

- **Method**: GET
- **Path**: `/api/v1/subscription/coupons`
- **Description**: Get coupons applied to the subscription
- **Middleware**:
  - authenticate (verifies user is logged in)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.getAppliedCoupons
- **Auth Required**: Yes

### Remove Coupon

- **Method**: DELETE
- **Path**: `/api/v1/subscription/coupons/:couponId`
- **Description**: Remove an applied coupon
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates coupon ID)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.removeCoupon
- **Auth Required**: Yes

### Get Feature Access

- **Method**: GET
- **Path**: `/api/v1/subscription/features`
- **Description**: Get the features available in the user's current subscription
- **Middleware**:
  - authenticate (verifies user is logged in)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.getFeatureAccess
- **Auth Required**: Yes

### Check Feature Access

- **Method**: GET
- **Path**: `/api/v1/subscription/features/:featureId`
- **Description**: Check if the user has access to a specific feature
- **Middleware**:
  - authenticate (verifies user is logged in)
  - validateParams (validates feature ID)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.checkFeatureAccess
- **Auth Required**: Yes

### Get Subscription Limits

- **Method**: GET
- **Path**: `/api/v1/subscription/limits`
- **Description**: Get the limits associated with the user's subscription
- **Middleware**:
  - authenticate (verifies user is logged in)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.getSubscriptionLimits
- **Auth Required**: Yes

### Handle Webhook

- **Method**: POST
- **Path**: `/api/v1/subscription/webhook`
- **Description**: Handle external payment provider webhooks (Stripe, PayPal, etc.)
- **Middleware**:
  - validateBody (validates webhook data)
  - securityHeaders (sets appropriate security headers)
- **Controller**: SubscriptionController.handleWebhook
- **Auth Required**: No (uses webhook secret for authentication)

## Implementation Notes

### Subscription Management

- Implement tiered subscription plans with different features and limits
- Support monthly and annual billing cycles
- Implement flexible upgrade/downgrade policies
- Support subscription pausing and resuming
- Implement prorated billing for mid-cycle changes
- Support granular feature flags tied to subscription plans
- Support trial periods for new users

### Payment Processing

- Integrate with secure payment processors (Stripe, PayPal, etc.)
- Implement PCI-compliant payment handling
- Support multiple payment methods per user
- Implement proper invoice generation and management
- Support tax calculation based on user location
- Handle failed payment scenarios gracefully
- Support automatic payment retries

### Security Considerations

- Use secure, PCI-compliant payment processing
- Never store complete credit card details
- Implement secure webhook validation
- Protect sensitive billing information
- Use HTTPS for all subscription-related routes
- Implement proper logging for all billing events
- Rate limit subscription-related endpoints

### User Experience

- Provide clear information about plan differences
- Implement easy plan comparison
- Send notifications before subscription renewal
- Provide detailed usage metrics
- Support smooth upgrade paths
- Implement easy cancellation process
- Provide detailed invoices and receipts

### Business Logic

- Implement proper proration for plan changes
- Support grace periods for payment failures
- Implement flexible trial expiration handling
- Support coupon and promotion code redemption
- Implement referral programs for subscription discounts
- Track subscription metrics for business analytics
- Implement retention strategies for cancellations

## Related Files

- srcSudo/controllers/subscription.controller.ts
- srcSudo/services/subscription.service.ts
- srcSudo/services/payment.service.ts
- srcSudo/repositories/subscription.repository.ts
- srcSudo/models/interfaces/subscription.interface.ts
- srcSudo/middleware/auth.middleware.ts
- srcSudo/middleware/subscription.middleware.ts
- srcSudo/middleware/validation.middleware.ts
- srcSudo/middleware/security.middleware.ts
