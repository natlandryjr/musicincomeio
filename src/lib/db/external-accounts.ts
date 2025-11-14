import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * External account type from database
 */
export type ExternalAccount = {
  id: string;
  user_id: string;
  provider: string;
  provider_account_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  scope: string;
  label: string;
  updated_at: string;
};

/**
 * Get all external accounts for a user
 */
export async function getExternalAccounts(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("external_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching external accounts:", error);
    throw new Error("Failed to fetch external accounts");
  }

  return data as ExternalAccount[];
}

/**
 * Get external account by provider
 */
export async function getExternalAccountByProvider(
  userId: string,
  provider: string
) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("external_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();

  if (error) {
    console.error("Error fetching external account:", error);
    throw new Error("Failed to fetch external account");
  }

  return data as ExternalAccount | null;
}

/**
 * Check if user has connected a specific provider
 */
export async function hasConnectedProvider(userId: string, provider: string) {
  const account = await getExternalAccountByProvider(userId, provider);
  return account !== null;
}

/**
 * Get Gmail account for user (if connected)
 */
export async function getGmailAccount(userId: string) {
  return getExternalAccountByProvider(userId, "gmail");
}
