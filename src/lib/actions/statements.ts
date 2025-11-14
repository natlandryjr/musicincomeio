"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createStatementSchema, type CreateStatement } from "@/lib/validators/statements";
import { ROUTES } from "@/lib/constants";
import { parseCSV } from "@/lib/parsers";
import { sendStatementUploadedEmail } from "@/lib/email/send";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Create a new statement from uploaded CSV
 */
export async function createStatementFromCSV(
  csvContent: string,
  fileName: string
): Promise<ActionResult<{ id: string; entriesCreated: number }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Parse CSV
    const parseResult = await parseCSV(csvContent);

    if (!parseResult.success) {
      return {
        success: false,
        error: `Failed to parse CSV: ${parseResult.errors[0]?.error || "Unknown error"}`,
      };
    }

    // Create statement record
    const { data: statement, error: statementError } = await supabase
      .from("raw_statements")
      .insert({
        user_id: user.id,
        provider: "manual_upload",
        source_system: "upload",
        raw_payload: { csvContent, fileName },
        label: fileName,
        file_name: fileName,
        file_size: csvContent.length,
        parsed_entries_count: parseResult.entries.length,
      })
      .select("id")
      .single();

    if (statementError) {
      console.error("Error creating statement:", statementError);
      return { success: false, error: "Failed to create statement" };
    }

    // Create income entries
    const entries = parseResult.entries.map((entry) => ({
      user_id: user.id,
      statement_id: statement.id,
      source_type: entry.source_type,
      amount: entry.amount,
      period_start: entry.period_start.toISOString(),
      period_end: entry.period_end.toISOString(),
      notes: entry.notes,
    }));

    const { error: entriesError } = await supabase
      .from("income_entries")
      .insert(entries);

    if (entriesError) {
      console.error("Error creating income entries:", entriesError);
      return { success: false, error: "Failed to create income entries" };
    }

    revalidatePath(ROUTES.STATEMENTS);
    revalidatePath(ROUTES.INCOME);
    revalidatePath(ROUTES.DASHBOARD);

    // Get user profile for email
    const { data: profile } = await supabase
      .from("users")
      .select("artist_name")
      .eq("id", user.id)
      .single();

    // Send confirmation email (don't await - send in background)
    if (profile?.artist_name) {
      const totalAmount = parseResult.entries.reduce((sum, e) => sum + e.amount, 0);
      sendStatementUploadedEmail(user.email!, {
        artistName: profile.artist_name,
        fileName,
        entriesCreated: entries.length,
        totalAmount,
        parserUsed: parseResult.metadata.parser,
      }).catch((error) => {
        console.error("Error sending upload email:", error);
      });
    }

    return {
      success: true,
      data: { id: statement.id, entriesCreated: entries.length },
    };
  } catch (error) {
    console.error("Error in createStatementFromCSV:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a statement and its associated income entries
 */
export async function deleteStatement(
  statementId: string
): Promise<ActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete income entries first (foreign key constraint)
    const { error: entriesError } = await supabase
      .from("income_entries")
      .delete()
      .eq("statement_id", statementId)
      .eq("user_id", user.id);

    if (entriesError) {
      console.error("Error deleting income entries:", entriesError);
      return { success: false, error: "Failed to delete income entries" };
    }

    // Delete statement
    const { error: statementError } = await supabase
      .from("raw_statements")
      .delete()
      .eq("id", statementId)
      .eq("user_id", user.id);

    if (statementError) {
      console.error("Error deleting statement:", statementError);
      return { success: false, error: "Failed to delete statement" };
    }

    revalidatePath(ROUTES.STATEMENTS);
    revalidatePath(ROUTES.INCOME);
    revalidatePath(ROUTES.DASHBOARD);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in deleteStatement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reprocess a statement (re-parse and update entries)
 */
export async function reprocessStatement(
  statementId: string
): Promise<ActionResult<{ entriesCreated: number }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get statement
    const { data: statement, error: fetchError } = await supabase
      .from("raw_statements")
      .select("*")
      .eq("id", statementId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !statement) {
      return { success: false, error: "Statement not found" };
    }

    // Delete existing entries
    await supabase
      .from("income_entries")
      .delete()
      .eq("statement_id", statementId)
      .eq("user_id", user.id);

    // Re-parse CSV
    const csvContent = (statement.raw_payload as { csvContent: string })
      .csvContent;
    const parseResult = await parseCSV(csvContent);

    if (!parseResult.success) {
      return { success: false, error: "Failed to re-parse CSV" };
    }

    // Create new income entries
    const entries = parseResult.entries.map((entry) => ({
      user_id: user.id,
      statement_id: statementId,
      source_type: entry.source_type,
      amount: entry.amount,
      period_start: entry.period_start.toISOString(),
      period_end: entry.period_end.toISOString(),
      notes: entry.notes,
    }));

    const { error: entriesError } = await supabase
      .from("income_entries")
      .insert(entries);

    if (entriesError) {
      return { success: false, error: "Failed to create income entries" };
    }

    // Update statement count
    await supabase
      .from("raw_statements")
      .update({ parsed_entries_count: entries.length })
      .eq("id", statementId);

    revalidatePath(ROUTES.STATEMENTS);
    revalidatePath(ROUTES.INCOME);
    revalidatePath(ROUTES.DASHBOARD);

    return { success: true, data: { entriesCreated: entries.length } };
  } catch (error) {
    console.error("Error in reprocessStatement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
