import { z } from "zod";

/**
 * Income source types matching database enum
 */
export const sourceTypeSchema = z.enum([
  "streaming",
  "soundexchange",
  "pro",
  "mlc",
  "youtube",
  "neighbouring",
  "sync",
]);

/**
 * Income entry creation schema
 */
export const createIncomeEntrySchema = z.object({
  source_type: sourceTypeSchema,
  amount: z.number().positive("Amount must be positive"),
  period_start: z.string().datetime().or(z.date()),
  period_end: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
  statement_id: z.string().uuid().optional(),
});

/**
 * Income entry update schema (all fields optional)
 */
export const updateIncomeEntrySchema = createIncomeEntrySchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Income query filters
 */
export const incomeFiltersSchema = z.object({
  source_type: sourceTypeSchema.optional(),
  start_date: z.string().datetime().or(z.date()).optional(),
  end_date: z.string().datetime().or(z.date()).optional(),
  min_amount: z.number().nonnegative().optional(),
  max_amount: z.number().nonnegative().optional(),
});

// Type exports
export type SourceType = z.infer<typeof sourceTypeSchema>;
export type CreateIncomeEntry = z.infer<typeof createIncomeEntrySchema>;
export type UpdateIncomeEntry = z.infer<typeof updateIncomeEntrySchema>;
export type IncomeFilters = z.infer<typeof incomeFiltersSchema>;
