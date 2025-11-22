/**
 * Example: How to add a new AI provider using the template system
 * 
 * This file demonstrates how easy it is to add new AI providers
 * without creating a whole folder structure.
 */

import { NodeType } from "@/generated/prisma";
import { addAIProvider, createAIProviderNode } from "../lib/ai-node-templates";

// Example 1: Add a new provider like Cohere
const cohereProvider = {
  name: "Cohere",
  type: NodeType.COHERE, // You'd need to add this to the NodeType enum first
  logo: "/logos/cohere.svg",
  models: ["command", "command-light", "command-nightly"],
  defaultModel: "command",
  channelName: "cohere-execution",
  fetchToken: async () => ({ token: "cohere-token" }), // You'd implement the real token fetcher
  dialogComponent: () => null, // You'd create the actual dialog component
};

// Add the provider to the system
addAIProvider(cohereProvider);

// Create the node component
export const CohereNode = createAIProviderNode(cohereProvider);

// Example 2: Add Mistral
const mistralProvider = {
  name: "Mistral",
  type: NodeType.MISTRAL, // You'd need to add this to the NodeType enum first
  logo: "/logos/mistral.svg",
  models: ["mistral-tiny", "mistral-small", "mistral-medium"],
  defaultModel: "mistral-small",
  channelName: "mistral-execution",
  fetchToken: async () => ({ token: "mistral-token" }),
  dialogComponent: () => null,
};

addAIProvider(mistralProvider);
export const MistralNode = createAIProviderNode(mistralProvider);

// Example 3: Add a custom provider
const customProvider = {
  name: "MyCustomAI",
  type: NodeType.CUSTOM, // You'd need to add this to the NodeType enum first
  logo: "/logos/custom.svg",
  models: ["custom-model-1", "custom-model-2"],
  defaultModel: "custom-model-1",
  channelName: "custom-execution",
  fetchToken: async () => ({ token: "custom-token" }),
  dialogComponent: () => null,
};

addAIProvider(customProvider);
export const CustomNode = createAIProviderNode(customProvider);

/**
 * Complete workflow for adding a new AI provider:
 * 
 * 1. Add the new NodeType to your schema.prisma
 * 2. Create the dialog component (or reuse an existing one)
 * 3. Create the token fetcher function
 * 4. Add the provider using addAIProvider()
 * 5. Export the created node component
 * 
 * That's it! No need to create separate folders for each provider.
 */