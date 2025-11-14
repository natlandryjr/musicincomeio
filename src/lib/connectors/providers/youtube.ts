import type { Connector, SyncResult } from "../types";

export class YouTubeConnector implements Connector {
  readonly provider = "youtube" as const;

  async sync(accountId: string, userId: string): Promise<SyncResult> {
    throw new Error("YouTubeConnector not implemented");
  }
}

