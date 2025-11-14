import type { UserProfile } from "@/lib/db/users";
import type { IncomeEntry } from "@/lib/db/income";
import { SOURCE_TYPES, getSourceMetadata } from "@/lib/constants";

/**
 * Missing money estimate for a specific source
 */
export type MissingMoneyEstimate = {
  source: string;
  sourceName: string;
  estimatedAnnual: number;
  confidence: number; // 0-100
  confidenceLabel: "High" | "Medium" | "Low";
  priority: "critical" | "high" | "medium" | "low";
  reason: string;
  actionUrl?: string;
  actionLabel?: string;
};

/**
 * Complete missing money analysis
 */
export type MissingMoneyAnalysis = {
  totalEstimated: number;
  estimates: MissingMoneyEstimate[];
  hasCollectedIncome: boolean;
  hasTrendData: boolean;
  trends: {
    source: string;
    hasDropoff: boolean;
    dropoffPercentage?: number;
    lastAmount?: number;
  }[];
};

/**
 * Analyze user's missing money opportunities
 */
export async function analyzeMissingMoney(
  profile: UserProfile,
  incomeEntries: IncomeEntry[]
): Promise<MissingMoneyAnalysis> {
  const estimates: MissingMoneyEstimate[] = [];

  // Analyze which sources user is collecting from
  const collectedSources = new Set(incomeEntries.map((e) => e.source_type));

  // PRO Analysis (ASCAP, BMI, SESAC)
  if (profile.writes_own_songs && !collectedSources.has("pro")) {
    estimates.push(
      estimatePRO(profile.monthly_streams, incomeEntries, collectedSources)
    );
  }

  // MLC (Mechanical Licensing Collective) Analysis
  if (profile.writes_own_songs && !collectedSources.has("mlc")) {
    estimates.push(
      estimateMLC(profile.monthly_streams, incomeEntries, collectedSources)
    );
  }

  // SoundExchange Analysis
  if (!collectedSources.has("soundexchange")) {
    estimates.push(
      estimateSoundExchange(
        profile.monthly_streams,
        incomeEntries,
        collectedSources
      )
    );
  }

  // YouTube Content ID Analysis
  if (!collectedSources.has("youtube")) {
    estimates.push(
      estimateYouTube(profile.monthly_streams, incomeEntries, collectedSources)
    );
  }

  // Neighbouring Rights Analysis
  if (!collectedSources.has("neighbouring")) {
    estimates.push(
      estimateNeighbouringRights(
        profile.monthly_streams,
        incomeEntries,
        collectedSources
      )
    );
  }

  // Analyze trends (income dropoffs)
  const trends = analyzeTrends(incomeEntries);

  // Filter out low-value estimates
  const significantEstimates = estimates.filter(
    (e) => e.estimatedAnnual >= 10 || e.confidence >= 70
  );

  // Sort by priority and amount
  significantEstimates.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff =
      priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.estimatedAnnual - a.estimatedAnnual;
  });

  const totalEstimated = significantEstimates.reduce(
    (sum, e) => sum + e.estimatedAnnual,
    0
  );

  return {
    totalEstimated,
    estimates: significantEstimates,
    hasCollectedIncome: collectedSources.size > 0,
    hasTrendData: incomeEntries.length >= 3,
    trends,
  };
}

/**
 * Estimate PRO (Performing Rights Organization) royalties
 */
function estimatePRO(
  monthlyStreams: number,
  entries: IncomeEntry[],
  collected: Set<string>
): MissingMoneyEstimate {
  // Estimate: ~$0.25-0.50 per 1000 streams annually
  const baseRate = 0.35;
  const annual = (monthlyStreams / 1000) * baseRate * 12;

  // Confidence based on activity level
  let confidence = 0;
  if (monthlyStreams > 100_000) confidence = 90;
  else if (monthlyStreams > 50_000) confidence = 80;
  else if (monthlyStreams > 20_000) confidence = 70;
  else if (monthlyStreams > 10_000) confidence = 60;
  else confidence = 40;

  // If collecting from streaming, boost confidence
  if (collected.has("streaming")) confidence += 10;

  const priority =
    annual > 500 ? "critical" : annual > 200 ? "high" : annual > 50 ? "medium" : "low";

  return {
    source: "pro",
    sourceName: "PRO (ASCAP/BMI/SESAC)",
    estimatedAnnual: Math.round(annual),
    confidence: Math.min(100, confidence),
    confidenceLabel: confidence >= 70 ? "High" : confidence >= 50 ? "Medium" : "Low",
    priority,
    reason:
      "You write your own songs, so you're entitled to performance royalties when your music is played publicly",
    actionUrl: "https://www.ascap.com/join",
    actionLabel: "Register with ASCAP",
  };
}

/**
 * Estimate MLC (Mechanical Licensing Collective) royalties
 */
function estimateMLC(
  monthlyStreams: number,
  entries: IncomeEntry[],
  collected: Set<string>
): MissingMoneyEstimate {
  // Estimate: ~$0.0006-0.0009 per stream
  const baseRate = 0.0007;
  const annual = monthlyStreams * baseRate * 12;

  let confidence = 0;
  if (monthlyStreams > 50_000) confidence = 85;
  else if (monthlyStreams > 20_000) confidence = 75;
  else if (monthlyStreams > 10_000) confidence = 65;
  else if (monthlyStreams > 5_000) confidence = 55;
  else confidence = 35;

  if (collected.has("streaming")) confidence += 10;

  const priority =
    annual > 300 ? "critical" : annual > 100 ? "high" : annual > 30 ? "medium" : "low";

  return {
    source: "mlc",
    sourceName: "MLC (Mechanical Rights)",
    estimatedAnnual: Math.round(annual),
    confidence: Math.min(100, confidence),
    confidenceLabel: confidence >= 70 ? "High" : confidence >= 50 ? "Medium" : "Low",
    priority,
    reason:
      "The MLC collects mechanical royalties from streaming services. Many artists miss this revenue stream.",
    actionUrl: "https://www.themlc.com/signup",
    actionLabel: "Register with MLC",
  };
}

/**
 * Estimate SoundExchange royalties
 */
function estimateSoundExchange(
  monthlyStreams: number,
  entries: IncomeEntry[],
  collected: Set<string>
): MissingMoneyEstimate {
  // Estimate: ~$0.001-0.003 per stream from digital radio
  const baseRate = 0.002;
  const annual = monthlyStreams * baseRate * 12;

  let confidence = 0;
  if (monthlyStreams > 100_000) confidence = 75;
  else if (monthlyStreams > 50_000) confidence = 65;
  else if (monthlyStreams > 20_000) confidence = 55;
  else if (monthlyStreams > 10_000) confidence = 45;
  else confidence = 25;

  const priority =
    annual > 400 ? "high" : annual > 100 ? "medium" : "low";

  return {
    source: "soundexchange",
    sourceName: "SoundExchange",
    estimatedAnnual: Math.round(annual),
    confidence: Math.min(100, confidence),
    confidenceLabel: confidence >= 70 ? "High" : confidence >= 50 ? "Medium" : "Low",
    priority,
    reason:
      "SoundExchange collects royalties from internet radio (Pandora, SiriusXM, etc.)",
    actionUrl: "https://www.soundexchange.com/artist-copyright-owner/registering",
    actionLabel: "Register with SoundExchange",
  };
}

/**
 * Estimate YouTube Content ID royalties
 */
function estimateYouTube(
  monthlyStreams: number,
  entries: IncomeEntry[],
  collected: Set<string>
): MissingMoneyEstimate {
  // YouTube Content ID is harder to estimate, use conservative figure
  let annual = 0;
  let confidence = 0;

  if (monthlyStreams > 100_000) {
    annual = 300;
    confidence = 60;
  } else if (monthlyStreams > 50_000) {
    annual = 150;
    confidence = 50;
  } else if (monthlyStreams > 20_000) {
    annual = 75;
    confidence = 40;
  } else {
    annual = 25;
    confidence = 25;
  }

  const priority = annual > 200 ? "medium" : "low";

  return {
    source: "youtube",
    sourceName: "YouTube Content ID",
    estimatedAnnual: annual,
    confidence,
    confidenceLabel: confidence >= 70 ? "High" : confidence >= 50 ? "Medium" : "Low",
    priority,
    reason:
      "If your music appears in user-generated YouTube videos, Content ID can collect royalties",
    actionUrl: "https://www.youtube.com/intl/en-GB/creators/support-resources/content-id/",
    actionLabel: "Learn about Content ID",
  };
}

/**
 * Estimate Neighbouring Rights royalties
 */
function estimateNeighbouringRights(
  monthlyStreams: number,
  entries: IncomeEntry[],
  collected: Set<string>
): MissingMoneyEstimate {
  // International collection, harder to estimate
  let annual = 0;
  let confidence = 0;

  if (monthlyStreams > 200_000) {
    annual = 500;
    confidence = 65;
  } else if (monthlyStreams > 100_000) {
    annual = 250;
    confidence = 55;
  } else if (monthlyStreams > 50_000) {
    annual = 125;
    confidence = 45;
  } else {
    annual = 50;
    confidence = 30;
  }

  const priority = annual > 300 ? "medium" : "low";

  return {
    source: "neighbouring",
    sourceName: "Neighbouring Rights (International)",
    estimatedAnnual: annual,
    confidence,
    confidenceLabel: confidence >= 70 ? "High" : confidence >= 50 ? "Medium" : "Low",
    priority,
    reason:
      "If your music is played internationally (radio, TV, clubs), you may be entitled to neighbouring rights",
    actionUrl: "https://www.ppluk.com/i-am-a/performer/",
    actionLabel: "Learn about PPL/PRS",
  };
}

/**
 * Analyze income trends to detect dropoffs
 */
function analyzeTrends(entries: IncomeEntry[]): MissingMoneyAnalysis["trends"] {
  if (entries.length < 3) return [];

  const trends: MissingMoneyAnalysis["trends"] = [];

  // Group by source
  const bySource = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.source_type]) acc[entry.source_type] = [];
      acc[entry.source_type].push(entry);
      return acc;
    },
    {} as Record<string, IncomeEntry[]>
  );

  // Analyze each source for dropoffs
  for (const [source, sourceEntries] of Object.entries(bySource)) {
    if (sourceEntries.length < 3) continue;

    // Sort by date
    const sorted = sourceEntries.sort(
      (a, b) =>
        new Date(b.period_start).getTime() - new Date(a.period_start).getTime()
    );

    const recent = sorted.slice(0, 2);
    const older = sorted.slice(2, 5);

    const recentAvg =
      recent.reduce((sum, e) => sum + e.amount, 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + e.amount, 0) / older.length;

    if (olderAvg > 0) {
      const dropoffPercentage = ((olderAvg - recentAvg) / olderAvg) * 100;

      if (dropoffPercentage > 20) {
        trends.push({
          source,
          hasDropoff: true,
          dropoffPercentage: Math.round(dropoffPercentage),
          lastAmount: sorted[0].amount,
        });
      }
    }
  }

  return trends;
}
