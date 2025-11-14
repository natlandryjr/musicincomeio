"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  // Only access env vars in the browser (client-side)
  // During SSR/build, use process.env directly to avoid validation errors
  if (typeof window === "undefined") {
    // Server-side during build - use placeholder values
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    );
  }

  // Client-side - validate and use env vars
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file."
    );
  }

  return createBrowserClient(url, key);
}
