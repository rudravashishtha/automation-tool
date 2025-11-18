import { channel, topic } from "@inngest/realtime";

export const GEMINI_EXECUTION_CHANNEL_NAME = "gemini-execution";

export const geminiChannel = channel(GEMINI_EXECUTION_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
