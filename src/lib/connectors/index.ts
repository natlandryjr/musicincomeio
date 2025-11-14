import type { Connector } from "./types";

import { GmailConnector } from "./providers/gmail";
import { PlaidConnector } from "./providers/plaid";
import { YouTubeConnector } from "./providers/youtube";

export const connectors = {
  gmail: new GmailConnector(),
  youtube: new YouTubeConnector(),
  plaid: new PlaidConnector(),
} satisfies Record<string, Connector>;

export type SupportedProvider = keyof typeof connectors;


