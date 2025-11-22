"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../components/base-execution-node";
import { useNodeStatus } from "../hooks/use-node-status";
import type { LucideIcon } from "lucide-react";

export interface AINodeConfig<TData extends Record<string, unknown> = Record<string, unknown>, TFormValues = any> {
  type: string;
  name: string;
  icon: LucideIcon | string;
  logo?: string;
  channelName: string;
  fetchToken: () => Promise<any>;
  dialogComponent: React.ComponentType<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: TFormValues) => void;
    defaultValues?: TData;
    nodeId?: string;
  }>;
  getDescription: (data: TData) => string;
  getDefaultValues?: () => TFormValues;
}

export function createAINode<TData extends Record<string, unknown> = Record<string, unknown>, TFormValues = any>(
  config: AINodeConfig<TData, TFormValues>
) {
  const AINodeComponent = memo((props: NodeProps<Node<TData>>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const { data: nodeData, id } = props;

    const nodeStatus = useNodeStatus({
      nodeId: id,
      channel: config.channelName,
      topic: "status",
      refreshToken: config.fetchToken,
    });

    const description = config.getDescription(nodeData);

    const handleOpenSettings = () => {
      setDialogOpen(true);
    };

    const handleSubmit = (values: TFormValues) => {
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

    const DialogComponent = config.dialogComponent;

    return (
      <>
        <DialogComponent
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
          nodeId={id}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon={config.logo || config.icon}
          name={config.name}
          description={description}
          status={nodeStatus}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  });

  AINodeComponent.displayName = `${config.name}Node`;
  return AINodeComponent;
}

export function createAIExecutor<TData = any>(
  config: {
    channelName: string;
    execute: (data: TData, context: any) => Promise<any>;
    onSuccess?: (result: any, data: TData) => any;
    onError?: (error: any, data: TData) => void;
  }
) {
  return async ({ nodeId, data, context, step, publish }: any) => {
    await publish({
      channel: config.channelName,
      topic: "status",
      data: { nodeId, status: "loading" },
    });

    try {
      const result = await step.run(`${config.channelName}-execute`, async () => 
        config.execute(data, context)
      );

      await publish({
        channel: config.channelName,
        topic: "status", 
        data: { nodeId, status: "success" },
      });

      return config.onSuccess ? config.onSuccess(result, data) : result;
    } catch (error) {
      await publish({
        channel: config.channelName,
        topic: "status",
        data: { nodeId, status: "error" },
      });
      
      if (config.onError) {
        config.onError(error, data);
      }
      throw error;
    }
  };
}