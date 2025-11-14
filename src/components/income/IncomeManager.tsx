"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

import IncomeForm, { type SourceType } from "./IncomeForm";
import IncomeTable from "./IncomeTable";

const IncomeCharts = dynamic(() => import("./IncomeCharts"), {
  ssr: false,
  loading: () => (
    <Card className="h-72 animate-pulse">
      <CardContent className="h-full" />
    </Card>
  ),
});

export type IncomeRow = {
  id: string;
  source_type: SourceType;
  amount: number;
  period_start: string;
  period_end: string;
  notes: string | null;
};

export default function IncomeManager() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<IncomeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setLoading(true);
      setErrorMsg(null);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setErrorMsg("Please sign in to manage income.");
        setLoading(false);
        return;
      }

      if (!active) return;
      setUserId(user.id);

      const { data, error: queryError } = await supabase
        .from("income_entries")
        .select("id, source_type, amount, period_start, period_end, notes")
        .eq("user_id", user.id)
        .order("period_start", { ascending: true })
        .returns<IncomeRow[]>();

      if (queryError) {
        setErrorMsg(queryError.message);
      } else if (active) {
        setRows(data ?? []);
      }

      if (active) setLoading(false);
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function createEntry(payload: Omit<IncomeRow, "id">) {
    if (!userId) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from("income_entries")
        .insert({
          user_id: userId,
          source_type: payload.source_type,
          amount: payload.amount,
          period_start: payload.period_start,
          period_end: payload.period_end,
          notes: payload.notes,
        })
        .select("id, source_type, amount, period_start, period_end, notes")
        .returns<IncomeRow>()
        .single();

      if (error) throw error;
      if (!data) return;

      setRows((prev) => [...prev, data].sort((a, b) => a.period_start.localeCompare(b.period_start)));
      toast.success("Income entry added.");
      setShowForm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create entry.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: string) {
    setSaving(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.from("income_entries").delete().eq("id", id);
      if (error) throw error;
      setRows((prev) => prev.filter((row) => row.id !== id));
      toast.success("Entry deleted.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete entry.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const totals = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + row.amount, 0);
    return { total };
  }, [rows]);

  if (loading) {
    return (
      <Card className="space-y-4 p-6">
        <div className="h-6 w-32 rounded-full bg-border/40" />
        <div className="h-12 w-3/4 rounded-2xl bg-border/40" />
        <div className="h-64 rounded-2xl bg-border/30" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Income Overview</CardTitle>
            <CardDescription className="text-sm text-muted">
              Log statements and advances from every source to reconcile payouts.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-black">
            ${totals.total.toLocaleString(undefined, { maximumFractionDigits: 0 })} recorded
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="ghost"
            className="w-full justify-between rounded-xl border border-border/60 bg-panel/60 text-sm"
            onClick={() => setShowForm((value) => !value)}
          >
            <span>{showForm ? "Hide" : "Add income entry"}</span>
            <span className="text-muted">{showForm ? "Collapse" : "Open form"}</span>
          </Button>

          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <IncomeForm saving={saving} onCreate={createEntry} />
            </motion.div>
          )}

          {errorMsg && (
            <div className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {errorMsg}
            </div>
          )}
        </CardContent>
      </Card>

      <IncomeCharts rows={rows} grandTotal={totals.total} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Entries</CardTitle>
          <CardDescription className="text-sm text-muted">
            Export coming soon — for now you can filter and delete entries below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IncomeTable rows={rows} onDelete={deleteEntry} busy={saving} />
        </CardContent>
      </Card>
    </div>
  );
}


