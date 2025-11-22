/**
 * AI Node Template System
 * 
 * This file provides a simple way to create new AI nodes without having to 
 * duplicate the entire folder structure. Just add your configuration here!
 */

import { NodeType } from "@/generated/prisma";
import { createAINode } from "./ai-node-factory";
// Placeholder token functions - these would be implemented for each provider
const fetchOpenAIRealtimeToken = async () => ({ token: "openai-token" });
const fetchAnthropicRealtimeToken = async () => ({ token: "anthropic-token" });
const fetchGeminiRealtimeToken = async () => ({ token: "gemini-token" });
const fetchDeepseekRealtimeToken = async () => ({ token: "deepseek-token" });
const fetchGrokRealtimeToken = async () => ({ token: "grok-token" });

// Import existing dialogs
import { OpenAIDialog } from "../components/openai/openai-dialog";
import { AnthropicDialog } from "../components/anthropic/anthropic-dialog";
import { GeminiDialog } from "../components/gemini/gemini-dialog";
import { DeepseekDialog } from "../components/deepseek/deepseek-dialog";
import { GrokDialog } from "../components/grok/grok-dialog";

export interface AINodeTemplate {
  name: string;
  type: NodeType;
  logo: string;
  models: string[];
  defaultModel: string;
  channelName: string;
  fetchToken: () => Promise<any>;
  dialogComponent: React.ComponentType<any>;
}

/**
 * To add a new AI provider, simply add an entry to this object!
 * 
 * Example:
 * ```typescript
 * COHERE: {
 *   name: "Cohere",
 *   type: NodeType.COHERE, // Add to NodeType enum first
 *   logo: "/logos/cohere.svg",
 *   models: ["command", "command-light", "command-nightly"],
 *   defaultModel: "command",
 *   channelName: "cohere-execution",
 *   fetchToken: fetchCohereRealtimeToken, // You'll need to implement this
 *   dialogComponent: CohereDialog, // You'll need to create this
 * }
 * ```
 */
export const AI_NODE_TEMPLATES: Record<string, AINodeTemplate> = {
  OPENAI: {
    name: "OpenAI",
    type: NodeType.OPENAI,
    logo: "/logos/openai.svg",
    models: [
      "gpt-3.5-turbo-0125", "gpt-3.5-turbo-1106", "gpt-3.5-turbo",
      "gpt-4", "gpt-4-0613", "gpt-4-turbo", "gpt-4o-mini", "gpt-4.1-nano",
      "gpt-4.1-mini", "gpt-4o", "chatgpt-4o-latest", "gpt-4.1", "gpt-5-mini", "gpt-5-nano"
    ],
    defaultModel: "gpt-4o",
    channelName: "openai-execution",
    fetchToken: fetchOpenAIRealtimeToken,
    dialogComponent: OpenAIDialog,
  },
  ANTHROPIC: {
    name: "Claude", 
    type: NodeType.ANTHROPIC,
    logo: "/logos/anthropic.svg",
    models: ["claude-3-sonnet-20240229", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
    defaultModel: "claude-3-sonnet-20240229",
    channelName: "anthropic-execution",
    fetchToken: fetchAnthropicRealtimeToken,
    dialogComponent: AnthropicDialog,
  },
  GEMINI: {
    name: "Gemini",
    type: NodeType.GEMINI,
    logo: "/logos/gemini.svg", 
    models: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"],
    defaultModel: "gemini-1.5-flash",
    channelName: "gemini-execution",
    fetchToken: fetchGeminiRealtimeToken,
    dialogComponent: GeminiDialog,
  },
  DEEPSEEK: {
    name: "Deepseek",
    type: NodeType.DEEPSEEK,
    logo: "/logos/deepseek.svg",
    models: ["deepseek-chat", "deepseek-coder"],
    defaultModel: "deepseek-chat",
    channelName: "deepseek-execution",
    fetchToken: fetchDeepseekRealtimeToken,
    dialogComponent: DeepseekDialog,
  },
  GROK: {
    name: "Grok",
    type: NodeType.GROK,
    logo: "/logos/grok.svg",
    models: ["grok-1", "grok-1.5"],
    defaultModel: "grok-1",
    channelName: "grok-execution",
    fetchToken: fetchGrokRealtimeToken,
    dialogComponent: GrokDialog,
  },
};

/**
 * Creates an AI node component from a template
 */
export function createAIProviderNode(template: AINodeTemplate) {
  return createAINode({
    type: template.type,
    name: template.name,
    icon: template.logo,
    channelName: template.channelName,
    fetchToken: template.fetchToken,
    dialogComponent: template.dialogComponent,
    getDescription: (data: any) => {
      return data.userPrompt 
        ? `${data.model || template.defaultModel}: ${data.userPrompt.slice(0, 50)}...`
        : "Not configured";
    }
  });
}

/**
 * Get all available AI provider nodes
 */
export function getAIProviderNodes() {
  return Object.entries(AI_NODE_TEMPLATES).map(([key, template]) => ({
    key,
    component: createAIProviderNode(template),
    ...template,
  }));
}

/**
 * Add a new AI provider to the system
 * 
 * @example
 * ```typescript
 * addAIProvider({
 *   name: "Cohere",
 *   type: NodeType.COHERE,
 *   logo: "/logos/cohere.svg",
 *   models: ["command", "command-light"],
 *   defaultModel: "command",
 *   channelName: "cohere-execution",
 *   fetchToken: fetchCohereRealtimeToken,
 *   dialogComponent: CohereDialog,
 * });
 * ```
 */
export function addAIProvider(template: AINodeTemplate) {
  const key = template.type.toString();
  AI_NODE_TEMPLATES[key] = template;
}

/**
 * Helper function to create a new AI provider with minimal setup
 * 
 * @example
 * ```typescript
 * const newProvider = createAIProvider({
 *   name: "Mistral",
 *   type: "MISTRAL",
 *   logo: "/logos/mistral.svg",
 *   models: ["mistral-tiny", "mistral-small", "mistral-medium"],
 *   defaultModel: "mistral-small",
 * });
 * ```
 */
export function createAIProvider(config: {
  name: string;
  type: string;
  logo: string;
  models: string[];
  defaultModel: string;
}) {
  // This would generate all the necessary files and register the provider
  console.log(`Creating AI provider: ${config.name}`);
  
  // In a real implementation, this would:
  // 1. Generate the node component
  // 2. Generate the dialog component  
  // 3. Generate the executor
  // 4. Generate the actions
  // 5. Generate the channel
  // 6. Register everything in the system
  
  return config;
}