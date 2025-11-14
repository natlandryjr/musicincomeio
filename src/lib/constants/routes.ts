/**
 * Application route constants
 * Single source of truth for all route paths
 */

export const ROUTES = {
  // Public routes
  HOME: "/",
  LIBRARY: "/library",
  LIBRARY_ARTICLE: (slug: string) => `/library/${slug}`,

  // Auth routes
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  VERIFY_EMAIL: "/verify-email",
  RESET_PASSWORD: "/reset-password",

  // Protected routes
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",
  INCOME: "/income",
  CONNECTIONS: "/connections",
  STATEMENTS: "/statements",
  BILLING: "/billing",
  SETTINGS: "/settings",

  // API routes
  API: {
    AUTH_CALLBACK: "/api/auth/callback",
    BILLING_CHECKOUT: "/api/billing/checkout",
    STRIPE_WEBHOOK: "/api/webhooks/stripe",
    OAUTH_GOOGLE_START: "/api/oauth/google/start",
    OAUTH_GOOGLE_CALLBACK: "/api/oauth/google/callback",
    SYNC_GMAIL: "/api/sync/gmail",
    CRON_GMAIL_SYNC: "/api/cron/gmail-sync",
  },
} as const;

/**
 * Check if route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    ROUTES.DASHBOARD,
    ROUTES.ONBOARDING,
    ROUTES.INCOME,
    ROUTES.CONNECTIONS,
    ROUTES.STATEMENTS,
    ROUTES.BILLING,
    ROUTES.SETTINGS,
  ];
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is an auth route
 */
export function isAuthRoute(pathname: string): boolean {
  const authRoutes = [
    ROUTES.SIGN_IN,
    ROUTES.SIGN_UP,
    ROUTES.VERIFY_EMAIL,
    ROUTES.RESET_PASSWORD,
  ];
  return authRoutes.some((route) => pathname.startsWith(route));
}
