import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../types";
import { ManualTriggerExecutor } from "@/features/triggers/components/manual-trigger/manual-trigger-executor";
import { HttpRequestExecutor } from "../components/http-request/http-request-executor";
import { GoogleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/google-form-executor";
import { StripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/stripe-executor";
import { GeminiExecutor } from "../components/gemini/gemini-executor";
import { DisplayExecutor } from "../components/display/display-executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: ManualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: HttpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerExecutor,
  [NodeType.GEMINI]: GeminiExecutor,
  [NodeType.ANTHROPIC]: GeminiExecutor, // TODO: remove this once we have a separate executor for Anthropic and OpenAI
  [NodeType.OPENAI]: GeminiExecutor, // TODO: remove this once we have a separate executor for Anthropic and OpenAI
  [NodeType.DISPLAY]: DisplayExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type ${type}`);
  }

  return executor;
};
