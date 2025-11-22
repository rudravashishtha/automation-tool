import { NodeType } from "@/generated/prisma";
import { createAINode } from "../lib/ai-node-factory";

export interface AIProviderDefinition {
  name: string;
  type: NodeType;
  logo: string;
  models: string[];
  defaultModel?: string;
  description: string;
  fetchToken: () => Promise<any>;
  channelName: string;
  dialogComponent: React.ComponentType<any>;
}

export const AI_PROVIDERS: Record<string, AIProviderDefinition> = {
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
    description: "OpenAI GPT models for text generation",
    fetchToken: async () => { /* implementation */ return {}; },
    channelName: "openai-execution",
    dialogComponent: () => null, // Will be set by actual implementation
  },
  ANTHROPIC: {
    name: "Claude",
    type: NodeType.ANTHROPIC,
    logo: "/logos/anthropic.svg",
    models: ["claude-3-sonnet-20240229", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
    defaultModel: "claude-3-sonnet-20240229",
    description: "Anthropic Claude models for AI conversations",
    fetchToken: async () => { /* implementation */ return {}; },
    channelName: "anthropic-execution",
    dialogComponent: () => null,
  },
  GEMINI: {
    name: "Gemini",
    type: NodeType.GEMINI,
    logo: "/logos/gemini.svg",
    models: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"],
    defaultModel: "gemini-1.5-flash",
    description: "Google Gemini models for multimodal AI",
    fetchToken: async () => { /* implementation */ return {}; },
    channelName: "gemini-execution",
    dialogComponent: () => null,
  },
  DEEPSEEK: {
    name: "Deepseek",
    type: NodeType.DEEPSEEK,
    logo: "/logos/deepseek.svg",
    models: ["deepseek-chat", "deepseek-coder"],
    defaultModel: "deepseek-chat",
    description: "Deepseek AI models for coding and chat",
    fetchToken: async () => { /* implementation */ return {}; },
    channelName: "deepseek-execution",
    dialogComponent: () => null,
  },
  GROK: {
    name: "Grok",
    type: NodeType.GROK,
    logo: "/logos/grok.svg",
    models: ["grok-1", "grok-1.5"],
    defaultModel: "grok-1",
    description: "xAI Grok models with real-time knowledge",
    fetchToken: async () => { /* implementation */ return {}; },
    channelName: "grok-execution",
    dialogComponent: () => null,
  },
};

export function createAINodeFromProvider(provider: AIProviderDefinition, dialogComponent: React.ComponentType<any>) {
  return createAINode({
    type: provider.type,
    name: provider.name,
    icon: provider.logo,
    channelName: provider.channelName,
    fetchToken: provider.fetchToken,
    dialogComponent,
    getDescription: (data: any) => {
      return data.userPrompt 
        ? `${data.model || provider.defaultModel}: ${data.userPrompt.slice(0, 50)}...`
        : "Not configured";
    }
  });
}

export function registerAIProvider(key: string, provider: AIProviderDefinition) {
  AI_PROVIDERS[key] = provider;
}

export function getAIProvider(key: string): AIProviderDefinition | undefined {
  return AI_PROVIDERS[key];
}

export function getAllAIProviders(): AIProviderDefinition[] {
  return Object.values(AI_PROVIDERS);
}