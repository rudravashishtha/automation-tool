import Handlebars from "handlebars";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import prisma from "@/lib/db";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { openaiChannel } from "@/inngest/channels/openai";
import { AVAILABLE_MODELS } from "./openai-dialog";
import type { Model } from "./openai-node";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type OpenAIData = {
  model?: Model;
  userPrompt?: string;
  systemPrompt?: string;
  variableName?: string;
  credentialId?: string;
};

export const OpenAIExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    openaiChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`OpenAI Node: Variable name is missing!`);
  }

  if (!data.credentialId) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`OpenAI Node: Credential is missing!`);
  }

  if (!data.model) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`OpenAI Node: Model is missing!`);
  }

  if (!data.userPrompt) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`OpenAI Node: User Prompt is missing!`);
  }

  const compiledUserPrompt = Handlebars.compile(data.userPrompt)(context);

  const compiledSystemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({ where: { id: data.credentialId } });
  });

  if (!credential) {
    throw new NonRetriableError(`OpenAI Node: Credential not found!`);
  }

  const openaiInstance = createOpenAI({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openaiInstance(data.model || AVAILABLE_MODELS[0]),
      system: compiledSystemPrompt,
      prompt: compiledUserPrompt,
    });

    const content = steps[0].content[0];
    const text = content.type === "text" ? content : "";

    await publish(
      openaiChannel().status({
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
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
