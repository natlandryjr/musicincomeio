import AppShell from "@/components/layout/AppShell";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import GmailConnectionCard from "@/components/connections/GmailConnectionCard";

export const runtime = "nodejs";

export default async function ConnectionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AppShell title="Connections">
        <div>Please sign in to manage connections.</div>
      </AppShell>
    );
  }

  const { data: accounts } = await supabase
    .from("external_accounts")
    .select("provider, provider_account_id, label")
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("users")
    .select("artist_name")
    .eq("id", user.id)
    .single<{ artist_name: string | null }>();

  const gmailAccount = accounts?.find((account) => account.provider === "gmail") ?? null;

  return (
    <AppShell
      title="Connections"
      user={{
        name: profile?.artist_name ?? null,
        email: user.email ?? null,
        plan: null,
      }}
    >
      <div className="grid max-w-2xl gap-4">
        <GmailConnectionCard
          account={
            gmailAccount
              ? {
                  provider_account_id: gmailAccount.provider_account_id,
                  label: gmailAccount.label,
                }
              : null
          }
        />
      </div>
    </AppShell>
  );
}


