import { NextRequest, NextResponse } from "next/server";

import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const raw = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(raw, sig!, whSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown webhook error";
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (userId) {
        await supabase.from("users").update({ subscription_tier: "pro" }).eq("id", userId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      // Handle subscription cancellation/deletion
      // Note: canceled subscriptions trigger 'deleted' event
      const subscription = event.data.object as Stripe.Subscription;
      // Add subscription cleanup logic here if needed
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}


