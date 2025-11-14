import { z } from "zod";

/**
 * Environment variable schema validation
 * Ensures all required env vars are present and valid at build/runtime
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key required").optional(),

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_", "Invalid Stripe publishable key"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "Invalid Stripe secret key"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "Invalid Stripe webhook secret"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "Google client ID required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Google client secret required"),

  // Email (optional - email features disabled if not set)
  RESEND_API_KEY: z.string().min(1, "Resend API key required").optional(),

  // App Config
  NEXT_PUBLIC_APP_URL: z.string().url("Invalid app URL").optional().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
});

/**
 * Client-safe environment variables
 * Only includes NEXT_PUBLIC_ prefixed vars
 */
const clientEnvSchema = envSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: true,
  NEXT_PUBLIC_APP_URL: true,
});

/**
 * Validated environment variables (lazy initialization)
 * Use this instead of process.env throughout the app
 * Only validates when first accessed at runtime
 */
let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv(): z.infer<typeof envSchema> {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  }
  return cachedEnv;
}

/**
 * Getter for env (backward compatibility)
 * Validates on first access
 */
export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_target, prop) {
    return getEnv()[prop as keyof z.infer<typeof envSchema>];
  },
});

/**
 * Client-safe environment variables (lazy initialization)
 * Safe to use in client components
 */
let cachedClientEnv: z.infer<typeof clientEnvSchema> | null = null;

export function getClientEnv(): z.infer<typeof clientEnvSchema> {
  // During build time, env vars may not be available
  // Return placeholder values that will be replaced at runtime
  if (typeof window === "undefined" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Build time - return placeholder values
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_placeholder",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    } as z.infer<typeof clientEnvSchema>;
  }
  
  if (!cachedClientEnv) {
    cachedClientEnv = clientEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });
  }
  return cachedClientEnv;
}

/**
 * Getter for clientEnv (backward compatibility)
 * Validates on first access
 */
export const clientEnv = new Proxy({} as z.infer<typeof clientEnvSchema>, {
  get(_target, prop) {
    return getClientEnv()[prop as keyof z.infer<typeof clientEnvSchema>];
  },
});

// Type exports for autocomplete
export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
