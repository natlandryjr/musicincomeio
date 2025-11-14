import { NextRequest, NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", _req.url));
  }

  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: profile?.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const PRICE_ID = process.env.STRIPE_PRICE_PRO_MONTH ?? "";

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?status=cancelled`,
    metadata: { user_id: user.id },
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}


