// import { getSubscriptionToken } from "@inngest/realtime";
// import { inngest } from "@/inngest/client";
// import { channel, topic } from "@inngest/realtime";
// import z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// export interface AIProviderConfig {
//   name: string;
//   type: string;
//   logo: string;
//   models: string[];
//   defaultModel?: string;
//   credentialType: string;
// }

// export function createAIChannel(provider: AIProviderConfig) {
//   const channelName = `${provider.type.toLowerCase()}-execution`;
//   const aiChannel = channel(channelName).addTopic(
//     topic("status").type<{
//       nodeId: string;
//       status: "loading" | "success" | "error";
//     }>()
//   );
//   return { channelName, aiChannel };
// }

// export function createAIActions(provider: AIProviderConfig) {
//   const { channelName, aiChannel } = createAIChannel(provider);
  
//   return {
//     [`fetch${provider.name}RealtimeToken`]: async () => {
//       const token = await getSubscriptionToken(inngest, {
//         channel: aiChannel(),
//         topics: ["status"],
//       });
//       return token;
//     }
//   };
// }

// export function createAIDialogSchema(provider: AIProviderConfig) {
//   return z.object({
//     model: z.string().default(provider.defaultModel || provider.models[0]),
//     systemPrompt: z.string().optional(),
//     userPrompt: z.string().min(1, "User prompt is required"),
//     variableName: z.string().min(1, "Variable name is required"),
//   });
// }

// export type AIDialogFormValues = z.infer<ReturnType<typeof createAIDialogSchema>>;

// export function createAIDialog(provider: AIProviderConfig) {
//   const formSchema = createAIDialogSchema(provider);
//   type FormValues = z.infer<typeof formSchema>;
  
//   return function AIDialog({
//     open,
//     onOpenChange,
//     onSubmit,
//     defaultValues = {},
//   }: {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     onSubmit: (values: AIDialogFormValues) => void;
//     defaultValues?: Partial<AIDialogFormValues>;
//   }) {
//     const form = useForm<FormValues>({
//       defaultValues: {
//         model: defaultValues.model || provider.defaultModel || provider.models[0],
//         systemPrompt: defaultValues.systemPrompt || "",
//         userPrompt: defaultValues.userPrompt || "",
//         variableName: defaultValues.variableName || "",
//       },
//       resolver: zodResolver(formSchema),
//     });

//     const handleSubmit = (values: FormValues) => {
//       onSubmit(values);
//       onOpenChange(false);
//     };

//     return (
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="max-h-screen overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{provider.name} Configuration</DialogTitle>
//             <DialogDescription>
//               Configure your {provider.name} AI model settings
//             </DialogDescription>
//           </DialogHeader>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="model"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Model</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select a model" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {provider.models.map((model) => (
//                           <SelectItem key={model} value={model}>
//                             {model}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="systemPrompt"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>System Prompt (Optional)</FormLabel>
//                     <Textarea
//                       placeholder="You are a helpful assistant..."
//                       className="resize-none"
//                       {...field}
//                     />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="userPrompt"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>User Prompt</FormLabel>
//                     <Textarea
//                       placeholder="Enter your prompt..."
//                       className="resize-none"
//                       {...field}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="variableName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Output Variable Name</FormLabel>
//                     <Input
//                       placeholder="myVariable"
//                       {...field}
//                     />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <DialogFooter>
//                 <Button type="submit">Save Configuration</Button>
//               </DialogFooter>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>
//     );
//   };
// }

// export function createAIExecutor(provider: AIProviderConfig) {
//   const { channelName } = createAIChannel(provider);
  
//   return async ({ nodeId, data, context, step, publish }: any) => {
//     await publish({
//       channel: channelName,
//       topic: "status",
//       data: { nodeId, status: "loading" },
//     });

//     try {
//       // This is a generic executor - specific providers should override this
//       const result = await step.run(`${provider.type}-execute`, async () => {
//         // Generic AI execution logic
//         return {
//           generatedText: `AI execution completed for ${provider.name}`,
//         };
//       });

//       await publish({
//         channel: channelName,
//         topic: "status",
//         data: { nodeId, status: "success" },
//       });

//       return {
//         ...context,
//         [data.variableName]: result,
//       };
//     } catch (error) {
//       await publish({
//         channel: channelName,
//         topic: "status",
//         data: { nodeId, status: "error" },
//       });
//       throw error;
//     }
//   };
// }