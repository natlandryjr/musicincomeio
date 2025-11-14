import { redirect } from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MissingMoneyCard } from "@/components/missing-money";
import { analyzeMissingMoney } from "@/lib/missing-money/detector";
import type { UserProfile } from "@/lib/db/users";
import type { IncomeEntry } from "@/lib/db/income";

export const runtime = "nodejs";

const SOURCE_LABELS: Record<string, string> = {
  streaming: "Streaming",
  pro: "Performance (PRO)",
  mlc: "Mechanical (MLC)",
  youtube: "YouTube / Content ID",
  soundexchange: "SoundExchange",
  neighbouring: "Neighbouring Rights",
  sync: "Sync Licensing",
};

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/(auth)/sign-in");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single<UserProfile>();

  const { data: entries } = await supabase
    .from("income_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("period_start", { ascending: false })
    .returns<IncomeEntry[]>();

  const incomeEntries = entries ?? [];

  const now = new Date();
  const last30 = new Date();
  last30.setDate(now.getDate() - 30);

  let totalIncome = 0;
  let last30Income = 0;
  const bySource: Record<string, number> = {};

  for (const entry of incomeEntries) {
    const amount = Number(entry.amount ?? 0);
    totalIncome += amount;

    const periodEnd = new Date(entry.period_end);
    if (periodEnd >= last30) {
      last30Income += amount;
    }

    const key = entry.source_type ?? "other";
    bySource[key] = (bySource[key] ?? 0) + amount;
  }

  const sourceBreakdown = Object.entries(bySource)
    .map(([key, value]) => ({
      key,
      label: SOURCE_LABELS[key] ?? key,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const recentEntries = incomeEntries.slice(0, 5);

  // Analyze missing money opportunities
  const missingMoneyAnalysis = profile
    ? await analyzeMissingMoney(profile, incomeEntries)
    : null;

  return (
    <AppShell
      title="Dashboard"
      user={{
        name: profile?.artist_name ?? null,
        email: user.email ?? null,
        plan: profile?.subscription_tier ?? null,
      }}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/10 to-secondary/5 p-4">
            <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">
              Lifetime music income tracked
            </div>
            <div className="mb-1 text-3xl font-bold">
              {formatCurrency(totalIncome)}
            </div>
            <div className="text-xs text-gray-500">
              Sum of all imported statements
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
            <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">
              Last 30 days
            </div>
            <div className="mb-1 text-3xl font-bold">
              {formatCurrency(last30Income)}
            </div>
            <div className="text-xs text-gray-500">
              Based on period end dates
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
            <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">
              Sources tracked
            </div>
            <div className="mb-1 text-3xl font-bold">
              {sourceBreakdown.length}
            </div>
            <div className="text-xs text-gray-500">
              Streaming, PRO, MLC, YouTube, and more
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Income by source</h2>
            </div>
            {sourceBreakdown.length === 0 ? (
              <div className="text-xs text-gray-500">
                No income entries found yet. Run a Gmail sync or add manual income to see your
                breakdown.
              </div>
            ) : (
              <div className="space-y-2">
                {sourceBreakdown.map((source) => (
                  <div
                    key={source.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-secondary" />
                      <span>{source.label}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(source.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent entries</h2>
            </div>
            {recentEntries.length === 0 ? (
              <div className="text-xs text-gray-500">
                No income entries yet. Once you import statements, the latest entries will appear
                here.
              </div>
            ) : (
              <div className="space-y-2">
                {recentEntries.map((entry, index) => (
                  <div
                    key={`${entry.source_type}-${entry.period_start}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {SOURCE_LABELS[entry.source_type] ?? entry.source_type}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {formatDate(entry.period_start)} – {formatDate(entry.period_end)}
                      </span>
                      {entry.notes ? (
                        <span className="max-w-[220px] truncate text-[11px] text-gray-500">
                          {entry.notes}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-right font-semibold">
                      {formatCurrency(Number(entry.amount ?? 0))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Missing Money Detector */}
        {missingMoneyAnalysis && (
          <MissingMoneyCard analysis={missingMoneyAnalysis} />
        )}

        <div className="text-xs text-gray-500">
          Want to see everything in detail? Go to the{" "}
          <a href="/income" className="text-secondary underline underline-offset-2">
            Income page
          </a>{" "}
          to view or edit all imported entries.
        </div>
      </div>
    </AppShell>
  );
}

