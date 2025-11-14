import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendNightlySyncEmail } from "@/lib/email/send";
import { getSourceMetadata } from "@/lib/constants";

/**
 * Sync result for a single user
 */
export type UserSyncResult = {
  userId: string;
  userEmail: string;
  success: boolean;
  statementsFound: number;
  entriesCreated: number;
  error?: string;
};

/**
 * Get all users who have Gmail connected and should be synced
 */
export async function getUsersForSync(): Promise<
  Array<{
    userId: string;
    userEmail: string;
    accessToken: string;
    refreshToken: string | null;
  }>
> {
  const supabase = await createSupabaseServerClient();

  // Get all Gmail external accounts
  const { data: accounts, error } = await supabase
    .from("external_accounts")
    .select(
      `
      user_id,
      access_token,
      refresh_token,
      users!inner(email)
    `
    )
    .eq("provider", "gmail");

  if (error) {
    console.error("Error fetching Gmail accounts:", error);
    return [];
  }

  return (accounts || []).map((account: any) => ({
    userId: account.user_id,
    userEmail: account.users.email,
    accessToken: account.access_token,
    refreshToken: account.refresh_token,
  }));
}

/**
 * Schedule nightly sync for all users
 * This is the main entry point for the cron job
 */
export async function scheduleNightlySync(): Promise<{
  totalUsers: number;
  successfulSyncs: number;
  failedSyncs: number;
  results: UserSyncResult[];
}> {
  const users = await getUsersForSync();
  const results: UserSyncResult[] = [];

  for (const user of users) {
    try {
      // Import sync function dynamically to avoid circular dependencies
      const { syncGmailForUser } = await import("@/lib/sync/gmail");

      const result = await syncGmailForUser(
        user.userId,
        user.accessToken,
        user.refreshToken
      );

      const syncResult = {
        userId: user.userId,
        userEmail: user.userEmail,
        success: result.success,
        statementsFound: result.statementsCreated || 0,
        entriesCreated: result.entriesCreated || 0,
        error: result.error,
      };

      results.push(syncResult);

      // Send email notification if statements were found
      if (result.success && result.statementsCreated && result.statementsCreated > 0) {
        try {
          // Get user profile for artist name
          const supabase = await createSupabaseServerClient();
          const { data: profile } = await supabase
            .from("users")
            .select("artist_name")
            .eq("id", user.userId)
            .single();

          // Get breakdown by source
          const { data: entries } = await supabase
            .from("income_entries")
            .select("source_type, amount")
            .eq("user_id", user.userId)
            .order("created_at", { ascending: false })
            .limit(result.entriesCreated || 100);

          const bySource: Record<string, { amount: number; count: number }> = {};
          let totalAmount = 0;

          entries?.forEach((entry) => {
            const source = entry.source_type;
            if (!bySource[source]) {
              bySource[source] = { amount: 0, count: 0 };
            }
            bySource[source].amount += Number(entry.amount);
            bySource[source].count += 1;
            totalAmount += Number(entry.amount);
          });

          const sources = Object.entries(bySource).map(([key, value]) => ({
            name: getSourceMetadata(key).label,
            amount: value.amount,
            count: value.count,
          }));

          // Send email (don't await - fire and forget)
          sendNightlySyncEmail(user.userEmail, {
            artistName: profile?.artist_name || "there",
            statementsFound: result.statementsCreated,
            entriesCreated: result.entriesCreated || 0,
            totalAmount,
            sources,
          }).catch((error) => {
            console.error("Error sending sync email:", error);
          });
        } catch (error) {
          console.error("Error preparing sync email:", error);
          // Don't fail the sync if email fails
        }
      }
    } catch (error) {
      results.push({
        userId: user.userId,
        userEmail: user.userEmail,
        success: false,
        statementsFound: 0,
        entriesCreated: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const successfulSyncs = results.filter((r) => r.success).length;
  const failedSyncs = results.filter((r) => !r.success).length;

  return {
    totalUsers: users.length,
    successfulSyncs,
    failedSyncs,
    results,
  };
}
