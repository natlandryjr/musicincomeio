import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseCSV } from "@/lib/parsers";

/**
 * Process sync result type
 */
export type ProcessSyncResult = {
  success: boolean;
  statementsCreated: number;
  entriesCreated: number;
  errors: string[];
};

/**
 * Process Gmail sync results and create income entries
 */
export async function processGmailSyncResults(
  userId: string,
  messages: Array<{
    messageId: string;
    subject: string;
    from: string;
    csvContent: string;
    fileName: string;
  }>
): Promise<ProcessSyncResult> {
  const supabase = await createSupabaseServerClient();
  let statementsCreated = 0;
  let entriesCreated = 0;
  const errors: string[] = [];

  for (const message of messages) {
    try {
      // Parse CSV
      const parseResult = await parseCSV(message.csvContent);

      if (!parseResult.success || parseResult.entries.length === 0) {
        errors.push(
          `Failed to parse ${message.fileName}: ${parseResult.errors[0]?.error || "No entries found"}`
        );
        continue;
      }

      // Create statement record
      const { data: statement, error: statementError } = await supabase
        .from("raw_statements")
        .insert({
          user_id: userId,
          provider: "gmail",
          source_system: "email_csv",
          raw_payload: {
            messageId: message.messageId,
            subject: message.subject,
            from: message.from,
            csvContent: message.csvContent,
          },
          label: message.fileName,
          file_name: message.fileName,
          file_size: message.csvContent.length,
          parsed_entries_count: parseResult.entries.length,
        })
        .select("id")
        .single();

      if (statementError) {
        errors.push(`Failed to create statement for ${message.fileName}`);
        continue;
      }

      statementsCreated++;

      // Create income entries
      const entries = parseResult.entries.map((entry) => ({
        user_id: userId,
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
        errors.push(`Failed to create entries for ${message.fileName}`);
        continue;
      }

      entriesCreated += entries.length;
    } catch (error) {
      errors.push(
        `Error processing ${message.fileName}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  return {
    success: errors.length === 0,
    statementsCreated,
    entriesCreated,
    errors,
  };
}

/**
 * Check for duplicate statements to avoid re-processing
 */
export async function isStatementProcessed(
  userId: string,
  messageId: string
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("raw_statements")
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "gmail")
    .filter("raw_payload->>messageId", "eq", messageId)
    .maybeSingle();

  return !error && data !== null;
}
