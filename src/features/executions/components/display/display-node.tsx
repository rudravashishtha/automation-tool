"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { DisplayDialog } from "./display-dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { DISPLAY_EXECUTION_CHANNEL_NAME } from "@/inngest/channels/display";
import { MonitorIcon } from "lucide-react";
import { fetchDisplayRealtimeToken } from "./actions";

type DisplayNodeData = {
  variableName?: string;
};

type DisplayNodeType = Node<DisplayNodeData>;

export const DisplayNode = memo((props: NodeProps<DisplayNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: nodeData, id } = props;

  const nodeStatus = useNodeStatus({
    nodeId: id,
    channel: DISPLAY_EXECUTION_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchDisplayRealtimeToken,
  });

  const description = nodeData.variableName
    ? `Display: ${nodeData.variableName}`
    : "Display connected outputs";

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <DisplayDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={id}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={MonitorIcon}
        name="Display"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        showCopyDataButton={false}
      />
    </>
  );
});

DisplayNode.displayName = "DisplayNode";
