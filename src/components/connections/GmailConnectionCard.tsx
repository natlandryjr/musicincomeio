"use client";

import { useState } from "react";

type GmailAccount = {
  provider_account_id: string;
  label: string | null;
};

export default function GmailConnectionCard({ account }: { account: GmailAccount | null }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSync() {
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/sync/gmail", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Sync failed");
      }
      setMessage(`Imported ${data.imported} income entries from Gmail.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-panel/90 p-5">
      <h2 className="mb-2 text-lg font-semibold">Gmail (Statements)</h2>
      <p className="mb-3 text-sm text-muted">
        Connect Gmail to automatically fetch royalty statement CSVs and import them into your income
        dashboard.
      </p>

      {account ? (
        <div className="space-y-3">
          <div className="text-sm text-secondary">Connected as {account.provider_account_id}</div>
          <button
            onClick={runSync}
            disabled={loading}
            className="inline-flex items-center rounded-xl bg-secondary px-4 py-2 font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Syncing…" : "Run Gmail Sync"}
          </button>
          {message && (
            <div className="rounded-xl border border-emerald-700 bg-emerald-900/40 px-3 py-2 text-xs text-emerald-300">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-danger/60 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}
        </div>
      ) : (
        <a
          href="/api/oauth/google/start"
          className="inline-flex items-center rounded-xl bg-secondary px-4 py-2 font-semibold text-black"
        >
          Connect Gmail
        </a>
      )}
    </div>
  );
}


