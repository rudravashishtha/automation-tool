import Handlebars from "handlebars";
import { generateText } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import prisma from "@/lib/db";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { AVAILABLE_MODELS } from "./deepseek-dialog";
import type { Model } from "./deepseek-node";
import { deepseekChannel } from "@/inngest/channels/deepseek";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type DeepseekData = {
  model?: Model;
  userPrompt?: string;
  systemPrompt?: string;
  variableName?: string;
  credentialId?: string;
};

export const DeepseekExecutor: NodeExecutor<DeepseekData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    deepseekChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      deepseekChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Deepseek Node: Variable name is missing!`);
  }

  if (!data.credentialId) {
    await publish(
      deepseekChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Deepseek Node: Credential is missing!`);
  }

  if (!data.model) {
    await publish(
      deepseekChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Deepseek Node: Model is missing!`);
  }

  if (!data.userPrompt) {
    await publish(
      deepseekChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Deepseek Node: User Prompt is missing!`);
  }

  const compiledUserPrompt = Handlebars.compile(data.userPrompt)(context);

  const compiledSystemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });
  });

  if (!credential) {
    throw new NonRetriableError(`Deepseek Node: Credential not found!`);
  }

  const deepseekInstance = createDeepSeek({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap(
      "deepseek-generate-text",
      generateText,
      {
        model: deepseekInstance(data.model || AVAILABLE_MODELS[0]),
        system: compiledSystemPrompt,
        prompt: compiledUserPrompt,
      }
    );

    const content = steps[0].content[0];
    const text = content.type === "text" ? content : "";

    await publish(
      deepseekChannel().status({
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
      deepseekChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
