"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { grokChannel } from "@/inngest/channels/grok";

export type GrokToken = Realtime.Token<typeof grokChannel, ["status"]>;

export async function fetchGrokRealtimeToken(): Promise<GrokToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: grokChannel(),
    topics: ["status"],
  });

  return token as GrokToken;
}
