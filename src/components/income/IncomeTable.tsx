"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { IncomeRow } from "./IncomeManager";

const LABELS: Record<string, string> = {
  streaming: "Streaming",
  soundexchange: "SoundExchange",
  pro: "PRO",
  mlc: "MLC",
  youtube: "YouTube",
  neighbouring: "Neighbouring",
  sync: "Sync",
};

export default function IncomeTable({
  rows,
  onDelete,
  busy,
}: {
  rows: IncomeRow[];
  onDelete: (id: string) => Promise<void>;
  busy?: boolean;
}) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-panel/60 px-6 py-12 text-center text-sm text-muted">
        <Trash2 className="h-6 w-6 text-muted" aria-hidden="true" />
        <p>No income entries yet. Add your first statement to unlock charts.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-panel/90 backdrop-blur">
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3 text-right" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={index % 2 === 0 ? "bg-panel/70" : "bg-panel/40"}
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {LABELS[row.source_type] ?? row.source_type}
                </td>
                <td className="px-4 py-3 text-secondary">
                  ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-muted">
                  {row.period_start} → {row.period_end}
                </td>
                <td className="px-4 py-3 text-muted">
                  {row.notes ? row.notes : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger/10"
                    onClick={() => onDelete(row.id)}
                    disabled={busy}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


