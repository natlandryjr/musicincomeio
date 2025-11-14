export type EstimationInput = {
  writesOwnSongs: boolean;
  monthlyStreams: number;
  soundexchangeStatus?: "collecting" | "not_registered" | "unknown";
};

export type Estimate = {
  source: "pro" | "mlc" | "soundexchange" | "youtube";
  amount: number; // USD/year
  confidence: "HIGH" | "MEDIUM" | "LOW";
  note?: string;
};

export function estimateMissingMoney(input: EstimationInput): Estimate[] {
  const { writesOwnSongs, monthlyStreams, soundexchangeStatus = "unknown" } = input;
  const out: Estimate[] = [];

  if (writesOwnSongs && monthlyStreams > 10_000) {
    const amt = (monthlyStreams / 1000) * 0.3 * 12;
    out.push({
      source: "pro",
      amount: Math.round(amt),
      confidence: monthlyStreams > 50_000 ? "HIGH" : "MEDIUM",
    });
  }

  if (writesOwnSongs && monthlyStreams > 5_000) {
    const amt = monthlyStreams * 0.0006 * 12;
    out.push({
      source: "mlc",
      amount: Math.round(amt),
      confidence: monthlyStreams > 20_000 ? "HIGH" : "MEDIUM",
    });
  }

  if (monthlyStreams > 10_000 && soundexchangeStatus !== "collecting") {
    const amt = monthlyStreams * 0.002 * 12;
    out.push({
      source: "soundexchange",
      amount: Math.round(amt),
      confidence: "MEDIUM",
    });
  }

  if (monthlyStreams > 50_000) {
    out.push({
      source: "youtube",
      amount: 125,
      confidence: "LOW",
      note: "Rough estimate ($50–$200/yr typical).",
    });
  }

  return out.sort((a, b) => b.amount - a.amount);
}


