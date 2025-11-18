import { channel, topic } from "@inngest/realtime";

export const OPENAI_EXECUTION_CHANNEL_NAME = "openai-execution";

export const openaiChannel = channel(OPENAI_EXECUTION_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
