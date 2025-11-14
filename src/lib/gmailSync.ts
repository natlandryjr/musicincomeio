import { parse } from "csv-parse/sync";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

async function refreshGmailAccessToken(accountId: string): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const { data: account, error: accountError } = await supabase
    .from("external_accounts")
    .select("refresh_token")
    .eq("id", accountId)
    .single<{ refresh_token: string | null }>();

  if (accountError || !account) {
    throw new Error("Gmail account not found for refresh.");
  }

  if (!account.refresh_token) {
    throw new Error("No refresh_token stored for this Gmail account.");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: account.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    console.error("Gmail token refresh error:", text);
    throw new Error("Failed to refresh Gmail access token.");
  }

  const tokens = await tokenResponse.json();

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  const { error: updateError } = await supabase
    .from("external_accounts")
    .update({
      access_token: tokens.access_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId);

  if (updateError) {
    console.error("Failed to update refreshed token:", updateError);
    throw new Error("Failed to persist refreshed Gmail token.");
  }

  return tokens.access_token as string;
}

async function gmailFetchWithRefresh(
  accountId: string,
  accessToken: string,
  input: string,
  init?: RequestInit
): Promise<{ res: Response; accessToken: string }> {
  let res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    console.warn("Gmail returned 401, refreshing token...");
    const newToken = await refreshGmailAccessToken(accountId);
    res = await fetch(input, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${newToken}`,
      },
    });
    return { res, accessToken: newToken };
  }

  return { res, accessToken };
}

export async function syncGmailForUser(userId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: accounts,
    error: accountError,
  } = await supabase
    .from("external_accounts")
    .select("id, provider, access_token, provider_account_id, expires_at")
    .eq("user_id", userId)
    .eq("provider", "gmail");

  if (accountError) throw accountError;
  if (!accounts?.length) {
    throw new Error("No Gmail account connected.");
  }

  let totalInserted = 0;

  for (const account of accounts) {
    const accountId = account.id as string;
    let accessToken = account.access_token as string | null;
    const expiresAt = account.expires_at ? new Date(account.expires_at) : null;

    const now = new Date();
    if (!accessToken || (expiresAt && expiresAt.getTime() < now.getTime() - 60_000)) {
      accessToken = await refreshGmailAccessToken(accountId);
    }

    const query = [
      "newer_than:90d",
      "(",
      '"statement" OR "royalties" OR "royalty statement" OR "payment advice"',
      'OR "DistroKid" OR "TuneCore" OR "CD Baby" OR "SoundExchange"',
      'OR "ASCAP" OR "BMI" OR "SESAC" OR "MLC"',
      ")",
      "has:attachment",
    ].join(" ");

    const { res: listResponse, accessToken: listToken } = await gmailFetchWithRefresh(
      accountId,
      accessToken!,
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`
    );
    accessToken = listToken;

    if (!listResponse.ok) {
      const text = await listResponse.text();
      throw new Error(`Gmail list error: ${text}`);
    }

    const list = (await listResponse.json()) as { messages?: { id: string }[] };
    if (!list.messages?.length) continue;

    for (const meta of list.messages) {
      const { res: messageResponse, accessToken: messageToken } = await gmailFetchWithRefresh(
        accountId,
        accessToken!,
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${meta.id}?format=full`
      );
      accessToken = messageToken;

      if (!messageResponse.ok) continue;
      const message = await messageResponse.json();

      const parts = (message.payload?.parts ?? []) as unknown[];
      if (!parts.length) continue;

      const headers = message.payload?.headers ?? [];
      const fromHeader = headers.find((header: { name: string }) => header.name === "From")?.value;
      const subjectHeader = headers.find((header: { name: string }) => header.name === "Subject")?.value;

      for (const part of parts as Array<{
        filename?: string;
        mimeType?: string;
        body?: { attachmentId?: string };
      }>) {
        if (
          part.filename &&
          (part.filename.endsWith(".csv") || part.mimeType === "text/csv") &&
          part.body?.attachmentId
        ) {
          const attachmentId = part.body.attachmentId as string;

          const { data: existing } = await supabase
            .from("raw_statements")
            .select("id")
            .eq("user_id", userId)
            .eq("provider", "gmail")
            .contains("raw_payload", { messageId: meta.id, attachmentId })
            .maybeSingle();

          if (existing) continue;

          const { res: attachmentResponse, accessToken: attachmentToken } = await gmailFetchWithRefresh(
            accountId,
            accessToken!,
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${meta.id}/attachments/${attachmentId}`
          );
          accessToken = attachmentToken;

          if (!attachmentResponse.ok) continue;
          const attachment = await attachmentResponse.json();
          const data = attachment.data as string | undefined;
          if (!data) continue;

          const csvText = Buffer.from(data, "base64").toString("utf8");

          let records: Record<string, unknown>[];
          try {
            records = parse(csvText, {
              columns: true,
              skip_empty_lines: true,
              trim: true,
            });
          } catch (error) {
            console.error("CSV parse error for", part.filename, error);
            continue;
          }

          if (!records.length) continue;

          const first = records[0];
          if (
            !(
              "source_type" in first &&
              "amount" in first &&
              "period_start" in first &&
              "period_end" in first
            )
          ) {
            console.warn("CSV does not match template, skipping:", part.filename);
            continue;
          }

          const { data: raw, error: rawError } = await supabase
            .from("raw_statements")
            .insert({
              user_id: userId,
              provider: "gmail",
              source_system: "email_csv",
              raw_payload: {
                messageId: meta.id,
                attachmentId,
                filename: part.filename,
                from: fromHeader,
                subject: subjectHeader,
              },
            })
            .select("id")
            .single<{ id: string }>();

          if (rawError || !raw) {
            console.error("raw_statements insert error:", rawError);
            continue;
          }

          const payload = [];
          for (const row of records) {
            const sourceType = String(row.source_type || "").toLowerCase();
            const amount = Number(row.amount ?? 0);
            const periodStart = String(row.period_start || "").slice(0, 10);
            const periodEnd = String(row.period_end || "").slice(0, 10);
            const notes =
              row.notes && String(row.notes).trim().length
                ? String(row.notes).trim()
                : null;

            if (!sourceType || !periodStart || !periodEnd) continue;
            if (!Number.isFinite(amount)) continue;

            payload.push({
              user_id: userId,
              statement_id: raw.id,
              source_type: sourceType,
              amount,
              period_start: periodStart,
              period_end: periodEnd,
              notes,
            });
          }

          if (!payload.length) continue;

          const { error: insertError } = await supabase
            .from("income_entries")
            .insert(payload);
          if (insertError) {
            console.error("income_entries insert error:", insertError);
            continue;
          }

          totalInserted += payload.length;
        }
      }
    }
  }

  return totalInserted;
}



