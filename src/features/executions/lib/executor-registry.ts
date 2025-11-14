import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../types";
import { ManualTriggerExecutor } from "@/features/triggers/components/manual-trigger/manual-trigger-executor";
import { HttpRequestExecutor } from "../components/http-request/http-request-executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: ManualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: HttpRequestExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type ${type}`);
  }

  return executor;
};
