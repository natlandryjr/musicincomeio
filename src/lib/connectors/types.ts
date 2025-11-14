export type SyncResult = { items: number; raw?: unknown[] };

export interface Connector {
  /** provider id must match provider_type enum */
  readonly provider: "gmail" | "google_drive" | "youtube" | "plaid" | "dropbox" | "onedrive";
  /** Kick off a sync for this account, return items fetched */
  sync(accountId: string, userId: string): Promise<SyncResult>;
}


