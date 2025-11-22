import Handlebars from "handlebars";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import prisma from "@/lib/db";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { AVAILABLE_MODELS } from "./anthropic-dialog";
import type { Model } from "./anthropic-node";
import { anthropicChannel } from "@/inngest/channels/anthropic";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type AnthropicData = {
  model?: Model;
  userPrompt?: string;
  systemPrompt?: string;
  variableName?: string;
  credentialId?: string;
};

export const AnthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Anthropic Node: Variable name is missing!`);
  }

  if (!data.credentialId) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Anthropic Node: Credential is missing!`);
  }

  if (!data.model) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Anthropic Node: Model is missing!`);
  }

  if (!data.userPrompt) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Anthropic Node: User Prompt is missing!`);
  }

  const compiledUserPrompt = Handlebars.compile(data.userPrompt)(context);

  const compiledSystemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({ where: { id: data.credentialId } });
  });

  if (!credential) {
    throw new NonRetriableError(`Anthropic Node: Credential not found!`);
  }
  const anthropicInstance = createAnthropic({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropicInstance(data.model || AVAILABLE_MODELS[0]),
        system: compiledSystemPrompt,
        prompt: compiledUserPrompt,
      }
    );

    const content = steps[0].content[0];
    const text = content.type === "text" ? content : "";

    await publish(
      anthropicChannel().status({
        nodeId,
        status: "success",
      })
    );

    let finalText = text;

    if (typeof finalText === "string") {
      finalText = JSON.stringify(finalText);
      finalText = finalText.replace(/\\./g, "");
    }

    return {
      ...context,
      [data.variableName]: {
        generatedText: finalText,
      },
    };
  } catch (error) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
