import { z } from "zod";

/**
 * Statement source providers
 */
export const statementProviderSchema = z.enum([
  "gmail",
  "google_drive",
  "dropbox",
  "onedrive",
  "manual_upload",
]);

/**
 * Statement source systems
 */
export const sourceSystemSchema = z.enum([
  "email_csv",
  "api",
  "manual",
  "upload",
]);

/**
 * Raw statement creation schema
 */
export const createStatementSchema = z.object({
  provider: statementProviderSchema,
  source_system: sourceSystemSchema,
  raw_payload: z.record(z.string(), z.unknown()),
  label: z.string().optional(),
  file_name: z.string().optional(),
  file_size: z.number().min(1).int().optional(),
  parsed_entries_count: z.number().min(0).int().optional(),
});

/**
 * CSV row schema for parsing
 */
export const csvRowSchema = z.object({
  source_type: z.string(),
  amount: z.string().or(z.number()),
  period_start: z.string(),
  period_end: z.string(),
  notes: z.string().optional(),
  // Allow additional fields for distributor-specific data
}).passthrough();

/**
 * Parsed statement result
 */
export const parsedStatementSchema = z.object({
  statement_id: z.string().uuid(),
  entries: z.array(
    z.object({
      source_type: z.string(),
      amount: z.number().positive(),
      period_start: z.date(),
      period_end: z.date(),
      notes: z.string().optional(),
    })
  ),
  errors: z.array(
    z.object({
      row: z.number(),
      error: z.string(),
    })
  ),
});

// Type exports
export type StatementProvider = z.infer<typeof statementProviderSchema>;
export type SourceSystem = z.infer<typeof sourceSystemSchema>;
export type CreateStatement = z.infer<typeof createStatementSchema>;
export type CSVRow = z.infer<typeof csvRowSchema>;
export type ParsedStatement = z.infer<typeof parsedStatementSchema>;
