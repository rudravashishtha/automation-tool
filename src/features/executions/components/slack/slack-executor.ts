import { decode } from "html-entities";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { slackChannel } from "@/inngest/channels/slack";
import type { NodeExecutor } from "@/features/executions/types";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const SlackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.content) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Slack Node: User Prompt is missing!`);
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const decodedContent = decode(rawContent);

  try {
    const result = await step.run("slack-webhook", async () => {
      if (!data.webhookUrl) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError(`Slack Node: Webhook URL is missing!`);
      }

      await ky.post(data.webhookUrl, {
        json: {
          content: decodedContent,
        },
      });

      if (!data.variableName) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError(`Slack Node: Variable name is missing!`);
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: decodedContent,
        },
      };
    });

    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
