"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export type Row = { source: string; amount: number; confidence: string; note?: string };

const CONFIDENCE_LABEL: Record<string, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const CONFIDENCE_VARIANT: Record<string, "secondary" | "accent" | "muted"> = {
  HIGH: "secondary",
  MEDIUM: "accent",
  LOW: "muted",
};

export default function MissingMoneySummary({ rows }: { rows: Row[] }) {
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const confidenceCount = rows.reduce(
    (acc, row) => ({ ...acc, [row.confidence]: (acc[row.confidence] ?? 0) + 1 }),
    {} as Record<string, number>
  );

  return (
    <Card>
      <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,240px)_1fr]">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Missing Money Detector</p>
            <h2 className="text-3xl font-semibold">
              ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h2>
            <p className="text-xs text-muted">
              Estimated unclaimed royalties per year based on your checklist and stream data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(confidenceCount).map(([confidence, count]) => (
              <Badge key={confidence} variant={CONFIDENCE_VARIANT[confidence] ?? "muted"}>
                {CONFIDENCE_LABEL[confidence] ?? confidence} confidence · {count}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-panel/60 px-4 py-6 text-sm text-muted">
              No obvious gaps detected yet. Update your checklist and monthly streams to refine the AI estimate.
            </div>
          ) : (
            <motion.ul
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-2"
            >
              {rows.map((row) => (
                <motion.li
                  key={row.source}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-panel/70 px-4 py-3 backdrop-blur"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold uppercase tracking-wide">
                      {row.source}
                    </div>
                    <Badge variant={CONFIDENCE_VARIANT[row.confidence] ?? "muted"}>
                      {CONFIDENCE_LABEL[row.confidence] ?? row.confidence}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Potential unclaimed</span>
                    <span className="text-lg font-semibold text-secondary">
                      ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}/yr
                    </span>
                  </div>
                  {row.note && <p className="text-xs text-muted">{row.note}</p>}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


