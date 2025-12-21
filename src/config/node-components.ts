import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";
import { InitialNode } from "@/components/initial-node";
import { HttpRequestNode } from "@/features/executions/components/http-request/http-request-node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/manual-trigger-node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/google-form-node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/stripe-node";
import { DisplayNode } from "@/features/executions/components/display/display-node";
import { GeminiNode } from "@/features/executions/components/gemini/gemini-node";
import { OpenAINode } from "@/features/executions/components/openai/openai-node";
import { AnthropicNode } from "@/features/executions/components/anthropic/anthropic-node";
import { DeepseekNode } from "@/features/executions/components/deepseek/deepseek-node";
import { GrokNode } from "@/features/executions/components/grok/grok-node";
import { DiscordNode } from "@/features/executions/components/discord/discord-node";
import { SlackNode } from "@/features/executions/components/slack/slack-node";
import { WhatsAppNode } from "@/features/executions/components/whatsapp/whatsapp-node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.DISPLAY]: DisplayNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAINode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.DEEPSEEK]: DeepseekNode,
  [NodeType.GROK]: GrokNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
  [NodeType.WHATSAPP]: WhatsAppNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
