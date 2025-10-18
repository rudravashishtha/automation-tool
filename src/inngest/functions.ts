import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { inngest } from "./client";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const executeAi = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        system: "You are a helpful assistant.",
        model: google("gemini-2.5-flash"),
        prompt: "What is 2 + 2?",
      }
    );

    const { steps: openaiSteps } = await step.ai.wrap(
      "openai-generate-text",
      generateText,
      {
        system: "You are a helpful assistant.",
        model: openai("gpt-4o-mini"),
        prompt: "What is 2 + 2?",
      }
    );

    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        system: "You are a helpful assistant.",
        model: anthropic("claude-3-5-sonnet-20240620"),
        prompt: "What is 2 + 2?",
      }
    );

    return {
      geminiSteps,
      // openaiSteps,
      anthropicSteps,
    };
  }
);
