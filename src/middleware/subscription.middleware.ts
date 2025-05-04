import { Request, Response, NextFunction } from 'express';

// Subscription plan types
export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

// Subscription status
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  PAST_DUE = 'PAST_DUE',
  TRIAL = 'TRIAL',
}

// Subscription details interface
export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiresAt?: Date;
  features: string[];
}

// Extend Express Request interface for TypeScript
export interface RequestWithSubscription extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  subscription?: SubscriptionDetails;
}

// Import service to handle subscription logic
import * as subscriptionService from '../services/subscription.service';

/**
 * Middleware that validates user subscription status
 * Sets subscription details on the request object for downstream middleware and handlers
 */
export const checkSubscription = async (
  req: RequestWithSubscription,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Check if user is authenticated
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  try {
    // Get subscription details from service
    const subscriptionDetails = await subscriptionService.getSubscriptionStatus(req.user.id);

    // Add subscription details to request
    req.subscription = subscriptionDetails;

    // Handle expired subscriptions
    if (subscriptionDetails.status === SubscriptionStatus.EXPIRED) {
      res.status(402).json({
        error: 'Payment Required',
        message: 'Your subscription has expired. Please renew to continue.',
        subscription: subscriptionDetails,
      });
      return;
    }

    // Allow user to proceed if subscription is active
    if (
      subscriptionDetails.status === SubscriptionStatus.ACTIVE ||
      subscriptionDetails.plan === SubscriptionPlan.FREE
    ) {
      next();
      return;
    }

    // Handle other subscription states
    res.status(403).json({
      error: 'Forbidden',
      message: 'Your subscription status does not allow access to this resource.',
      subscription: subscriptionDetails,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate subscription status.',
    });
  }
};

/**
 * Middleware factory that checks if user has access to a specific feature
 */
export const requireFeatureAccess = (feature: string) => {
  return async (req: RequestWithSubscription, res: Response, next: NextFunction): Promise<void> => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Check if subscription has been validated
    if (!req.subscription) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'A subscription check must be performed before checking feature access',
      });
      return;
    }

    try {
      // Check if user has access to the feature
      const hasAccess = await subscriptionService.checkFeatureAccess(
        req.user.id,
        feature,
        req.subscription,
      );

      if (hasAccess) {
        next();
        return;
      }

      // Feature not available in the subscription
      res.status(403).json({
        error: 'Forbidden',
        message: `Your subscription does not include access to ${feature}`,
        upgrade: true,
      });
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to validate feature access',
      });
    }
  };
};

/**
 * Middleware factory that tracks usage metrics for subscription limits
 */
export const subscriptionUsageTracker = (
  usageType: string,
  getIncrementValue: (req: RequestWithSubscription) => number = () => 1,
) => {
  return async (req: RequestWithSubscription, res: Response, next: NextFunction): Promise<void> => {
    // Skip tracking for unauthenticated users (they should be blocked by auth middleware anyway)
    if (!req.user || !req.subscription) {
      next();
      return;
    }

    try {
      // Enterprise tier has unlimited usage
      if (req.subscription.plan === SubscriptionPlan.ENTERPRISE) {
        await subscriptionService.recordUsage(req.user.id, usageType, getIncrementValue(req));
        next();
        return;
      }

      // Get current usage and limits
      const currentUsage = await subscriptionService.getCurrentUsage(req.user.id, usageType);
      const usageLimit = await subscriptionService.getUsageLimits(
        req.user.id,
        usageType,
        req.subscription.plan,
      );

      // Check if usage would exceed limit
      const incrementValue = getIncrementValue(req);
      if (currentUsage + incrementValue > usageLimit) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: `You have reached your ${usageType} limit for your current subscription plan`,
          currentUsage,
          limit: usageLimit,
          upgrade: true,
        });
        return;
      }

      // Record usage and continue
      await subscriptionService.recordUsage(req.user.id, usageType, incrementValue);
      next();
    } catch (error) {
      console.error('Usage tracking error:', error);
      // Don't block the request if usage tracking fails
      next();
    }
  };
};
