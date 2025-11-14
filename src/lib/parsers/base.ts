/**
 * Base CSV parser interface
 * All distributor-specific parsers implement this interface
 */

export type ParsedRow = {
  source_type: string;
  amount: number;
  period_start: Date;
  period_end: Date;
  notes?: string;
  raw_data?: Record<string, unknown>;
};

export type ParseResult = {
  success: boolean;
  entries: ParsedRow[];
  errors: Array<{
    row: number;
    error: string;
    rawRow?: unknown;
  }>;
  metadata: {
    parser: string;
    totalRows: number;
    successfulRows: number;
    failedRows: number;
  };
};

export interface CSVParser {
  /**
   * Unique identifier for this parser
   */
  readonly id: string;

  /**
   * Human-readable name
   */
  readonly name: string;

  /**
   * Detect if this parser can handle the given CSV data
   * Should check headers, content patterns, etc.
   */
  canParse(csvContent: string, headers: string[]): boolean;

  /**
   * Parse the CSV content into standardized income entries
   */
  parse(csvContent: string): Promise<ParseResult>;
}

/**
 * Base parser class with common utilities
 */
export abstract class BaseCSVParser implements CSVParser {
  abstract readonly id: string;
  abstract readonly name: string;

  abstract canParse(csvContent: string, headers: string[]): boolean;
  abstract parse(csvContent: string): Promise<ParseResult>;

  /**
   * Parse CSV string into rows
   */
  protected parseCSV(csvContent: string): string[][] {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    return lines.map((line) => {
      // Simple CSV parsing (handles quoted fields)
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());

      return result;
    });
  }

  /**
   * Parse date string to Date object
   * Handles common date formats
   */
  protected parseDate(dateStr: string): Date {
    // Try ISO format first (YYYY-MM-DD)
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try MM/DD/YYYY
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      date = new Date(
        parseInt(parts[2]),
        parseInt(parts[0]) - 1,
        parseInt(parts[1])
      );
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try M/D/YYYY
    if (parts.length === 3) {
      date = new Date(
        parseInt(parts[2]),
        parseInt(parts[0]) - 1,
        parseInt(parts[1])
      );
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    throw new Error(`Invalid date format: ${dateStr}`);
  }

  /**
   * Parse amount string to number
   * Handles currency symbols, commas, etc.
   */
  protected parseAmount(amountStr: string): number {
    // Remove currency symbols, commas, spaces
    const cleaned = amountStr
      .replace(/[$€£¥,\s]/g, "")
      .replace(/[()]/g, "-") // Handle negative amounts in parentheses
      .trim();

    const amount = parseFloat(cleaned);

    if (isNaN(amount)) {
      throw new Error(`Invalid amount: ${amountStr}`);
    }

    return amount;
  }

  /**
   * Map source type to standardized format
   */
  protected mapSourceType(source: string): string {
    const normalized = source.toLowerCase().trim();

    if (
      normalized.includes("stream") ||
      normalized.includes("spotify") ||
      normalized.includes("apple music")
    ) {
      return "streaming";
    }
    if (normalized.includes("soundexchange")) {
      return "soundexchange";
    }
    if (
      normalized.includes("pro") ||
      normalized.includes("ascap") ||
      normalized.includes("bmi") ||
      normalized.includes("sesac")
    ) {
      return "pro";
    }
    if (normalized.includes("mlc") || normalized.includes("mechanical")) {
      return "mlc";
    }
    if (normalized.includes("youtube")) {
      return "youtube";
    }
    if (normalized.includes("neighbour") || normalized.includes("ppl")) {
      return "neighbouring";
    }
    if (normalized.includes("sync")) {
      return "sync";
    }

    return "streaming"; // Default
  }
}
