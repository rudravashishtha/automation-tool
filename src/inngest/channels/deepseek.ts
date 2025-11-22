import { channel, topic } from "@inngest/realtime";

export const DEEPSEEK_EXECUTION_CHANNEL_NAME = "deepseek-execution";

export const deepseekChannel = channel(
  DEEPSEEK_EXECUTION_CHANNEL_NAME
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
