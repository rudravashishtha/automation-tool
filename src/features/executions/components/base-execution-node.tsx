"use client";

import { memo, type ReactNode } from "react";
import Image from "next/image";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import {
  BaseNode,
  BaseNodeContent,
} from "../../../components/react-flow/base-node";
import { BaseHandle } from "../../../components/react-flow/base-handle";
import { WorkflowNode } from "../../../components/workflow-node";
import { NodeType } from "@/generated/prisma";
import { createId } from "@paralleldrive/cuid2";
import {
  type NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { toast } from "sonner";

interface BaseExecutionNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseExecutionNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    status = "initial",
    onSettings,
    onDoubleClick,
  }: BaseExecutionNodeProps) => {
    const { getNode, setNodes, setEdges, screenToFlowPosition } =
      useReactFlow();

    const handleDelete = () => {
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.filter((node) => node.id !== id);

        if (updatedNodes.length === 0) {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const flowPosition = screenToFlowPosition({
            x: centerX + (Math.random() - 0.5) * 200,
            y: centerY + (Math.random() - 0.5) * 200,
          });

          const newInitialNode = {
            id: createId(),
            data: {},
            position: flowPosition,
            type: NodeType.INITIAL,
          };

          return [newInitialNode];
        }

        return updatedNodes;
      });

      setEdges((currentEdges) => {
        const updatedEdges = currentEdges.filter(
          (edge) => edge.source !== id && edge.target !== id
        );
        return updatedEdges;
      });
    };

    const handleCopyNode = ({
      copyData = false,
    }: { copyData?: boolean } = {}): void => {
      const selectedNode = getNode(id);

      const {
        data = {},
        type: selectedNodeType,
        position: { x, y } = {},
      } = selectedNode || {};

      if (!selectedNodeType || !x || !y) return;

      const copiedNode = {
        id: createId(),
        data: copyData ? data : {},
        position: { x: x + 80, y },
        type: selectedNodeType,
      };

      setNodes((nodes) => [...nodes, copiedNode]);
      toast.success("Copied Successfully!");
    };

    return (
      <WorkflowNode
        name={name}
        description={description}
        onDelete={handleDelete}
        onSettings={onSettings}
        onCopyNode={handleCopyNode}
      >
        <NodeStatusIndicator status={status} variant="border">
          <BaseNode status={status} onDoubleClick={onDoubleClick}>
            <BaseNodeContent>
              {typeof Icon === "string" ? (
                <Image src={Icon} alt={name} width={16} height={16} />
              ) : (
                <Icon className="size-4 text-muted-foreground" />
              )}
              {children}
              <BaseHandle
                id="target-1"
                type="target"
                position={Position.Left}
              />
              <BaseHandle
                id="source-1"
                type="source"
                position={Position.Right}
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    );
  }
);

BaseExecutionNode.displayName = "BaseExecutionNode";
