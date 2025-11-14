"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/validators/env";
import { ROUTES, PLANS } from "@/lib/constants";
import { getStripe } from "@/lib/stripe";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Create Stripe checkout session for Pro upgrade
 */
export async function createCheckoutSession(): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id, subscription_tier")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_tier === "pro") {
      return { success: false, error: "Already subscribed to Pro" };
    }

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: PLANS.PRO.priceId!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${env.NEXT_PUBLIC_APP_URL}${ROUTES.BILLING}?success=true`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}${ROUTES.BILLING}?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    if (!session.url) {
      return { success: false, error: "Failed to create checkout session" };
    }

    return { success: true, data: { url: session.url } };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create Stripe Customer Portal session for managing subscription
 */
export async function createPortalSession(): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return { success: false, error: "No active subscription found" };
    }

    // Create portal session
    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${env.NEXT_PUBLIC_APP_URL}${ROUTES.BILLING}`,
    });

    return { success: true, data: { url: session.url } };
  } catch (error) {
    console.error("Error creating portal session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cancel subscription (via server action)
 */
export async function cancelSubscription(): Promise<ActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return { success: false, error: "No active subscription" };
    }

    // Get active subscriptions
    const subscriptions = await getStripe().subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return { success: false, error: "No active subscription found" };
    }

    // Cancel subscription at period end
    await getStripe().subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true,
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if user has reached usage limits
 */
export async function checkUsageLimit(
  limitType: "incomeEntries" | "statements" | "connections"
): Promise<ActionResult<{ withinLimit: boolean; current: number; max: number }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from("users")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const tier = profile?.subscription_tier || "free";
    const plan = PLANS[tier as keyof typeof PLANS] || PLANS.FREE;

    // Get current count based on limit type
    let current = 0;

    if (limitType === "incomeEntries") {
      const { count } = await supabase
        .from("income_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      current = count || 0;
    } else if (limitType === "statements") {
      const { count } = await supabase
        .from("raw_statements")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      current = count || 0;
    } else if (limitType === "connections") {
      const { count } = await supabase
        .from("external_accounts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      current = count || 0;
    }

    const max = plan.limits[limitType];
    const withinLimit = current < max;

    return {
      success: true,
      data: { withinLimit, current, max },
    };
  } catch (error) {
    console.error("Error checking usage limit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
