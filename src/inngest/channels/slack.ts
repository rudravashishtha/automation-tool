import { channel, topic } from "@inngest/realtime";

export const SLACK_EXECUTION_CHANNEL_NAME = "slack-execution";

export const slackChannel = channel(SLACK_EXECUTION_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
