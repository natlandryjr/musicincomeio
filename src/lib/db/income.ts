import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IncomeFilters } from "@/lib/validators/income";

/**
 * Income entry type from database
 */
export type IncomeEntry = {
  id: string;
  user_id: string;
  source_type: string;
  amount: number;
  period_start: string;
  period_end: string;
  notes: string | null;
  statement_id: string | null;
  created_at: string;
};

/**
 * Get all income entries for the current user
 */
export async function getIncomeEntries(userId: string, filters?: IncomeFilters) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("income_entries")
    .select("*")
    .eq("user_id", userId)
    .order("period_start", { ascending: false });

  // Apply filters
  if (filters?.source_type) {
    query = query.eq("source_type", filters.source_type);
  }
  if (filters?.start_date) {
    query = query.gte("period_start", filters.start_date);
  }
  if (filters?.end_date) {
    query = query.lte("period_end", filters.end_date);
  }
  if (filters?.min_amount !== undefined) {
    query = query.gte("amount", filters.min_amount);
  }
  if (filters?.max_amount !== undefined) {
    query = query.lte("amount", filters.max_amount);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching income entries:", error);
    throw new Error("Failed to fetch income entries");
  }

  return data as IncomeEntry[];
}

/**
 * Get a single income entry by ID
 */
export async function getIncomeEntryById(id: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("income_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching income entry:", error);
    throw new Error("Failed to fetch income entry");
  }

  return data as IncomeEntry;
}

/**
 * Get total income for a user
 */
export async function getTotalIncome(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("income_entries")
    .select("amount")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching total income:", error);
    throw new Error("Failed to fetch total income");
  }

  return data.reduce((total, entry) => total + entry.amount, 0);
}

/**
 * Get income by source type
 */
export async function getIncomeBySource(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("income_entries")
    .select("source_type, amount")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching income by source:", error);
    throw new Error("Failed to fetch income by source");
  }

  // Aggregate by source type
  const bySource = data.reduce(
    (acc, entry) => {
      const existing = acc[entry.source_type] || 0;
      acc[entry.source_type] = existing + entry.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(bySource).map(([source, total]) => ({
    source_type: source,
    total,
  }));
}

/**
 * Get recent income entries (last N)
 */
export async function getRecentIncomeEntries(userId: string, limit = 5) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("income_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent income entries:", error);
    throw new Error("Failed to fetch recent income entries");
  }

  return data as IncomeEntry[];
}

/**
 * Get income for a specific period
 */
export async function getIncomeForPeriod(
  userId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("income_entries")
    .select("amount")
    .eq("user_id", userId)
    .gte("period_start", startDate)
    .lte("period_end", endDate);

  if (error) {
    console.error("Error fetching income for period:", error);
    throw new Error("Failed to fetch income for period");
  }

  return data.reduce((total, entry) => total + entry.amount, 0);
}

/**
 * Get monthly income trend (last N months)
 */
export async function getMonthlyIncomeTrend(userId: string, months = 12) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("income_entries")
    .select("period_start, amount")
    .eq("user_id", userId)
    .order("period_start", { ascending: true });

  if (error) {
    console.error("Error fetching monthly income trend:", error);
    throw new Error("Failed to fetch monthly income trend");
  }

  // Group by month
  const byMonth = data.reduce(
    (acc, entry) => {
      const month = new Date(entry.period_start).toISOString().slice(0, 7); // YYYY-MM
      const existing = acc[month] || 0;
      acc[month] = existing + entry.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(byMonth)
    .map(([month, total]) => ({
      month,
      total,
    }))
    .slice(-months);
}
