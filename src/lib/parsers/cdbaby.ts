import { BaseCSVParser, type ParseResult, type ParsedRow } from "./base";

/**
 * CD Baby CSV parser
 * Handles CD Baby earnings statements
 *
 * Expected format:
 * - Headers: Report Date, Service, Artist, Album, Track, Quantity, Amount
 */
export class CDBabyParser extends BaseCSVParser {
  readonly id = "cdbaby";
  readonly name = "CD Baby";

  canParse(csvContent: string, headers: string[]): boolean {
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());

    return (
      (normalizedHeaders.includes("report date") ||
        normalizedHeaders.includes("date")) &&
      (normalizedHeaders.includes("service") ||
        normalizedHeaders.includes("platform")) &&
      normalizedHeaders.includes("amount")
    );
  }

  async parse(csvContent: string): Promise<ParseResult> {
    const rows = this.parseCSV(csvContent);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const entries: ParsedRow[] = [];
    const errors: ParseResult["errors"] = [];

    // Find column indices
    const dateIdx = headers.findIndex(
      (h) =>
        h.toLowerCase().includes("report date") ||
        h.toLowerCase().includes("date")
    );
    const serviceIdx = headers.findIndex(
      (h) =>
        h.toLowerCase().includes("service") ||
        h.toLowerCase().includes("platform")
    );
    const amountIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("amount")
    );
    const trackIdx = headers.findIndex((h) =>
      h.toLowerCase().includes("track")
    );

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      try {
        const dateStr = row[dateIdx];
        const service = row[serviceIdx];
        const amountStr = row[amountIdx];
        const track = row[trackIdx] || "Unknown Track";

        // Parse amount
        const amount = this.parseAmount(amountStr);

        // Skip zero amounts
        if (amount === 0) {
          continue;
        }

        // Parse date
        const date = this.parseDate(dateStr);

        // CD Baby reports are typically monthly
        const period_start = new Date(date.getFullYear(), date.getMonth(), 1);
        const period_end = new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          0
        );

        entries.push({
          source_type: this.mapSourceType(service),
          amount,
          period_start,
          period_end,
          notes: `${service} - ${track}`,
          raw_data: {
            service,
            track,
            reportDate: dateStr,
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
