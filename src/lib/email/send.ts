"use server";

import { sendEmail } from "./client";
import {
  WelcomeEmail,
  NightlySyncEmail,
  StatementUploadedEmail,
  MissingMoneyAlertEmail,
} from "./templates";

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, artistName: string) {
  return sendEmail({
    to,
    subject: "Welcome to MusicIncome.io! 🎵",
    react: WelcomeEmail({ artistName, email: to }),
  });
}

/**
 * Send nightly sync results email
 */
export async function sendNightlySyncEmail(
  to: string,
  data: {
    artistName: string;
    statementsFound: number;
    entriesCreated: number;
    totalAmount: number;
    sources: Array<{ name: string; amount: number; count: number }>;
  }
) {
  // Only send if statements were found OR if user has email notifications enabled
  if (data.statementsFound === 0) {
    // Skip for now - we could make this configurable later
    return { success: true, data: { skipped: true } };
  }

  return sendEmail({
    to,
    subject:
      data.statementsFound > 0
        ? `🎉 ${data.statementsFound} new royalty statement${data.statementsFound === 1 ? "" : "s"} found!`
        : "Nightly sync complete - No new statements",
    react: NightlySyncEmail(data),
  });
}

/**
 * Send statement uploaded confirmation
 */
export async function sendStatementUploadedEmail(
  to: string,
  data: {
    artistName: string;
    fileName: string;
    entriesCreated: number;
    totalAmount: number;
    parserUsed: string;
  }
) {
  return sendEmail({
    to,
    subject: `✓ Statement uploaded: ${data.fileName}`,
    react: StatementUploadedEmail(data),
  });
}

/**
 * Send missing money alert
 */
export async function sendMissingMoneyAlert(
  to: string,
  data: {
    artistName: string;
    totalEstimated: number;
    topOpportunities: Array<{
      source: string;
      amount: number;
      actionUrl: string;
    }>;
  }
) {
  // Only send if estimated amount is significant (>$100)
  if (data.totalEstimated < 100) {
    return { success: true, data: { skipped: true } };
  }

  return sendEmail({
    to,
    subject: `🚨 You may be missing $${data.totalEstimated.toLocaleString()} in royalties`,
    react: MissingMoneyAlertEmail(data),
  });
}
