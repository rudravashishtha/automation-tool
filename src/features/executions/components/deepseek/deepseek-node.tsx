"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import {
  AVAILABLE_MODELS,
  DeepseekDialog,
  DeepseekFormValues,
} from "./deepseek-dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchADeepseekRealtimeToken } from "./actions";
import { DEEPSEEK_EXECUTION_CHANNEL_NAME } from "@/inngest/channels/deepseek";

export type Model = (typeof AVAILABLE_MODELS)[number];

type DeepseekNodeData = {
  model: Model;
  userPrompt: string;
  systemPrompt?: string;
  variableName?: string;
  credentialId?: string;
};

type DeepseekNodeType = Node<DeepseekNodeData>;

export const DeepseekNode = memo((props: NodeProps<DeepseekNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const { data: nodeData, id } = props;

  const nodeStatus = useNodeStatus({
    nodeId: id,
    channel: DEEPSEEK_EXECUTION_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchADeepseekRealtimeToken,
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

  const handleSubmit = (values: DeepseekFormValues) => {
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
      <DeepseekDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/deepseek.svg"
        name="Deepseek"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

DeepseekNode.displayName = "DeepseekNode";
