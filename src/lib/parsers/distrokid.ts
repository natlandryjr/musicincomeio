import { BaseCSVParser, type ParseResult, type ParsedRow } from "./base";

/**
 * DistroKid CSV parser
 * Handles DistroKid earnings statements
 *
 * Expected format:
 * - Headers: Sale Month, Store, Artist, Title, ISRC, UPC, Quantity, Song/Album, Country, Earnings (USD)
 */
export class DistroKidParser extends BaseCSVParser {
  readonly id = "distrokid";
  readonly name = "DistroKid";

  canParse(csvContent: string, headers: string[]): boolean {
    // Check for DistroKid-specific headers
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());

    return (
      normalizedHeaders.includes("sale month") &&
      normalizedHeaders.includes("store") &&
      normalizedHeaders.includes("earnings (usd)")
    );
  }

  async parse(csvContent: string): Promise<ParseResult> {
    const rows = this.parseCSV(csvContent);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const entries: ParsedRow[] = [];
    const errors: ParseResult["errors"] = [];

    // Find column indices
    const saleMonthIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("sale month")
    );
    const storeIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("store")
    );
    const earningsIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("earnings")
    );
    const titleIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("title")
    );

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      try {
        const saleMonth = row[saleMonthIdx];
        const store = row[storeIdx];
        const earningsStr = row[earningsIdx];
        const title = row[titleIdx] || "Unknown Track";

        // Parse amount
        const amount = this.parseAmount(earningsStr);

        // Skip zero amounts
        if (amount === 0) {
          continue;
        }

        // Parse date (format: YYYY-MM or MM/YYYY)
        const dateParts = saleMonth.includes("/")
          ? saleMonth.split("/").reverse()
          : saleMonth.split("-");
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;

        const period_start = new Date(year, month, 1);
        const period_end = new Date(year, month + 1, 0); // Last day of month

        entries.push({
          source_type: this.mapSourceType(store),
          amount,
          period_start,
          period_end,
          notes: `${store} - ${title}`,
          raw_data: {
            store,
            title,
            saleMonth,
          },
        });
      } catch (error) {
        errors.push({
          row: i + 2, // +2 because we skipped header and are 0-indexed
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
