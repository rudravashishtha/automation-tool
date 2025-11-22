// import { createAINode } from "../../lib/ai-node-factory";
// import { createAIDialog } from "../../lib/ai-provider-factory";
// import { getSubscriptionToken } from "@inngest/realtime";
// import { inngest } from "@/inngest/client";
// import { channel, topic } from "@inngest/realtime";

// // Example: Creating a new AI provider using the factory

// const PROVIDER_CONFIG = {
//   name: "Claude",
//   type: "ANTHROPIC",
//   logo: "/logos/anthropic.svg",
//   models: [
//     "claude-3-sonnet-20240229",
//     "claude-3-opus-20240229",
//     "claude-3-haiku-20240307",
//   ],
//   defaultModel: "claude-3-sonnet-20240229",
//   credentialType: "ANTHROPIC",
// };

// // Create the channel
// export const ANTHROPIC_EXECUTION_CHANNEL_NAME = "anthropic-execution";
// export const anthropicChannel = channel(
//   ANTHROPIC_EXECUTION_CHANNEL_NAME
// ).addTopic(
//   topic("status").type<{
//     nodeId: string;
//     status: "loading" | "success" | "error";
//   }>()
// );

// // Create actions
// export async function fetchAnthropicRealtimeToken() {
//   const token = await getSubscriptionToken(inngest, {
//     channel: anthropicChannel(),
//     topics: ["status"],
//   });
//   return token;
// }

// // Create dialog
// export const AnthropicDialog = createAIDialog(PROVIDER_CONFIG);

// // Create node
// export const AnthropicNode = createAINode({
//   type: "ANTHROPIC",
//   name: "Claude",
//   icon: "/logos/anthropic.svg",
//   channelName: ANTHROPIC_EXECUTION_CHANNEL_NAME,
//   fetchToken: fetchAnthropicRealtimeToken,
//   dialogComponent: AnthropicDialog,
//   getDescription: (data: any) => {
//     return data.userPrompt
//       ? `${data.model || PROVIDER_CONFIG.defaultModel}: ${data.userPrompt.slice(
//           0,
//           50
//         )}...`
//       : "Not configured";
//   },
// });

// // Create executor
// export const AnthropicExecutor = async ({
//   nodeId,
//   data,
//   context,
//   step,
//   publish,
// }: any) => {
//   await publish({
//     channel: ANTHROPIC_EXECUTION_CHANNEL_NAME,
//     topic: "status",
//     data: { nodeId, status: "loading" },
//   });

//   try {
//     // Claude-specific execution logic
//     const result = await step.run("anthropic-execute", async () => {
//       // This would contain the actual Claude API call
//       return {
//         generatedText: "Claude response would go here",
//       };
//     });

//     await publish({
//       channel: ANTHROPIC_EXECUTION_CHANNEL_NAME,
//       topic: "status",
//       data: { nodeId, status: "success" },
//     });

//     return {
//       ...context,
//       [data.variableName]: result,
//     };
//   } catch (error) {
//     await publish({
//       channel: ANTHROPIC_EXECUTION_CHANNEL_NAME,
//       topic: "status",
//       data: { nodeId, status: "error" },
//     });
//     throw error;
//   }
// };
