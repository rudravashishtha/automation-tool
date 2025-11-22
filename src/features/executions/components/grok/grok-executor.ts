import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { grokChannel } from "@/inngest/channels/grok";
import { createXai } from "@ai-sdk/xai";
import type { NodeExecutor } from "@/features/executions/types";
import { AVAILABLE_MODELS } from "./grok-dialog";
import type { Model } from "./grok-node";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type GrokData = {
  model?: Model;
  userPrompt?: string;
  systemPrompt?: string;
  variableName?: string;
};

export const GrokExecutor: NodeExecutor<GrokData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    grokChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      grokChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Grok Node: Variable name is missing!`);
  }

  if (!data.model) {
    await publish(
      grokChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Grok Node: Model is missing!`);
  }

  if (!data.userPrompt) {
    await publish(
      grokChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(`Grok Node: User Prompt is missing!`);
  }

  // TODO: Throw if credential not found

  const compiledUserPrompt = Handlebars.compile(data.userPrompt)(context);

  const compiledSystemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  // TODO: Fetch credentail
  const credentialValue = process.env.GROK_API_KEY!;
  const grokInstance = createXai({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap("grok-generate-text", generateText, {
      model: grokInstance(data.model || AVAILABLE_MODELS[0]),
      system: compiledSystemPrompt,
      prompt: compiledUserPrompt,
    });

    const content = steps[0].content[0];
    const text = content.type === "text" ? content : "";

    await publish(
      grokChannel().status({
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
      grokChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
