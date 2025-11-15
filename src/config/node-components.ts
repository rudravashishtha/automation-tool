import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";
import { InitialNode } from "@/components/initial-node";
import { HttpRequestNode } from "@/features/executions/components/http-request/http-request-node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/manual-trigger-node";
import { GoogleFormTrigggerNode } from "@/features/triggers/components/google-form-trigger/google-form-node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigggerNode
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
