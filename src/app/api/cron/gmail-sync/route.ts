import { NextRequest, NextResponse } from "next/server";
import { scheduleNightlySync } from "@/lib/sync/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron endpoint for nightly Gmail sync
 *
 * Security: Requires CRON_SECRET environment variable
 *
 * Usage:
 * - Vercel Cron: Add to vercel.json
 * - Manual trigger: GET /api/cron/gmail-sync with Authorization header
 *
 * @example vercel.json
 * ```json
 * {
 *   "crons": [{
 *     "path": "/api/cron/gmail-sync",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Check if CRON_SECRET is configured
    if (!cronSecret) {
      console.warn("CRON_SECRET not configured, allowing request");
      // In development, you might want to allow requests without secret
      // In production, you should require it
      if (process.env.NODE_ENV === "production") {
        return new NextResponse("CRON_SECRET not configured", { status: 500 });
      }
    } else if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Invalid authorization header");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Starting nightly Gmail sync...");
    const startTime = Date.now();

    // Run the sync
    const result = await scheduleNightlySync();

    const duration = Date.now() - startTime;

    console.log("Nightly sync completed:", {
      duration: `${duration}ms`,
      totalUsers: result.totalUsers,
      successful: result.successfulSyncs,
      failed: result.failedSyncs,
    });

    // Log individual results
    result.results.forEach((userResult) => {
      if (userResult.success) {
        console.log(`✓ ${userResult.userEmail}: ${userResult.entriesCreated} entries created`);
      } else {
        console.error(`✗ ${userResult.userEmail}: ${userResult.error}`);
      }
    });

    // Return summary
    return NextResponse.json(
      {
        success: true,
        summary: {
          totalUsers: result.totalUsers,
          successfulSyncs: result.successfulSyncs,
          failedSyncs: result.failedSyncs,
          duration: `${duration}ms`,
        },
        results: result.results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in nightly sync:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
