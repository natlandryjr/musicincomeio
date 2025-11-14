"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createIncomeEntrySchema,
  updateIncomeEntrySchema,
  type CreateIncomeEntry,
  type UpdateIncomeEntry,
} from "@/lib/validators/income";
import { ROUTES } from "@/lib/constants";

/**
 * Server action result type
 */
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Create a new income entry
 */
export async function createIncomeEntry(
  input: CreateIncomeEntry
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate input
    const validated = createIncomeEntrySchema.parse(input);

    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Insert income entry
    const { data, error } = await supabase
      .from("income_entries")
      .insert({
        user_id: user.id,
        source_type: validated.source_type,
        amount: validated.amount,
        period_start: validated.period_start,
        period_end: validated.period_end,
        notes: validated.notes,
        statement_id: validated.statement_id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating income entry:", error);
      return { success: false, error: "Failed to create income entry" };
    }

    // Revalidate relevant pages
    revalidatePath(ROUTES.INCOME);
    revalidatePath(ROUTES.DASHBOARD);

    return { success: true, data: { id: data.id } };
  } catch (error) {
    console.error("Error in createIncomeEntry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing income entry
 */
export async function updateIncomeEntry(
  input: UpdateIncomeEntry
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = updateIncomeEntrySchema.parse(input);

    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update income entry (with RLS ensuring user owns it)
    const { error } = await supabase
      .from("income_entries")
      .update({
        source_type: validated.source_type,
        amount: validated.amount,
        period_start: validated.period_start,
        period_end: validated.period_end,
        notes: validated.notes,
      })
      .eq("id", validated.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating income entry:", error);
      return { success: false, error: "Failed to update income entry" };
    }

    // Revalidate relevant pages
    revalidatePath(ROUTES.INCOME);
    revalidatePath(ROUTES.DASHBOARD);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in updateIncomeEntry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete an income entry
 */
export async function deleteIncomeEntry(
  id: string
): Promise<ActionResult> {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete income entry (with RLS ensuring user owns it)
    const { error } = await supabase
      .from("income_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting income entry:", error);
      return { success: false, error: "Failed to delete income entry" };
    }

    // Revalidate relevant pages
    revalidatePath(ROUTES.INCOME);
    revalidatePath(ROUTES.DASHBOARD);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in deleteIncomeEntry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Bulk delete income entries
 */
export async function bulkDeleteIncomeEntries(
  ids: string[]
): Promise<ActionResult<{ deletedCount: number }>> {
  try {
    if (ids.length === 0) {
      return { success: false, error: "No entries to delete" };
    }

    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete income entries (with RLS ensuring user owns them)
    const { error, count } = await supabase
      .from("income_entries")
      .delete({ count: "exact" })
      .in("id", ids)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error bulk deleting income entries:", error);
      return { success: false, error: "Failed to delete income entries" };
    }

    // Revalidate relevant pages
    revalidatePath(ROUTES.INCOME);
    revalidatePath(ROUTES.DASHBOARD);

    return { success: true, data: { deletedCount: count || 0 } };
  } catch (error) {
    console.error("Error in bulkDeleteIncomeEntries:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
