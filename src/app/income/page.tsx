export const runtime = "nodejs";

import AppShell from "@/components/layout/AppShell";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

import IncomeManager from "./income-manager-client";

export default async function IncomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AppShell title="Income">
        <div>Please sign in to manage your income.</div>
      </AppShell>
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("artist_name")
    .eq("id", user.id)
    .single<{ artist_name: string | null }>();

  return (
    <AppShell
      title="Income"
      user={{
        name: profile?.artist_name ?? null,
        email: user.email ?? null,
        plan: null,
      }}
    >
      <p className="mb-4 text-sm text-muted">
        Add monthly earnings from each source. We’ll chart your totals and trends so you can reconcile faster.
      </p>
      <IncomeManager />
    </AppShell>
  );
}


