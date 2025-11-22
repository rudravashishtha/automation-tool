"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { AVAILABLE_MODELS, GrokDialog, GrokFormValues } from "./grok-dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchGrokRealtimeToken } from "./actions";
import { GROK_EXECUTION_CHANNEL_NAME } from "@/inngest/channels/grok";

export type Model = (typeof AVAILABLE_MODELS)[number];

type GrokNodeData = {
  model: Model;
  userPrompt: string;
  systemPrompt?: string;
  variableName?: string;
};

type GrokNodeType = Node<GrokNodeData>;

export const GrokNode = memo((props: NodeProps<GrokNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const { data: nodeData, id } = props;

  const nodeStatus = useNodeStatus({
    nodeId: id,
    channel: GROK_EXECUTION_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGrokRealtimeToken,
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

  const handleSubmit = (values: GrokFormValues) => {
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
      <GrokDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/grok.svg"
        name="Grok"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GrokNode.displayName = "GrokNode";
