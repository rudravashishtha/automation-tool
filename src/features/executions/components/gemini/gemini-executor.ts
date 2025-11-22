import Handlebars from "handlebars";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import prisma from "@/lib/db";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { geminiChannel } from "@/inngest/channels/gemini";
import { AVAILABLE_MODELS } from "./gemini-dialog";
import type { Model } from "./gemini-node";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type GeminiData = {
  model?: Model;
  userPrompt?: string;
  systemPrompt?: string;
  variableName?: string;
  credentialId?: string;
};

export const GeminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    geminiChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Gemini Node: Variable name is missing!`);
  }

  if (!data.credentialId) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Gemini Node: Credential is missing!`);
  }

  if (!data.model) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Gemini Node: Model is missing!`);
  }

  if (!data.userPrompt) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Gemini Node: User Prompt is missing!`);
  }

  const compiledUserPrompt = Handlebars.compile(data.userPrompt)(context);

  const compiledSystemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({ where: { id: data.credentialId } });
  });

  if (!credential) {
    throw new NonRetriableError(`Gemini Node: Credential not found!`);
  }

  const googleInstance = createGoogleGenerativeAI({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: googleInstance(data.model || AVAILABLE_MODELS[0]),
      system: compiledSystemPrompt,
      prompt: compiledUserPrompt,
    });

    const content = steps[0].content[0];
    const text = content.type === "text" ? content : "";

    await publish(
      geminiChannel().status({
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
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
