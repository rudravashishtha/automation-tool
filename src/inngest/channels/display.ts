import { channel, topic } from "@inngest/realtime";

export const DISPLAY_EXECUTION_CHANNEL_NAME = "display-execution";

export const displayChannel = channel(DISPLAY_EXECUTION_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
    displayData?: unknown;
    error?: string;
  }>()
);