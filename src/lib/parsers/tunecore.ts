import { BaseCSVParser, type ParseResult, type ParsedRow } from "./base";

/**
 * TuneCore CSV parser
 * Handles TuneCore earnings statements
 *
 * Expected format:
 * - Headers: Period, Store, Song, ISRC, Territory, Net Revenue
 */
export class TuneCoreParser extends BaseCSVParser {
  readonly id = "tunecore";
  readonly name = "TuneCore";

  canParse(csvContent: string, headers: string[]): boolean {
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());

    return (
      normalizedHeaders.includes("period") &&
      normalizedHeaders.includes("store") &&
      (normalizedHeaders.includes("net revenue") ||
        normalizedHeaders.includes("revenue"))
    );
  }

  async parse(csvContent: string): Promise<ParseResult> {
    const rows = this.parseCSV(csvContent);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const entries: ParsedRow[] = [];
    const errors: ParseResult["errors"] = [];

    // Find column indices
    const periodIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("period")
    );
    const storeIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("store")
    );
    const revenueIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("revenue")
    );
    const songIdx = headers.findIndex((h) => h.toLowerCase().includes("song"));

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      try {
        const period = row[periodIdx];
        const store = row[storeIdx];
        const revenueStr = row[revenueIdx];
        const song = row[songIdx] || "Unknown Track";

        // Parse amount
        const amount = this.parseAmount(revenueStr);

        // Skip zero amounts
        if (amount === 0) {
          continue;
        }

        // Parse period (format: "Q1 2024" or "2024-01" or "Jan 2024")
        let period_start: Date;
        let period_end: Date;

        if (period.includes("Q")) {
          // Quarterly format: "Q1 2024"
          const match = period.match(/Q(\d) (\d{4})/);
          if (match) {
            const quarter = parseInt(match[1]);
            const year = parseInt(match[2]);
            const startMonth = (quarter - 1) * 3;
            period_start = new Date(year, startMonth, 1);
            period_end = new Date(year, startMonth + 3, 0);
          } else {
            throw new Error(`Invalid period format: ${period}`);
          }
        } else if (period.match(/^\d{4}-\d{2}$/)) {
          // YYYY-MM format
          const [year, month] = period.split("-").map(Number);
          period_start = new Date(year, month - 1, 1);
          period_end = new Date(year, month, 0);
        } else {
          // Try to parse as month name
          period_start = new Date(period);
          period_end = new Date(
            period_start.getFullYear(),
            period_start.getMonth() + 1,
            0
          );
        }

        entries.push({
          source_type: this.mapSourceType(store),
          amount,
          period_start,
          period_end,
          notes: `${store} - ${song}`,
          raw_data: {
            store,
            song,
            period,
          },
        });
      } catch (error) {
        errors.push({
          row: i + 2,
          error: error instanceof Error ? error.message : "Unknown error",
          rawRow: row,
        });
      }
    }

    return {
      success: errors.length === 0,
      entries,
      errors,
      metadata: {
        parser: this.name,
        totalRows: dataRows.length,
        successfulRows: entries.length,
        failedRows: errors.length,
      },
    };
  }
}
