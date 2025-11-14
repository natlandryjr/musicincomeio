"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SourceType =
  | "streaming"
  | "soundexchange"
  | "pro"
  | "mlc"
  | "youtube"
  | "neighbouring"
  | "sync";

const SOURCE_LABELS: Record<SourceType, string> = {
  streaming: "Streaming (via distributor)",
  soundexchange: "SoundExchange",
  pro: "PRO (ASCAP/BMI/SESAC)",
  mlc: "Mechanical (The MLC)",
  youtube: "YouTube Content ID",
  neighbouring: "Neighbouring Rights",
  sync: "Sync Licensing",
};

export default function IncomeForm({
  saving,
  onCreate,
}: {
  saving: boolean;
  onCreate: (payload: {
    source_type: SourceType;
    amount: number;
    period_start: string;
    period_end: string;
    notes: string | null;
  }) => Promise<void>;
}) {
  const [source, setSource] = useState<SourceType>("streaming");
  const [amount, setAmount] = useState<string>("");
  const [periodStart, setPeriodStart] = useState<string>("");
  const [periodEnd, setPeriodEnd] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!periodStart || !periodEnd) {
      toastWarning();
      return;
    }

    await onCreate({
      source_type: source,
      amount: Number(amount) || 0,
      period_start: periodStart,
      period_end: periodEnd,
      notes: notes?.trim() ? notes.trim() : null,
    });

    setAmount("");
    setPeriodStart("");
    setPeriodEnd("");
    setNotes("");
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border/50 bg-panel/60 p-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold text-muted">Source</label>
          <Select value={source} onValueChange={(value: SourceType) => setSource(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose source" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted">Amount (USD)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <p className="mt-1 text-[11px] text-muted">Enter the gross amount for this period.</p>
        </div>
        <div className="flex items-end justify-end">
          <Button type="submit" loading={saving} className="w-full lg:w-auto">
            {saving ? "Saving" : "Add entry"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-muted">Period start</label>
          <Input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted">Period end</label>
          <Input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted">Notes</label>
        <textarea
          className="input-base h-24 resize-none"
          placeholder="Optional details (e.g., Spotify Apr statement, sync license notes)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
    </form>
  );
}

function toastWarning() {
  toast.warning("Please choose a period start and end date.");
}


