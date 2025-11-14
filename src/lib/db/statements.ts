import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Raw statement type from database
 */
export type RawStatement = {
  id: string;
  user_id: string;
  provider: string;
  source_system: string;
  raw_payload: Record<string, unknown>;
  label: string;
  file_name?: string;
  file_size?: number;
  parsed_entries_count?: number;
  created_at: string;
};

/**
 * Get all statements for a user
 */
export async function getStatements(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("raw_statements")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching statements:", error);
    throw new Error("Failed to fetch statements");
  }

  return data as RawStatement[];
}

/**
 * Get a single statement by ID
 */
export async function getStatementById(id: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("raw_statements")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching statement:", error);
    throw new Error("Failed to fetch statement");
  }

  return data as RawStatement;
}

/**
 * Get income entries for a specific statement
 */
export async function getEntriesByStatement(statementId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("income_entries")
    .select("*")
    .eq("statement_id", statementId)
    .eq("user_id", userId)
    .order("period_start", { ascending: false });

  if (error) {
    console.error("Error fetching entries by statement:", error);
    throw new Error("Failed to fetch entries");
  }

  return data;
}

/**
 * Get statement count for user
 */
export async function getStatementCount(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { count, error } = await supabase
    .from("raw_statements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error counting statements:", error);
    return 0;
  }

  return count || 0;
}
