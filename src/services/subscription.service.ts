import { SubscriptionPlan, SubscriptionStatus } from '../middleware/subscription.middleware';

// Subscription details interface
export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiresAt?: Date;
  features: string[];
}

// Feature access matrix - maps features to subscription plans that can access them
const featureAccessMatrix: Record<string, SubscriptionPlan[]> = {
  'basic-feature': [
    SubscriptionPlan.FREE,
    SubscriptionPlan.BASIC,
    SubscriptionPlan.PREMIUM,
    SubscriptionPlan.ENTERPRISE,
  ],
  'standard-feature': [
    SubscriptionPlan.BASIC,
    SubscriptionPlan.PREMIUM,
    SubscriptionPlan.ENTERPRISE,
  ],
  'premium-feature': [SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE],
  'enterprise-feature': [SubscriptionPlan.ENTERPRISE],
  'api-calls': [
    SubscriptionPlan.FREE,
    SubscriptionPlan.BASIC,
    SubscriptionPlan.PREMIUM,
    SubscriptionPlan.ENTERPRISE,
  ],
  storage: [SubscriptionPlan.BASIC, SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE],
};

// Usage limits for different subscription plans
const usageLimits: Record<string, Record<SubscriptionPlan, number>> = {
  'api-calls': {
    [SubscriptionPlan.FREE]: 100,
    [SubscriptionPlan.BASIC]: 1000,
    [SubscriptionPlan.PREMIUM]: 10000,
    [SubscriptionPlan.ENTERPRISE]: Number.MAX_SAFE_INTEGER,
  },
  storage: {
    [SubscriptionPlan.FREE]: 10, // 10 MB
    [SubscriptionPlan.BASIC]: 100, // 100 MB
    [SubscriptionPlan.PREMIUM]: 1000, // 1 GB
    [SubscriptionPlan.ENTERPRISE]: Number.MAX_SAFE_INTEGER,
  },
};

// Mock user usage data (in a real application, this would be stored in a database)
const userUsage: Record<string, Record<string, number>> = {};

/**
 * Gets the subscription status for a user
 * In a real application, this would query a database or external subscription service
 */
export const getSubscriptionStatus = async (userId: string): Promise<SubscriptionDetails> => {
  // This is a mock implementation
  // In a real application, this would fetch data from a database or external service

  // Mock different subscription plans for testing
  const lastDigit = userId.charAt(userId.length - 1);
  let plan = SubscriptionPlan.FREE;
  let status = SubscriptionStatus.ACTIVE;
  let expiresAt: Date | undefined;

  if (lastDigit >= '1' && lastDigit <= '3') {
    plan = SubscriptionPlan.BASIC;
  } else if (lastDigit >= '4' && lastDigit <= '6') {
    plan = SubscriptionPlan.PREMIUM;
  } else if (lastDigit >= '7' && lastDigit <= '9') {
    plan = SubscriptionPlan.ENTERPRISE;
  }

  // Simulate expired subscriptions for testing
  if (lastDigit === '0') {
    status = SubscriptionStatus.EXPIRED;
    expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
  } else {
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days in future
  }

  // Get features for the plan
  const features = Object.keys(featureAccessMatrix).filter(feature =>
    featureAccessMatrix[feature].includes(plan),
  );

  return {
    plan,
    status,
    expiresAt,
    features,
  };
};

/**
 * Checks if a user has access to a specific feature
 */
export const checkFeatureAccess = async (
  userId: string,
  feature: string,
  subscription: SubscriptionDetails,
): Promise<boolean> => {
  // Special case for enterprise users - they have access to everything
  if (subscription.plan === SubscriptionPlan.ENTERPRISE) {
    return true;
  }

  // Check if the feature exists in the access matrix
  if (!featureAccessMatrix[feature]) {
    return false;
  }

  // Check if the user's subscription plan has access to this feature
  return featureAccessMatrix[feature].includes(subscription.plan);
};

/**
 * Records usage for a user
 */
export const recordUsage = async (
  userId: string,
  usageType: string,
  incrementValue: number = 1,
): Promise<void> => {
  // Initialize user's usage record if it doesn't exist
  if (!userUsage[userId]) {
    userUsage[userId] = {};
  }

  // Initialize usage type if it doesn't exist
  if (!userUsage[userId][usageType]) {
    userUsage[userId][usageType] = 0;
  }

  // Increment usage
  userUsage[userId][usageType] += incrementValue;
};

/**
 * Gets the current usage for a user
 */
export const getCurrentUsage = async (userId: string, usageType: string): Promise<number> => {
  // Return 0 if user or usage type doesn't exist
  if (!userUsage[userId] || !userUsage[userId][usageType]) {
    return 0;
  }

  return userUsage[userId][usageType];
};

/**
 * Gets the usage limits for a subscription plan
 */
export const getUsageLimits = async (
  userId: string,
  usageType: string,
  plan: SubscriptionPlan,
): Promise<number> => {
  // Check if the usage type exists in the limits
  if (!usageLimits[usageType]) {
    return 0; // No limit defined
  }

  return usageLimits[usageType][plan];
};
