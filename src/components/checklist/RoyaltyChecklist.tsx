"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Globe2,
  Headphones,
  Mic2,
  Music4,
  Radio,
  Waves,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

type SourceType =
  | "streaming"
  | "soundexchange"
  | "pro"
  | "mlc"
  | "youtube"
  | "neighbouring"
  | "sync";

type Status = "collecting" | "not_registered" | "unknown";

type SourceRow = {
  id: string;
  source_type: SourceType;
  status: Status;
};

const SOURCE_LABELS: Record<SourceType, string> = {
  streaming: "Streaming (distributor)",
  soundexchange: "SoundExchange",
  pro: "PRO (ASCAP/BMI/SESAC)",
  mlc: "Mechanical (The MLC)",
  youtube: "YouTube Content ID",
  neighbouring: "Neighbouring Rights",
  sync: "Sync Licensing",
};

const SOURCE_ICONS: Record<SourceType, React.ComponentType<{ className?: string }>> = {
  streaming: Headphones,
  soundexchange: Radio,
  pro: Mic2,
  mlc: Building2,
  youtube: Waves,
  neighbouring: Globe2,
  sync: Music4,
};

const ORDER: SourceType[] = [
  "streaming",
  "soundexchange",
  "pro",
  "mlc",
  "youtube",
  "neighbouring",
  "sync",
];

const STATUS_OPTIONS: { value: Status; label: string; helper: string }[] = [
  { value: "collecting", label: "Collecting", helper: "Payouts confirmed" },
  { value: "not_registered", label: "Not registered", helper: "Needs action" },
  { value: "unknown", label: "Not sure", helper: "We’ll help you check" },
];

export default function RoyaltyChecklist() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [rows, setRows] = useState<SourceRow[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setErrorMsg(null);
      setLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        setErrorMsg("Please sign in to view your checklist.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("royalty_sources")
        .select("id, source_type, status")
        .eq("user_id", user.id);

      if (queryError) {
        setErrorMsg(queryError.message);
        setLoading(false);
        return;
      }

      let current = (data ?? []) as SourceRow[];

      if (!current.length) {
        const seeds = ORDER.map((source) => ({
          user_id: user.id,
          source_type: source,
          status: "unknown" as Status,
        }));

        const { error: seedError } = await supabase.from("royalty_sources").upsert(seeds);
        if (seedError) {
          setErrorMsg(seedError.message);
          setLoading(false);
          return;
        }

        const reFetch = await supabase
          .from("royalty_sources")
          .select("id, source_type, status")
          .eq("user_id", user.id);

        current = (reFetch.data ?? []) as SourceRow[];
      }

      current.sort((a, b) => ORDER.indexOf(a.source_type) - ORDER.indexOf(b.source_type));

      if (!active) return;
      setRows(current);
      setLoading(false);
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function setStatus(id: string, next: Status) {
    if (!rows) return;

    const previous = rows.find((row) => row.id === id)?.status ?? "unknown";
    const sourceName = SOURCE_LABELS[rows.find((row) => row.id === id)?.source_type ?? "streaming"];

    setSavingId(id);

    setRows((prev) => prev?.map((row) => (row.id === id ? { ...row, status: next } : row)) ?? null);

    const { error } = await supabase.from("royalty_sources").update({ status: next }).eq("id", id);
    setSavingId(null);

    if (error) {
      setErrorMsg(error.message);
      setRows((prev) =>
        prev?.map((row) => (row.id === id ? { ...row, status: previous } : row)) ?? null
      );
      toast.error("We couldn’t update that status. Try again.");
      return;
    }

    toast.success(`Updated ${sourceName}`);
  }

  if (loading) {
    return (
      <Card className="animate-pulse border border-border/40">
        <CardContent className="h-48" />
      </Card>
    );
  }

  if (errorMsg) {
    return (
      <Card>
        <CardContent className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-6 text-sm text-danger">
          {errorMsg}
        </CardContent>
      </Card>
    );
  }

  if (!rows?.length) {
    return (
      <Card>
        <CardContent className="px-4 py-6 text-sm text-muted">
          No royalities sources yet—once you save your profile, we’ll prefill this checklist.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="text-2xl font-semibold">Royalty Source Checklist</CardTitle>
        <CardDescription className="text-sm text-muted">
          Keep this list updated so we can flag missing money opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row, index) => {
          const Icon = SOURCE_ICONS[row.source_type];
          const status = STATUS_OPTIONS.find((option) => option.value === row.status);

          return (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-panel/70 px-4 py-4 backdrop-blur"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-background/60 text-secondary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {SOURCE_LABELS[row.source_type]}
                    </span>
                    {status && <span className="text-xs text-muted">{status.helper}</span>}
                  </div>
                </div>
                <Badge variant={row.status === "collecting" ? "secondary" : row.status === "not_registered" ? "accent" : "muted"}>
                  {status?.label ?? "Unknown"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={row.status === option.value ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "border border-border/50",
                      row.status === option.value ? "text-black" : "text-muted"
                    )}
                    onClick={() => setStatus(row.id, option.value)}
                    disabled={savingId === row.id}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}


