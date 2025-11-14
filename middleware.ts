import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUser } from "@/lib/supabase/middleware";

/**
 * Protected routes that require authentication
 * Add any new authenticated routes here
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/onboarding",
  "/income",
  "/connections",
  "/billing",
  "/statements",
  "/settings",
];

/**
 * Auth routes that should redirect to dashboard if already authenticated
 */
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // If not a protected or auth route, allow through
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Verify user session
  const { user, response } = await getUser(req);

  // Protected routes: redirect to sign-in if not authenticated
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/sign-in", req.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Auth routes: redirect to dashboard if already authenticated
  if (isAuthRoute && user) {
    const redirectUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Onboarding check: redirect to onboarding if profile incomplete
  if (
    user &&
    pathname !== "/onboarding" &&
    isProtectedRoute &&
    pathname !== "/settings"
  ) {
    // TODO: Check if user has completed onboarding (artist_name exists)
    // This requires a database query - implement if needed
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
