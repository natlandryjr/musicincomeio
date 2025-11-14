import { connectors } from "@/lib/connectors";
import type { SupportedProvider } from "@/lib/connectors";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function runSyncForAccount(accountId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: account,
    error: accountError,
  } = await supabase
    .from("external_accounts")
    .select("id, user_id, provider")
    .eq("id", accountId)
    .single<{ id: string; user_id: string; provider: string }>();

  if (accountError || !account) {
    throw accountError ?? new Error("Account not found");
  }

  const provider = account.provider as SupportedProvider;
  const connector = connectors[provider];
  if (!connector) {
    throw new Error(`No connector for provider ${account.provider}`);
  }

  const {
    data: job,
    error: jobError,
  } = await supabase
    .from("sync_jobs")
    .insert({
      user_id: account.user_id,
      account_id: account.id,
      provider,
      job_type: "auto",
      status: "running",
    })
    .select("id")
    .single<{ id: string }>();

  if (jobError || !job) {
    throw jobError ?? new Error("Failed to create sync job");
  }

  const jobId = job.id;

  try {
    const result = await connector.sync(account.id, account.user_id);
    await supabase
      .from("sync_jobs")
      .update({
        finished_at: new Date().toISOString(),
        status: "success",
        items_fetched: result.items,
      })
      .eq("id", jobId);
    return result.items;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await supabase
      .from("sync_jobs")
      .update({
        finished_at: new Date().toISOString(),
        status: "failed",
        message,
      })
      .eq("id", jobId);
    throw error;
  }
}


