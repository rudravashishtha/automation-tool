"use server";

import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { displayChannel } from "@/inngest/channels/display";

export type DisplayToken = Realtime.Token<typeof displayChannel, ["status"]>;

export async function fetchDisplayRealtimeToken(): Promise<DisplayToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: displayChannel(),
    topics: ["status"],
  });

  return token;
}