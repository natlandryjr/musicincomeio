import type { Connector, SyncResult } from "../types";

export class PlaidConnector implements Connector {
  readonly provider = "plaid" as const;

  async sync(accountId: string, userId: string): Promise<SyncResult> {
    throw new Error("PlaidConnector not implemented");
  }
}

