"use client";
import { createBrowserClient } from "@supabase/ssr";
import { getClientEnv } from "@/lib/validators/env";

export function createSupabaseBrowserClient() {
  // Use validated env vars with lazy initialization
  const env = getClientEnv();
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
