import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/validators/env";

export const runtime = "nodejs"; // Ensure Node runtime

/**
 * Create Supabase client for use in Server Components, Server Actions, and Route Handlers
 * Handles cookie management for authentication
 *
 * @example
 * ```tsx
 * import { createSupabaseServerClient } from "@/lib/supabase/server";
 *
 * export async function ServerComponent() {
 *   const supabase = await createSupabaseServerClient();
 *   const { data } = await supabase.from('table').select();
 *   return <div>{data}</div>;
 * }
 * ```
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options });
            });
          } catch {
            // In Server Components we cannot mutate cookies; ignore safely.
          }
        },
      },
    }
  );
}

/**
 * Get the authenticated user in Server Components
 * Returns user object or null if not authenticated
 *
 * @example
 * ```tsx
 * import { getUser } from "@/lib/supabase/server";
 *
 * export async function ProtectedPage() {
 *   const user = await getUser();
 *   if (!user) redirect('/sign-in');
 *   return <div>Hello {user.email}</div>;
 * }
 * ```
 */
export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Require authentication in Server Components
 * Throws an error if user is not authenticated
 * Use this for pages that absolutely require auth
 *
 * @throws {Error} If user is not authenticated
 *
 * @example
 * ```tsx
 * import { requireUser } from "@/lib/supabase/server";
 *
 * export async function ProtectedPage() {
 *   const user = await requireUser();
 *   return <div>Hello {user.email}</div>;
 * }
 * ```
 */
export async function requireUser() {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
