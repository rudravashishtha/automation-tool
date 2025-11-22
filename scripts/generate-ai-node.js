#!/usr/bin/env node

/**
 * AI Node Generator
 * 
 * This script generates a complete AI node implementation based on a simple configuration.
 * Usage: node generate-ai-node.js <name> <type> <logo> <models...>
 * 
 * Example: node generate-ai-node.js "Claude" "ANTHROPIC" "/logos/claude.svg" "claude-3-sonnet" "claude-3-opus"
 */

const fs = require('fs');
const path = require('path');

function toPascalCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '');
}

function generateNodeComponent(config) {
  const { name, type, logo, models, defaultModel } = config;
  const componentName = `${name}Node`;
  const dialogName = `${name}Dialog`;
  const executorName = `${name}Executor`;
  const actionsName = `fetch${name}RealtimeToken`;
  const channelName = `${type.toLowerCase()}_EXECUTION_CHANNEL_NAME`;
  
  return `"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { ${dialogName} } from "./${toPascalCase(name).toLowerCase()}-dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { ${actionsName} } from "./actions";
import { ${channelName} } from "@/inngest/channels/${type.toLowerCase()}";

type ${name}NodeData = {
  model: string;
  userPrompt: string;
  systemPrompt?: string;
  variableName?: string;
};

type ${name}NodeType = Node<${name}NodeData>;

export const ${componentName} = memo((props: NodeProps<${name}NodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const { data: nodeData, id } = props;

  const nodeStatus = useNodeStatus({
    nodeId: id,
    channel: ${channelName},
    topic: "status",
    refreshToken: ${actionsName},
  });

  const description = nodeData.userPrompt
    ? \`\${nodeData.model || '${defaultModel || models[0]}'}: \${nodeData.userPrompt.slice(0, 50)}...\`
    : "Not configured";

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: any) => {
    setNodes((currNodes) =>
      currNodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <>
      <${dialogName}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="${logo}"
        name="${name}"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

${componentName}.displayName = "${componentName}";
`;
}

function generateDialogComponent(config) {
  const { name, models, defaultModel } = config;
  const availableModels = models.map(m => `"${m}"`).join(', ');
  
  return `"use client";

import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const AVAILABLE_MODELS = [${availableModels}] as const;

export type Model = (typeof AVAILABLE_MODELS)[number];

export const formSchema = z.object({
  model: z.string().default("${defaultModel || models[0]}"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
  variableName: z.string().min(1, "Variable name is required"),
});

export type ${name}FormValues = z.infer<typeof formSchema>;

interface ${name}DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ${name}FormValues) => void;
  defaultValues?: Partial<${name}FormValues>;
}

export const ${name}Dialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: ${name}DialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      model: defaultValues.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
      variableName: defaultValues.variableName || "",
    },
    resolver: zodResolver(formSchema),
  });

  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(
    Boolean(defaultValues.systemPrompt)
  );

  // Reset form values when dialog opens with new defaults
  useEffect(() => {
    if (open)
      form.reset({
        model: defaultValues.model || AVAILABLE_MODELS[0],
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
        variableName: defaultValues.variableName || "",
      });
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myModel";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>${name} Configuration</DialogTitle>
          <DialogDescription>
            Configure your ${name} model settings
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>System Prompt</FormLabel>
                <Switch
                  checked={showSystemPrompt}
                  onCheckedChange={setShowSystemPrompt}
                />
              </div>
              {showSystemPrompt && (
                <FormField
                  control={form.control}
                  name="systemPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="You are a helpful assistant..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional system message to guide the model's behavior
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
            </FormItem>

            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your prompt..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="myModel" {...field} />
                  </FormControl>
                  <FormDescription>
                    The variable name to store the response in (e.g., {watchVariableName})
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save Configuration</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
`;
}

function generateActionsFile(config) {
  const { name, type } = config;
  const channelName = `${type.toUpperCase()}_EXECUTION_CHANNEL_NAME`;
  
  return `"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { ${type.toLowerCase()}Channel } from "@/inngest/channels/${type.toLowerCase()}";

export type ${name}Token = Realtime.Token<typeof ${type.toLowerCase()}Channel, ["status"]>;

export async function fetch${name}RealtimeToken(): Promise<${name}Token> {
  const token = await getSubscriptionToken(inngest, {
    channel: ${type.toLowerCase()}Channel(),
    topics: ["status"],
  });

  return token as ${name}Token;
}
`;
}

function generateExecutorFile(config) {
  const { name, type } = config;
  const channelName = `${type.toUpperCase()}_EXECUTION_CHANNEL_NAME`;
  
  return `import type { NodeExecutor } from "@/features/executions/types";
import { ${type.toLowerCase()}Channel } from "@/inngest/channels/${type.toLowerCase()}";

type ${name}Data = {
  model: string;
  userPrompt: string;
  systemPrompt?: string;
  variableName: string;
};

export const ${name}Executor: NodeExecutor<${name}Data> = async ({
  nodeId,
  data,
  context,
  step,
  publish,
}) => {
  await publish(
    ${type.toLowerCase()}Channel().status({
      nodeId,
      status: "loading",
    })
  );

  try {
    // TODO: Implement ${name} API call
    const result = await step.run("${type.toLowerCase()}-execute", async () => {
      // This is where you would call the actual ${name} API
      // For now, return a placeholder response
      return {
        generatedText: "${name} API response would go here",
      };
    });

    await publish(
      ${type.toLowerCase()}Channel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: result,
    };
  } catch (error) {
    await publish(
      ${type.toLowerCase()}Channel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
`;
}

function generateChannelFile(config) {
  const { type } = config;
  const channelName = `${type.toUpperCase()}_EXECUTION_CHANNEL_NAME`;
  
  return `import { channel, topic } from "@inngest/realtime";

export const ${channelName} = "${type.toLowerCase()}-execution";

export const ${type.toLowerCase()}Channel = channel(
  ${channelName}
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
`;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.error("Usage: node generate-ai-node.js <name> <type> <logo> <models...>");
    console.error("Example: node generate-ai-node.js \"Claude\" \"ANTHROPIC\" \"/logos/claude.svg\" \"claude-3-sonnet\" \"claude-3-opus\"");
    process.exit(1);
  }
  
  const [name, type, logo, ...models] = args;
  const config = { name, type, logo, models };
  
  const baseDir = path.join(__dirname, '..', 'src', 'features', 'executions', 'components', type.toLowerCase());
  
  // Create directory
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  // Generate files
  const files = [
    {
      name: `${type.toLowerCase()}-node.tsx`,
      content: generateNodeComponent(config)
    },
    {
      name: `${type.toLowerCase()}-dialog.tsx`,
      content: generateDialogComponent(config)
    },
    {
      name: 'actions.ts',
      content: generateActionsFile(config)
    },
    {
      name: `${type.toLowerCase()}-executor.ts`,
      content: generateExecutorFile(config)
    }
  ];
  
  // Write files
  files.forEach(file => {
    const filePath = path.join(baseDir, file.name);
    fs.writeFileSync(filePath, file.content);
    console.log(`✅ Generated: ${filePath}`);
  });
  
  // Generate channel file
  const channelDir = path.join(__dirname, '..', 'src', 'inngest', 'channels');
  if (!fs.existsSync(channelDir)) {
    fs.mkdirSync(channelDir, { recursive: true });
  }
  
  const channelFile = path.join(channelDir, `${type.toLowerCase()}.ts`);
  fs.writeFileSync(channelFile, generateChannelFile(config));
  console.log(`✅ Generated: ${channelFile}`);
  
  console.log(`\n🎉 Successfully generated ${name} AI node!`);
  console.log(`\nNext steps:`);
  console.log(`1. Update the executor with actual API integration`);
  console.log(`2. Add the node type to the NodeType enum in schema.prisma`);
  console.log(`3. Register the executor in executor-registry.ts`);
  console.log(`4. Add the node component to your node registry`);
}

if (require.main === module) {
  main();
}