/**
 * Gmail sync functionality
 * Refactored from src/lib/gmailSync.ts for better organization
 */

import { google } from "googleapis";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { processGmailSyncResults, isStatementProcessed } from "./processor";
import { env } from "@/lib/validators/env";

type SyncResult = {
  success: boolean;
  statementsCreated?: number;
  entriesCreated?: number;
  error?: string;
};

/**
 * Sync Gmail for a specific user
 */
export async function syncGmailForUser(
  userId: string,
  accessToken: string,
  refreshToken: string | null
): Promise<SyncResult> {
  try {
    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      `${env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken || undefined,
    });

    // Handle token refresh
    oauth2Client.on("tokens", async (tokens) => {
      if (tokens.access_token) {
        const supabase = await createSupabaseServerClient();
        await supabase
          .from("external_accounts")
          .update({
            access_token: tokens.access_token,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("provider", "gmail");
      }
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Search for emails with CSV attachments (last 7 days for nightly sync)
    const query = 'has:attachment filename:csv newer_than:7d';
    const { data } = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 10,
    });

    if (!data.messages || data.messages.length === 0) {
      return { success: true, statementsCreated: 0, entriesCreated: 0 };
    }

    const messagesToProcess: Array<{
      messageId: string;
      subject: string;
      from: string;
      csvContent: string;
      fileName: string;
    }> = [];

    // Fetch and process each message
    for (const message of data.messages) {
      if (!message.id) continue;

      // Check if already processed
      const alreadyProcessed = await isStatementProcessed(userId, message.id);
      if (alreadyProcessed) {
        continue;
      }

      const { data: fullMessage } = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      if (!fullMessage.payload?.parts) continue;

      // Extract metadata
      const headers = fullMessage.payload.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "Unknown";
      const from = headers.find((h) => h.name === "From")?.value || "Unknown";

      // Find CSV attachments
      for (const part of fullMessage.payload.parts) {
        if (
          part.filename &&
          part.filename.endsWith(".csv") &&
          part.body?.attachmentId
        ) {
          const { data: attachment } = await gmail.users.messages.attachments.get(
            {
              userId: "me",
              messageId: message.id,
              id: part.body.attachmentId,
            }
          );

          if (!attachment.data) continue;

          // Decode base64
          const csvContent = Buffer.from(
            attachment.data,
            "base64url"
          ).toString("utf-8");

          messagesToProcess.push({
            messageId: message.id,
            subject,
            from,
            csvContent,
            fileName: part.filename,
          });
        }
      }
    }

    // Process all messages
    const result = await processGmailSyncResults(userId, messagesToProcess);

    return {
      success: result.success,
      statementsCreated: result.statementsCreated,
      entriesCreated: result.entriesCreated,
      error: result.errors.length > 0 ? result.errors.join("; ") : undefined,
    };
  } catch (error) {
    console.error("Error syncing Gmail:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
