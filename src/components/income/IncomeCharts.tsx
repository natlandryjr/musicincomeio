"use client";

import { useMemo } from "react";
import type { TooltipProps } from "recharts";
import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import type { IncomeRow } from "./IncomeManager";

const SOURCE_SHORT: Record<string, string> = {
  streaming: "Streaming",
  soundexchange: "SndEx",
  pro: "PRO",
  mlc: "MLC",
  youtube: "YouTube",
  neighbouring: "Nbr",
  sync: "Sync",
};

function monthKey(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function IncomeCharts({
  rows,
  grandTotal,
}: {
  rows: IncomeRow[];
  grandTotal: number;
}) {
  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.source_type, (map.get(row.source_type) ?? 0) + row.amount);
    }
    return Array.from(map.entries()).map(([source, total]) => ({
      name: SOURCE_SHORT[source] ?? source,
      key: source,
      value: Number(total.toFixed(2)),
    }));
  }, [rows]);

  const lineData = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      const key = monthKey(row.period_start);
      map.set(key, (map.get(key) ?? 0) + row.amount);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, total]) => ({ month, total: Number(total.toFixed(2)) }));
  }, [rows]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/60 bg-panel/80 p-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">By source</h2>
            <p className="text-xs text-muted">
              Distribution of recorded income. Total logged {formatCurrency(grandTotal)}.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {pieData.map((slice) => (
            <Badge key={slice.key} variant="outline" className="gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {slice.name}
            </Badge>
          ))}
        </div>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label />
              <ReTooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-panel/80 p-5 backdrop-blur">
        <h2 className="text-xl font-semibold">Monthly trend</h2>
        <p className="text-xs text-muted">
          Sum of all sources per statement period.
        </p>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                tickLine={false}
                axisLine={false}
              />
              <ReTooltip content={<LineTooltip />} />
              <Line type="monotone" dataKey="total" stroke="currentColor" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function PieTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload as { name: string; value: number };
  return (
    <div className="rounded-xl border border-border/60 bg-panel/80 px-3 py-2 text-xs text-foreground shadow-lg">
      <div className="font-semibold">{name}</div>
      <div className="text-muted">{formatCurrency(value)}</div>
    </div>
  );
}

function LineTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const { payload: point } = payload[0];
  return (
    <div className="rounded-xl border border-border/60 bg-panel/80 px-3 py-2 text-xs text-foreground shadow-lg">
      <div className="font-semibold">{point.month}</div>
      <div className="text-muted">{formatCurrency(point.total)}</div>
    </div>
  );
}


