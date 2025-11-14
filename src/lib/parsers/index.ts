import type { CSVParser } from "./base";
import { DistroKidParser } from "./distrokid";
import { TuneCoreParser } from "./tunecore";
import { CDBabyParser } from "./cdbaby";

/**
 * Registry of all available CSV parsers
 */
export const CSV_PARSERS: CSVParser[] = [
  new DistroKidParser(),
  new TuneCoreParser(),
  new CDBabyParser(),
];

/**
 * Auto-detect which parser can handle the CSV content
 */
export function detectParser(csvContent: string): CSVParser | null {
  // Parse first line to get headers
  const firstLine = csvContent.split("\n")[0];
  const headers = firstLine.split(",").map((h) => h.trim().replace(/"/g, ""));

  // Try each parser
  for (const parser of CSV_PARSERS) {
    if (parser.canParse(csvContent, headers)) {
      return parser;
    }
  }

  return null;
}

/**
 * Parse CSV content with auto-detection
 */
export async function parseCSV(csvContent: string) {
  const parser = detectParser(csvContent);

  if (!parser) {
    throw new Error("Unable to detect CSV format. No compatible parser found.");
  }

  return parser.parse(csvContent);
}

// Re-export types
export type { CSVParser, ParseResult, ParsedRow } from "./base";
