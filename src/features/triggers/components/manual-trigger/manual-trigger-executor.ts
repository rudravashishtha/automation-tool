import type { NodeExecutor } from "@/features/executions/types";

type ManualTriggerData = Record<string, unknown>;

export const ManualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  // TODO: Publish loadind state for manual trigger

  const result = await step.run("manual-trigger", async () => context);

  // TODO: Publish "success/failure" state for manual trigger

  return result;
};
