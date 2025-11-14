"use client";

import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/validators/env";

/**
 * Create Supabase client for use in Client Components
 * Uses browser-safe environment variables only
 *
 * @example
 * ```tsx
 * "use client"
 *
 * import { createSupabaseBrowserClient } from "@/lib/supabase/client";
 *
 * export function MyComponent() {
 *   const supabase = createSupabaseBrowserClient();
 *   // Use supabase client
 * }
 * ```
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
