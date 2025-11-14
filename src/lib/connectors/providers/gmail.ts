import type { Connector, SyncResult } from "../types";

export class GmailConnector implements Connector {
  readonly provider = "gmail" as const;

  async sync(accountId: string, userId: string): Promise<SyncResult> {
    throw new Error("GmailConnector not implemented");
  }
}

