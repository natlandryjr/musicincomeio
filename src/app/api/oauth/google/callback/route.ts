import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/connections?google_error=1", req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/connections?google_code_missing=1", req.url));
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
      code,
    }),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    console.error("Token error:", txt);
    return NextResponse.redirect(new URL("/connections?google_token_error=1", req.url));
  }

  const tokens = await tokenRes.json();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/(auth)/sign-in", req.url));
  }

  const meRes = await fetch("https://www.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const me = await meRes.json();

  const emailAddress = me.emailAddress as string | undefined;
  if (!emailAddress) {
    console.error("No emailAddress in Gmail profile:", me);
    return NextResponse.redirect(new URL("/connections?google_profile_error=1", req.url));
  }

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  const scope = "https://www.googleapis.com/auth/gmail.readonly";

  const { error: upsertError } = await supabase.from("external_accounts").upsert(
    {
      user_id: user.id,
      provider: "gmail",
      provider_account_id: emailAddress,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: expiresAt,
      scope,
      label: `Gmail (${emailAddress})`,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,provider,provider_account_id",
    } as { onConflict: string }
  );

  if (upsertError) {
    console.error("external_accounts upsert error:", upsertError);
    return NextResponse.redirect(new URL("/connections?google_store_error=1", req.url));
  }

  return NextResponse.redirect(new URL("/connections?connected=gmail", req.url));
}


