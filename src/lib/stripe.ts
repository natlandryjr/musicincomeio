import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe client instance (lazy initialization)
 * Only initializes when first accessed at runtime
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-10-29.clover" as any,
    });
  }
  return stripeInstance;
}

/**
 * Default export for backward compatibility
 * @deprecated Use getStripe() instead for better error handling
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});


