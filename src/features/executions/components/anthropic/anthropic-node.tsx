"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import {
  AVAILABLE_MODELS,
  AnthropicDialog,
  AnthropicFormValues,
} from "./anthropic-dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchAnthropicRealtimeToken } from "./actions";
import { ANTHROPIC_EXECUTION_CHANNEL_NAME } from "@/inngest/channels/anthropic";

export type Model = (typeof AVAILABLE_MODELS)[number];

type AnthropicNodeData = {
  model: Model;
  userPrompt: string;
  systemPrompt?: string;
  variableName?: string;
  credentialId?: string;
};

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const { data: nodeData, id } = props;

  const nodeStatus = useNodeStatus({
    nodeId: id,
    channel: ANTHROPIC_EXECUTION_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });

  const description = nodeData.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(
        0,
        50
      )}...`
    : "Not configured";

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: AnthropicFormValues) => {
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
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/anthropic.svg"
        name="Anthropic"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

AnthropicNode.displayName = "AnthropicNode";
