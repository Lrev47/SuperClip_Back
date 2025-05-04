# subscription.controller.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose
This file implements the HTTP request handlers/controllers for subscription-related operations in the SuperClip application. It processes incoming subscription requests, handling plan purchases, upgrades, downgrades, cancellations, and billing information management. The controller validates subscription-related requests, communicates with payment processors, enforces entitlement checks, and manages subscription lifecycle events. It provides endpoints for users to view, modify, and manage their subscription status and payment methods.

## Dependencies
- External packages:
  - express
  - zod (for request validation)
  - express-validator (for request validation)
  - http-status-codes
  - stripe (for payment processing)
- Internal modules:
  - ../services/subscription.service.ts
  - ../services/user.service.ts
  - ../utils/async-handler.ts
  - ../utils/error.ts
  - ../utils/logger.ts
  - ../utils/validators.ts
  - ../middlewares/auth.middleware.ts
  - ../middlewares/subscription.middleware.ts
  - ../models/interfaces/subscription.interface.ts
  - ../config/subscription.config.ts

## Inputs/Outputs
- **Input**: HTTP requests (GET, POST, PUT, DELETE) with parameters, query strings, request bodies, authorization headers, and payment processor webhooks
- **Output**: HTTP responses with appropriate status codes, subscription details in JSON format, error messages, and payment processor webhook acknowledgments

## Data Types
```typescript
// Request validation schemas
const createSubscriptionSchema = z.object({
  planId: z.string(),
  billingPeriod: z.enum(['MONTHLY', 'ANNUALLY']).optional(),
  promoCode: z.string().optional(),
  paymentMethodId: z.string().optional(),
  trialOptions: z.object({
    withTrial: z.boolean(),
    trialDays: z.number().optional()
  }).optional(),
  billingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  }).optional(),
  taxInformation: z.object({
    taxId: z.string().optional(),
    businessName: z.string().optional(),
    taxExempt: z.boolean().optional()
  }).optional()
});

const updateSubscriptionSchema = z.object({
  planId: z.string().optional(),
  billingPeriod: z.enum(['MONTHLY', 'ANNUALLY']).optional(),
  autoRenew: z.boolean().optional(),
  paymentMethodId: z.string().optional(),
  billingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  }).optional()
});

const cancelSubscriptionSchema = z.object({
  reason: z.enum([
    'TOO_EXPENSIVE',
    'MISSING_FEATURES',
    'FOUND_ALTERNATIVE',
    'TECHNICAL_ISSUES',
    'TEMPORARY_PAUSE',
    'OTHER'
  ]).optional(),
  feedback: z.string().optional(),
  cancelImmediately: z.boolean().optional().default(false)
});

const paymentMethodSchema = z.object({
  type: z.enum(['CREDIT_CARD', 'PAYPAL', 'BANK_ACCOUNT']),
  token: z.string(),
  isDefault: z.boolean().optional().default(false),
  billingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  }).optional()
});

const validatePromoCodeSchema = z.object({
  code: z.string(),
  planId: z.string().optional()
});

const updateBillingAddressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string()
});
```

## API/Methods
```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SubscriptionService } from '../services/subscription.service';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../utils/async-handler';
import { AppError, ErrorCode } from '../utils/error';
import { Logger } from '../utils/logger';
import { validateRequest } from '../utils/validators';
import { authenticate } from '../middlewares/auth.middleware';
import { checkSubscription } from '../middlewares/subscription.middleware';
import { 
  CreateSubscriptionInput,
  SubscriptionUpdateInput,
  PaymentMethodInput,
  CancellationReason,
  BillingAddress
} from '../models/interfaces/subscription.interface';
import { z } from 'zod';
import { SubscriptionConfig } from '../config/subscription.config';
import Stripe from 'stripe';

export class SubscriptionController {
  private router: Router;
  private subscriptionService: SubscriptionService;
  private userService: UserService;
  private logger: Logger;
  private config: SubscriptionConfig;
  private stripe: Stripe;

  constructor(
    subscriptionService: SubscriptionService,
    userService: UserService,
    logger: Logger,
    config: SubscriptionConfig
  ) {
    this.router = Router();
    this.subscriptionService = subscriptionService;
    this.userService = userService;
    this.logger = logger;
    this.config = config;
    this.stripe = new Stripe(this.config.stripeSecretKey, {
      apiVersion: '2023-10-16'
    });
    this.setupRoutes();
  }

  /**
   * Setup all subscription routes
   */
  private setupRoutes(): void {
    // Public routes
    this.router.get('/plans', this.getSubscriptionPlans);
    this.router.post('/webhook', this.handleWebhook);
    this.router.post('/validate-promo', validateRequest(validatePromoCodeSchema), this.validatePromoCode);
    
    // Protected routes
    this.router.use(authenticate);
    
    // Subscription management
    this.router.post('/', validateRequest(createSubscriptionSchema), this.createSubscription);
    this.router.get('/current', this.getCurrentSubscription);
    this.router.put('/current', validateRequest(updateSubscriptionSchema), this.updateSubscription);
    this.router.delete('/current', validateRequest(cancelSubscriptionSchema), this.cancelSubscription);
    this.router.post('/current/reactivate', this.reactivateSubscription);
    
    // Payment methods
    this.router.get('/payment-methods', this.getPaymentMethods);
    this.router.post('/payment-methods', validateRequest(paymentMethodSchema), this.addPaymentMethod);
    this.router.delete('/payment-methods/:paymentMethodId', this.removePaymentMethod);
    this.router.put('/payment-methods/:paymentMethodId/default', this.setDefaultPaymentMethod);
    
    // Billing information
    this.router.get('/billing-history', this.getBillingHistory);
    this.router.get('/invoices', this.getInvoices);
    this.router.get('/invoices/:invoiceId', this.getInvoice);
    this.router.get('/invoices/:invoiceId/download', this.downloadInvoice);
    this.router.put('/billing-address', validateRequest(updateBillingAddressSchema), this.updateBillingAddress);
    
    // Subscription info
    this.router.get('/usage', this.getUsage);
    this.router.get('/receipt', this.getSubscriptionReceipt);
  }

  /**
   * Get available subscription plans
   * @param req Express request
   * @param res Express response
   */
  private getSubscriptionPlans = asyncHandler(async (req: Request, res: Response) => {
    const countryCode = req.query.countryCode as string;
    
    const plans = await this.subscriptionService.getSubscriptionPlans(countryCode);
    
    res.status(StatusCodes.OK).json(plans);
  });

  /**
   * Handle webhook events from payment processors
   * @param req Express request
   * @param res Express response
   */
  private handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      throw new AppError('Missing Stripe signature', ErrorCode.BAD_REQUEST);
    }
    
    let event: Stripe.Event;
    
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        this.config.stripeWebhookSecret
      );
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      throw new AppError('Webhook signature verification failed', ErrorCode.BAD_REQUEST);
    }
    
    // Process the event
    try {
      await this.subscriptionService.processWebhookEvent({
        provider: 'stripe',
        type: event.type,
        data: event.data.object
      });
      
      res.status(StatusCodes.OK).json({ received: true });
    } catch (err) {
      this.logger.error('Failed to process webhook', err);
      throw new AppError('Failed to process webhook', ErrorCode.INTERNAL_SERVER_ERROR);
    }
  });

  /**
   * Validate a promo code
   * @param req Express request
   * @param res Express response
   */
  private validatePromoCode = asyncHandler(async (req: Request, res: Response) => {
    const { code, planId } = req.body;
    
    const promoResult = await this.subscriptionService.validatePromoCode(code, planId);
    
    res.status(StatusCodes.OK).json(promoResult);
  });

  /**
   * Create a new subscription
   * @param req Express request
   * @param res Express response
   */
  private createSubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const subscriptionData: CreateSubscriptionInput = req.body;
    
    // Check if user already has an active subscription
    const currentSubscription = await this.subscriptionService.getUserSubscription(userId);
    
    if (currentSubscription && currentSubscription.status !== 'CANCELED') {
      throw new AppError('User already has an active subscription', ErrorCode.BAD_REQUEST);
    }
    
    const subscription = await this.subscriptionService.createSubscription(userId, subscriptionData);
    
    res.status(StatusCodes.CREATED).json(subscription);
  });

  /**
   * Get current user subscription
   * @param req Express request
   * @param res Express response
   */
  private getCurrentSubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const subscription = await this.subscriptionService.getUserSubscription(userId);
    
    if (!subscription) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No active subscription found' });
    }
    
    res.status(StatusCodes.OK).json(subscription);
  });

  /**
   * Update current subscription
   * @param req Express request
   * @param res Express response
   */
  private updateSubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const updateData: SubscriptionUpdateInput = req.body;
    
    // Get current subscription
    const currentSubscription = await this.subscriptionService.getUserSubscription(userId);
    
    if (!currentSubscription) {
      throw new AppError('No active subscription found', ErrorCode.NOT_FOUND);
    }
    
    const updatedSubscription = await this.subscriptionService.updateSubscription(
      currentSubscription.id,
      updateData
    );
    
    res.status(StatusCodes.OK).json(updatedSubscription);
  });

  /**
   * Cancel current subscription
   * @param req Express request
   * @param res Express response
   */
  private cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { reason, feedback, cancelImmediately } = req.body;
    
    // Get current subscription
    const currentSubscription = await this.subscriptionService.getUserSubscription(userId);
    
    if (!currentSubscription) {
      throw new AppError('No active subscription found', ErrorCode.NOT_FOUND);
    }
    
    const result = await this.subscriptionService.cancelSubscription(
      currentSubscription.id,
      reason as CancellationReason,
      cancelImmediately
    );
    
    // Store cancellation feedback if provided
    if (feedback) {
      await this.subscriptionService.storeCancellationFeedback(
        currentSubscription.id,
        userId,
        reason as CancellationReason,
        feedback
      );
    }
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Reactivate a canceled subscription
   * @param req Express request
   * @param res Express response
   */
  private reactivateSubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    // Get current subscription
    const currentSubscription = await this.subscriptionService.getUserSubscription(userId);
    
    if (!currentSubscription) {
      throw new AppError('No subscription found', ErrorCode.NOT_FOUND);
    }
    
    if (currentSubscription.status !== 'CANCELED') {
      throw new AppError('Subscription is not canceled', ErrorCode.BAD_REQUEST);
    }
    
    const result = await this.subscriptionService.reactivateSubscription(currentSubscription.id);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Get user payment methods
   * @param req Express request
   * @param res Express response
   */
  private getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const paymentMethods = await this.subscriptionService.getUserPaymentMethods(userId);
    
    res.status(StatusCodes.OK).json(paymentMethods);
  });

  /**
   * Add a payment method
   * @param req Express request
   * @param res Express response
   */
  private addPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const paymentMethodData: PaymentMethodInput = req.body;
    
    const paymentMethod = await this.subscriptionService.addPaymentMethod(userId, paymentMethodData);
    
    res.status(StatusCodes.CREATED).json(paymentMethod);
  });

  /**
   * Remove a payment method
   * @param req Express request
   * @param res Express response
   */
  private removePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { paymentMethodId } = req.params;
    
    const result = await this.subscriptionService.removePaymentMethod(paymentMethodId, userId);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Set default payment method
   * @param req Express request
   * @param res Express response
   */
  private setDefaultPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { paymentMethodId } = req.params;
    
    const result = await this.subscriptionService.setDefaultPaymentMethod(paymentMethodId, userId);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Get billing history
   * @param req Express request
   * @param res Express response
   */
  private getBillingHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    
    const billingHistory = await this.subscriptionService.getBillingHistory(userId, { limit, page });
    
    res.status(StatusCodes.OK).json(billingHistory);
  });

  /**
   * Get user invoices
   * @param req Express request
   * @param res Express response
   */
  private getInvoices = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    
    const invoices = await this.subscriptionService.getUserInvoices(userId, { limit, page });
    
    res.status(StatusCodes.OK).json(invoices);
  });

  /**
   * Get a specific invoice
   * @param req Express request
   * @param res Express response
   */
  private getInvoice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { invoiceId } = req.params;
    
    const invoice = await this.subscriptionService.getInvoiceById(invoiceId, userId);
    
    if (!invoice) {
      throw new AppError('Invoice not found', ErrorCode.NOT_FOUND);
    }
    
    res.status(StatusCodes.OK).json(invoice);
  });

  /**
   * Download invoice as PDF
   * @param req Express request
   * @param res Express response
   */
  private downloadInvoice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { invoiceId } = req.params;
    
    const invoicePdf = await this.subscriptionService.generateInvoicePdf(invoiceId, userId);
    
    if (!invoicePdf) {
      throw new AppError('Failed to generate invoice PDF', ErrorCode.INTERNAL_SERVER_ERROR);
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
    
    res.status(StatusCodes.OK).send(invoicePdf);
  });

  /**
   * Update billing address
   * @param req Express request
   * @param res Express response
   */
  private updateBillingAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const billingAddress: BillingAddress = req.body;
    
    const result = await this.subscriptionService.updateBillingAddress(userId, billingAddress);
    
    res.status(StatusCodes.OK).json(result);
  });

  /**
   * Get subscription usage statistics
   * @param req Express request
   * @param res Express response
   */
  private getUsage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const usage = await this.subscriptionService.getSubscriptionUsage(userId);
    
    res.status(StatusCodes.OK).json(usage);
  });

  /**
   * Get subscription receipt
   * @param req Express request
   * @param res Express response
   */
  private getSubscriptionReceipt = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const subscriptionId = req.query.subscriptionId as string;
    
    const receipt = await this.subscriptionService.getSubscriptionReceipt(
      subscriptionId || (await this.subscriptionService.getUserSubscription(userId))?.id
    );
    
    if (!receipt) {
      throw new AppError('Receipt not found', ErrorCode.NOT_FOUND);
    }
    
    res.status(StatusCodes.OK).json(receipt);
  });

  /**
   * Get router
   * @returns Express router
   */
  public getRouter(): Router {
    return this.router;
  }
}

export default SubscriptionController;
```

## Test Specifications

### Unit Tests
1. **Controller Initialization**
   - Should initialize with all dependencies
   - Should setup all routes

2. **Request Validation**
   - Should validate subscription creation request
   - Should validate subscription update request
   - Should validate cancellation request
   - Should validate payment method request
   - Should validate promo code validation request
   - Should validate billing address update request

3. **Route Handlers**
   - Each handler should:
     - Pass the correct data to the service methods
     - Return the correct status code
     - Return the correct response format
     - Handle errors properly

4. **Authorization**
   - Should check if user is authenticated for protected routes
   - Should verify that the authenticated user owns the subscription
   - Should validate webhook signatures for webhook processing

5. **Error Handling**
   - Should handle service errors
   - Should handle validation errors
   - Should handle not found errors
   - Should handle payment processing errors
   - Should handle webhook signature verification errors

### Integration Tests
1. **Subscription Management**
   - Should create a new subscription with valid data
   - Should retrieve current subscription
   - Should update subscription with valid data
   - Should cancel subscription
   - Should reactivate a canceled subscription

2. **Payment Method Handling**
   - Should retrieve user's payment methods
   - Should add a new payment method
   - Should remove a payment method
   - Should set a payment method as default

3. **Billing Operations**
   - Should retrieve billing history
   - Should retrieve invoices
   - Should retrieve a specific invoice
   - Should update billing address

4. **Promo Codes and Plans**
   - Should retrieve available subscription plans
   - Should validate valid promo codes
   - Should reject invalid promo codes

5. **Webhooks and Events**
   - Should validate webhook signatures
   - Should process valid webhook events
   - Should reject invalid webhook signatures

6. **Receipt and Usage**
   - Should retrieve subscription usage
   - Should retrieve subscription receipt

## Implementation Notes

### Error Handling and Logging
- Implement consistent error handling across all endpoints
- Log payment and subscription events for audit purposes
- Validate all input data thoroughly before processing
- Handle edge cases like subscription timeouts, payment failures
- Log webhook processing with unique identifiers
- Track common subscription errors for monitoring

### Security Considerations
- Implement secure handling of payment information
- Validate webhook signatures for all payment processor events
- Sanitize billing information to prevent injection attacks
- Implement rate limiting on payment-related endpoints
- Ensure proper authorization for all subscription operations
- Use secure transmissions for all payment data
- Handle PCI compliance requirements appropriately

### Performance Optimization
- Cache subscription plan data when appropriate
- Optimize database queries for subscription lookups
- Implement proper indexing for subscription-related tables
- Process webhooks asynchronously when possible
- Handle large invoice and billing history pagination efficiently

### Payment Processing
- Handle various payment failures gracefully
- Implement proper retry logic for failed payments
- Support multiple payment processors
- Handle currency conversions appropriately
- Implement proper idempotency for payment operations
- Consider regional payment method requirements

### Edge Cases
- Handle subscription state transitions correctly
- Manage subscription upgrades and downgrades with prorations
- Handle subscription expirations and renewals
- Address trial periods and trial conversions
- Handle refunds and chargebacks
- Support subscription pausing and resuming
- Implement grandfathered pricing for existing subscribers when prices change

## Related Files
- srcSudo/services/subscription.service.ts
- srcSudo/services/stripe.service.ts
- srcSudo/middlewares/subscription.middleware.ts
- srcSudo/models/interfaces/subscription.interface.ts
- srcSudo/repositories/subscription.repository.ts
- srcSudo/repositories/payment.repository.ts
- srcSudo/utils/async-handler.ts
- srcSudo/utils/error.ts
- srcSudo/config/subscription.config.ts
