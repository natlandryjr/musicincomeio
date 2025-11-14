/**
 * Subscription plan configuration
 * Central source of truth for pricing and feature limits
 */

export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    priceId: null,
    interval: null,
    features: {
      maxIncomeEntries: 50,
      maxStatements: 5,
      maxConnections: 1,
      emailReports: false,
      advancedAnalytics: false,
      prioritySupport: false,
      exportData: false,
      autoSync: false,
    },
    limits: {
      incomeEntries: 50,
      statements: 5,
      connections: 1,
    },
  },
  PRO: {
    id: "pro",
    name: "Pro",
    price: 12,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
    interval: "month",
    features: {
      maxIncomeEntries: Infinity,
      maxStatements: Infinity,
      maxConnections: Infinity,
      emailReports: true,
      advancedAnalytics: true,
      prioritySupport: true,
      exportData: true,
      autoSync: true,
    },
    limits: {
      incomeEntries: Infinity,
      statements: Infinity,
      connections: Infinity,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];

/**
 * Check if user has access to a feature
 */
export function hasFeature(
  planId: PlanId | string | null | undefined,
  feature: keyof Plan["features"]
): boolean {
  const plan = PLANS[planId as PlanId] || PLANS.FREE;
  return Boolean(plan.features[feature]);
}

/**
 * Check if user is within limits
 */
export function isWithinLimit(
  planId: PlanId | string | null | undefined,
  limitType: keyof Plan["limits"],
  currentCount: number
): boolean {
  const plan = PLANS[planId as PlanId] || PLANS.FREE;
  const limit = plan.limits[limitType];
  return currentCount < limit;
}

/**
 * Get user's plan object
 */
export function getPlan(planId: PlanId | string | null | undefined): Plan {
  return PLANS[planId as PlanId] || PLANS.FREE;
}
