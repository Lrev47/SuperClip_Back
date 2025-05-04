import { Request, Response } from 'express';
import {
  checkSubscription,
  requireFeatureAccess,
  subscriptionUsageTracker,
  SubscriptionPlan,
  SubscriptionStatus,
  RequestWithSubscription,
} from '../../../src/middleware/subscription.middleware';

// Mock subscription service
jest.mock('../../../src/services/subscription.service', () => ({
  getSubscriptionStatus: jest.fn(),
  checkFeatureAccess: jest.fn(),
  recordUsage: jest.fn(),
  getUsageLimits: jest.fn(),
  getCurrentUsage: jest.fn(),
}));

// Import after mocking
const subscriptionService = require('../../../src/services/subscription.service');

describe('Subscription Middleware', () => {
  let mockRequest: Partial<RequestWithSubscription>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        role: 'USER',
      },
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('checkSubscription', () => {
    test('should return 401 if no user is authenticated', async () => {
      mockRequest = { headers: {} }; // No user

      await checkSubscription(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should set subscription details and call next() for active subscription', async () => {
      const subscriptionDetails = {
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
        features: ['feature1', 'feature2', 'feature3'],
      };

      subscriptionService.getSubscriptionStatus.mockResolvedValue(subscriptionDetails);

      await checkSubscription(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.subscription).toEqual(subscriptionDetails);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should return 402 for expired subscription', async () => {
      const subscriptionDetails = {
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.EXPIRED,
        expiresAt: new Date(Date.now() - 1000), // Expired
        features: ['feature1', 'feature2', 'feature3'],
      };

      subscriptionService.getSubscriptionStatus.mockResolvedValue(subscriptionDetails);

      await checkSubscription(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(402);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Payment Required',
          message: expect.stringContaining('expired'),
        }),
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should allow FREE tier with active status', async () => {
      const subscriptionDetails = {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        features: ['feature1'],
      };

      subscriptionService.getSubscriptionStatus.mockResolvedValue(subscriptionDetails);

      await checkSubscription(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.subscription).toEqual(subscriptionDetails);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should handle service error gracefully', async () => {
      subscriptionService.getSubscriptionStatus.mockRejectedValue(new Error('Service error'));

      await checkSubscription(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal Server Error',
        }),
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('requireFeatureAccess', () => {
    test('should return 401 if no user is authenticated', async () => {
      mockRequest = { headers: {} }; // No user

      const middleware = requireFeatureAccess('premium-feature');
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 403 if subscription not checked', async () => {
      mockRequest = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: 'USER',
        },
      }; // User but no subscription

      const middleware = requireFeatureAccess('premium-feature');
      await middleware(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
          message: expect.stringContaining('subscription'),
        }),
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should call next() if feature is included in subscription', async () => {
      mockRequest.subscription = {
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        features: ['basic-feature', 'premium-feature', 'advanced-feature'],
      };

      subscriptionService.checkFeatureAccess.mockResolvedValue(true);

      const middleware = requireFeatureAccess('premium-feature');
      await middleware(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(subscriptionService.checkFeatureAccess).toHaveBeenCalledWith(
        mockRequest.user!.id,
        'premium-feature',
        mockRequest.subscription,
      );
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should return 403 if feature is not included in subscription', async () => {
      mockRequest.subscription = {
        plan: SubscriptionPlan.BASIC,
        status: SubscriptionStatus.ACTIVE,
        features: ['basic-feature'],
      };

      subscriptionService.checkFeatureAccess.mockResolvedValue(false);

      const middleware = requireFeatureAccess('premium-feature');
      await middleware(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(subscriptionService.checkFeatureAccess).toHaveBeenCalledWith(
        mockRequest.user!.id,
        'premium-feature',
        mockRequest.subscription,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
          message: expect.stringContaining('access'),
        }),
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('subscriptionUsageTracker', () => {
    test('should track usage and call next() when under limits', async () => {
      mockRequest.subscription = {
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        features: ['api-calls'],
      };

      subscriptionService.getCurrentUsage.mockResolvedValue(80); // 80% used
      subscriptionService.getUsageLimits.mockResolvedValue(1000); // Limit of 1000

      const middleware = subscriptionUsageTracker('api-calls');
      await middleware(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(subscriptionService.recordUsage).toHaveBeenCalledWith(
        mockRequest.user!.id,
        'api-calls',
        1, // Default increment
      );
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should return 429 when usage exceeds limits', async () => {
      mockRequest.subscription = {
        plan: SubscriptionPlan.BASIC,
        status: SubscriptionStatus.ACTIVE,
        features: ['api-calls'],
      };

      subscriptionService.getCurrentUsage.mockResolvedValue(1000); // 100% used
      subscriptionService.getUsageLimits.mockResolvedValue(1000); // Limit of 1000

      const middleware = subscriptionUsageTracker('api-calls');
      await middleware(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Too Many Requests',
          message: expect.stringContaining('limit'),
        }),
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should support custom usage increments', async () => {
      mockRequest.subscription = {
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        features: ['storage'],
      };

      mockRequest.body = {
        fileSize: 5, // MB
      };

      subscriptionService.getCurrentUsage.mockResolvedValue(50); // 50MB used
      subscriptionService.getUsageLimits.mockResolvedValue(100); // 100MB limit

      const middleware = subscriptionUsageTracker('storage', req => req.body.fileSize);
      await middleware(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(subscriptionService.recordUsage).toHaveBeenCalledWith(
        mockRequest.user!.id,
        'storage',
        5, // Custom increment based on file size
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should always allow usage for ENTERPRISE tier', async () => {
      mockRequest.subscription = {
        plan: SubscriptionPlan.ENTERPRISE,
        status: SubscriptionStatus.ACTIVE,
        features: ['api-calls', 'storage'],
      };

      // Even with usage over limits, enterprise should pass
      subscriptionService.getCurrentUsage.mockResolvedValue(2000); // 2x the limit
      subscriptionService.getUsageLimits.mockResolvedValue(1000);

      const middleware = subscriptionUsageTracker('api-calls');
      await middleware(
        mockRequest as RequestWithSubscription,
        mockResponse as Response,
        nextFunction,
      );

      expect(subscriptionService.recordUsage).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
