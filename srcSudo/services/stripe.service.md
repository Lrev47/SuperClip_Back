# stripe.service.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the Stripe payment processing integration service for the SuperClip application. It provides a unified interface for interacting with the Stripe API, handling customers, payment methods, subscriptions, invoices, and webhook events. The service abstracts Stripe-specific implementation details, provides error handling and retry logic, and ensures proper security practices are followed for payment processing.

## Dependencies
- External packages:
  - stripe
  - @prisma/client
  - date-fns
  - uuid
  - zod (for validation)
  - express (for webhook handling)
- Internal modules:
  - ../utils/logger.ts
  - ../utils/error.ts
  - ../config/stripe.config.ts
  - ../models/interfaces/payment.interface.ts
  - ../models/interfaces/subscription.interface.ts

## Inputs/Outputs
- **Input**: Customer data, payment method information, subscription requests, webhook events
- **Output**: Stripe API responses, formatted payment information, operation results

## API/Methods
```typescript
import Stripe from 'stripe';
import { Logger } from '../utils/logger';
import { AppError, ErrorCode } from '../utils/error';
import { StripeConfig } from '../config/stripe.config';
import { 
  CreateCustomerParams,
  PaymentMethodParams,
  SubscriptionParams,
  StripeWebhookEvent,
  StripeCheckoutOptions,
  StripeBillingPortalOptions,
  StripeInvoiceParams,
  StripeRefundParams,
  StripePaymentIntentParams,
  StripeCustomerResponse,
  StripeSubscriptionResponse,
  StripePaymentMethodResponse,
  StripePriceResponse,
  StripeProductResponse,
  StripeInvoiceResponse,
  StripePaymentIntentResponse,
  StripeSessionResponse
} from '../models/interfaces/payment.interface';
import { v4 as uuidv4 } from 'uuid';
import * as dateFns from 'date-fns';
import { Request, Response } from 'express';
import { z } from 'zod';

export class StripeService {
  private stripe: Stripe;
  private logger: Logger;
  private config: StripeConfig;
  private webhookSecret: string;

  constructor(
    logger: Logger,
    config: StripeConfig
  ) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2023-10-16', // Update to the latest API version
      maxNetworkRetries: 3,
      timeout: 30000
    });
    this.logger = logger;
    this.config = config;
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Create a new Stripe customer
   * @param customerData Customer data
   * @returns Created customer
   */
  async createCustomer(
    customerData: CreateCustomerParams
  ): Promise<StripeCustomerResponse> {
    // Implementation
  }

  /**
   * Get Stripe customer by ID
   * @param customerId Stripe customer ID
   * @returns Customer data
   */
  async getCustomer(
    customerId: string
  ): Promise<StripeCustomerResponse | null> {
    // Implementation
  }

  /**
   * Update Stripe customer
   * @param customerId Stripe customer ID
   * @param updateData Update data
   * @returns Updated customer
   */
  async updateCustomer(
    customerId: string,
    updateData: Partial<CreateCustomerParams>
  ): Promise<StripeCustomerResponse> {
    // Implementation
  }

  /**
   * Delete Stripe customer
   * @param customerId Stripe customer ID
   * @returns Deletion result
   */
  async deleteCustomer(
    customerId: string
  ): Promise<{ deleted: boolean }> {
    // Implementation
  }

  /**
   * Create payment method
   * @param paymentMethodData Payment method data
   * @returns Created payment method
   */
  async createPaymentMethod(
    paymentMethodData: PaymentMethodParams
  ): Promise<StripePaymentMethodResponse> {
    // Implementation
  }

  /**
   * Attach payment method to customer
   * @param paymentMethodId Payment method ID
   * @param customerId Customer ID
   * @returns Attached payment method
   */
  async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    customerId: string
  ): Promise<StripePaymentMethodResponse> {
    // Implementation
  }

  /**
   * Detach payment method from customer
   * @param paymentMethodId Payment method ID
   * @returns Detached payment method
   */
  async detachPaymentMethod(
    paymentMethodId: string
  ): Promise<StripePaymentMethodResponse> {
    // Implementation
  }

  /**
   * Get customer payment methods
   * @param customerId Customer ID
   * @param type Payment method type
   * @returns List of payment methods
   */
  async getCustomerPaymentMethods(
    customerId: string,
    type: Stripe.PaymentMethodListParams.Type = 'card'
  ): Promise<StripePaymentMethodResponse[]> {
    // Implementation
  }

  /**
   * Update default payment method
   * @param customerId Customer ID
   * @param paymentMethodId Payment method ID
   * @returns Updated customer
   */
  async updateDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<StripeCustomerResponse> {
    // Implementation
  }

  /**
   * Create subscription
   * @param subscriptionData Subscription data
   * @returns Created subscription
   */
  async createSubscription(
    subscriptionData: SubscriptionParams
  ): Promise<StripeSubscriptionResponse> {
    // Implementation
  }

  /**
   * Get subscription
   * @param subscriptionId Subscription ID
   * @returns Subscription data
   */
  async getSubscription(
    subscriptionId: string
  ): Promise<StripeSubscriptionResponse | null> {
    // Implementation
  }

  /**
   * Update subscription
   * @param subscriptionId Subscription ID
   * @param updateData Update data
   * @returns Updated subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updateData: Partial<SubscriptionParams>
  ): Promise<StripeSubscriptionResponse> {
    // Implementation
  }

  /**
   * Cancel subscription
   * @param subscriptionId Subscription ID
   * @param cancelAtPeriodEnd Whether to cancel at period end
   * @returns Cancelled subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<StripeSubscriptionResponse> {
    // Implementation
  }

  /**
   * Create product
   * @param productData Product data
   * @returns Created product
   */
  async createProduct(
    productData: Stripe.ProductCreateParams
  ): Promise<StripeProductResponse> {
    // Implementation
  }

  /**
   * Get product
   * @param productId Product ID
   * @returns Product data
   */
  async getProduct(
    productId: string
  ): Promise<StripeProductResponse | null> {
    // Implementation
  }

  /**
   * Create price
   * @param priceData Price data
   * @returns Created price
   */
  async createPrice(
    priceData: Stripe.PriceCreateParams
  ): Promise<StripePriceResponse> {
    // Implementation
  }

  /**
   * Get price
   * @param priceId Price ID
   * @returns Price data
   */
  async getPrice(
    priceId: string
  ): Promise<StripePriceResponse | null> {
    // Implementation
  }

  /**
   * Get product prices
   * @param productId Product ID
   * @returns List of prices
   */
  async getProductPrices(
    productId: string
  ): Promise<StripePriceResponse[]> {
    // Implementation
  }

  /**
   * Get invoice
   * @param invoiceId Invoice ID
   * @returns Invoice data
   */
  async getInvoice(
    invoiceId: string
  ): Promise<StripeInvoiceResponse | null> {
    // Implementation
  }

  /**
   * Get upcoming invoice
   * @param customerId Customer ID
   * @param subscriptionId Optional subscription ID
   * @returns Upcoming invoice
   */
  async getUpcomingInvoice(
    customerId: string,
    subscriptionId?: string
  ): Promise<StripeInvoiceResponse | null> {
    // Implementation
  }

  /**
   * Create invoice
   * @param invoiceData Invoice data
   * @returns Created invoice
   */
  async createInvoice(
    invoiceData: StripeInvoiceParams
  ): Promise<StripeInvoiceResponse> {
    // Implementation
  }

  /**
   * Pay invoice
   * @param invoiceId Invoice ID
   * @returns Paid invoice
   */
  async payInvoice(
    invoiceId: string
  ): Promise<StripeInvoiceResponse> {
    // Implementation
  }

  /**
   * Create refund
   * @param refundData Refund data
   * @returns Refund result
   */
  async createRefund(
    refundData: StripeRefundParams
  ): Promise<Stripe.Refund> {
    // Implementation
  }

  /**
   * Create payment intent
   * @param paymentIntentData Payment intent data
   * @returns Created payment intent
   */
  async createPaymentIntent(
    paymentIntentData: StripePaymentIntentParams
  ): Promise<StripePaymentIntentResponse> {
    // Implementation
  }

  /**
   * Create checkout session
   * @param sessionOptions Checkout options
   * @returns Created session
   */
  async createCheckoutSession(
    sessionOptions: StripeCheckoutOptions
  ): Promise<StripeSessionResponse> {
    // Implementation
  }

  /**
   * Create billing portal session
   * @param portalOptions Portal options
   * @returns Created portal session
   */
  async createBillingPortalSession(
    portalOptions: StripeBillingPortalOptions
  ): Promise<{ url: string }> {
    // Implementation
  }

  /**
   * Process webhook event
   * @param payload Event payload
   * @param signature Stripe signature
   * @returns Processed event
   */
  async processWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<{
    type: string;
    data: any;
    eventId: string;
  }> {
    // Implementation
  }

  /**
   * Calculate tax for order
   * @param orderData Order data for tax calculation
   * @returns Tax calculation result
   */
  async calculateTax(
    orderData: Stripe.TaxCalculationCreateParams
  ): Promise<Stripe.TaxCalculation> {
    // Implementation
  }

  /**
   * Create promotion code
   * @param promoData Promotion code data
   * @returns Created promotion code
   */
  async createPromotionCode(
    promoData: Stripe.PromotionCodeCreateParams
  ): Promise<Stripe.PromotionCode> {
    // Implementation
  }

  /**
   * Validate promotion code
   * @param promoCode Promotion code
   * @returns Validation result
   */
  async validatePromotionCode(
    promoCode: string
  ): Promise<{
    valid: boolean;
    promotionCode?: Stripe.PromotionCode;
  }> {
    // Implementation
  }

  /**
   * Handle Stripe errors
   * @param error Stripe error
   * @returns Formatted error
   */
  private handleStripeError(error: Stripe.StripeError): AppError {
    // Implementation
  }

  /**
   * Format Stripe customer response
   * @param customer Stripe customer
   * @returns Formatted customer
   */
  private formatCustomerResponse(
    customer: Stripe.Customer
  ): StripeCustomerResponse {
    // Implementation
  }

  /**
   * Format Stripe subscription response
   * @param subscription Stripe subscription
   * @returns Formatted subscription
   */
  private formatSubscriptionResponse(
    subscription: Stripe.Subscription
  ): StripeSubscriptionResponse {
    // Implementation
  }

  /**
   * Format Stripe payment method response
   * @param paymentMethod Stripe payment method
   * @returns Formatted payment method
   */
  private formatPaymentMethodResponse(
    paymentMethod: Stripe.PaymentMethod
  ): StripePaymentMethodResponse {
    // Implementation
  }
}
```

## Test Specifications
### Unit Tests
- Should create a new Stripe customer
- Should get customer by ID
- Should update customer information
- Should delete customer
- Should create payment method
- Should attach payment method to customer
- Should detach payment method from customer
- Should get customer payment methods
- Should update default payment method
- Should create subscription
- Should get subscription by ID
- Should update subscription
- Should cancel subscription
- Should create product
- Should get product by ID
- Should create price
- Should get price by ID
- Should get product prices
- Should get invoice by ID
- Should get upcoming invoice
- Should create invoice
- Should pay invoice
- Should create refund
- Should create payment intent
- Should create checkout session
- Should create billing portal session
- Should process webhook event correctly
- Should calculate tax for order
- Should create promotion code
- Should validate promotion code
- Should handle Stripe errors properly
- Should format customer response correctly
- Should format subscription response correctly
- Should format payment method response correctly

### Integration Tests
- Should handle Stripe API responses correctly
- Should retry failed API calls
- Should validate webhook signatures
- Should handle common Stripe error cases
- Should process subscription creation end-to-end
- Should process payment method attachment end-to-end
- Should process subscription cancellation end-to-end
- Should handle customer deletion with active subscriptions
- Should process checkout session creation and completion
- Should handle webhook event processing for various event types
- Should process billing portal session creation and return
- Should validate and apply promotion codes
- Should calculate taxes correctly for different jurisdictions
- Should handle concurrent Stripe operations safely
- Should properly format various Stripe response types

## Implementation Notes
1. **Stripe API Integration**:
   - Implement secure handling of API keys
   - Use the latest Stripe API version
   - Implement proper retry logic for API calls
   - Format Stripe responses for internal use
   - Implement comprehensive error handling
   - Support both sync and async operations
   - Implement proper timeout handling
   - Follow Stripe best practices for API usage

2. **Customer Management**:
   - Support creating and updating customers
   - Implement proper customer metadata
   - Support customer search and filtering
   - Handle customer deletion correctly
   - Implement customer data validation
   - Support customer portal access
   - Maintain customer-payment method relationships
   - Implement customer expansion options

3. **Payment Processing**:
   - Support multiple payment method types
   - Implement secure payment method handling
   - Support 3D Secure authentication
   - Implement payment method validation
   - Support card fingerprinting and fraud detection
   - Implement payment intent confirmation
   - Support automatic payment retries
   - Handle payment failures gracefully

4. **Subscription Management**:
   - Implement subscription lifecycle management
   - Support subscription items and quantities
   - Implement trial periods and handling
   - Support proration for subscription changes
   - Implement metered billing support
   - Support subscription schedules
   - Handle subscription cancellation logic
   - Implement invoice management for subscriptions

5. **Webhook Handling**:
   - Implement secure webhook signature verification
   - Support all relevant event types
   - Implement idempotent event processing
   - Handle webhook replay protection
   - Implement webhook error handling
   - Support webhook testing
   - Implement webhook logging
   - Handle webhook retries

6. **Security Considerations**:
   - Secure API key storage
   - Implement PCI-compliant handling
   - Support Strong Customer Authentication (SCA)
   - Implement proper error messaging
   - Handle sensitive data securely
   - Implement proper logging (without sensitive data)
   - Support audit trails for financial transactions
   - Follow Stripe security best practices

## Related Files
- src/models/interfaces/payment.interface.ts
- src/config/stripe.config.ts
- src/controllers/webhook.controller.ts
- src/routes/payment.routes.ts
- src/middleware/webhook-verification.middleware.ts
- src/services/subscription.service.ts
- src/utils/payment-formatter.ts
- src/utils/error.ts
