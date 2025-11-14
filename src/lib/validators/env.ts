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
 * Validated environment variables
 * Use this instead of process.env throughout the app
 */
export const env = envSchema.parse({
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

/**
 * Client-safe environment variables
 * Safe to use in client components
 */
export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

// Type exports for autocomplete
export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
