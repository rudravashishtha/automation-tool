import { decode } from "html-entities";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { discordChannel } from "@/inngest/channels/discord";
import type { NodeExecutor } from "@/features/executions/types";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const DiscordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    discordChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.content) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Discord Node: User Prompt is missing!`);
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const decodedContent = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.webhookUrl) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError(`Discord Node: Webhook URL is missing!`);
      }

      await ky.post(data.webhookUrl, {
        json: {
          content: decodedContent.slice(0, 2000),
          username,
        },
      });

      if (!data.variableName) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError(`Discord Node: Variable name is missing!`);
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: decodedContent.slice(0, 2000),
        },
      };
    });

    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
