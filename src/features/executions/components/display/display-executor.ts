import type { NodeExecutorParams } from "../../types";
import { displayChannel } from "@/inngest/channels/display";

export async function DisplayExecutor({
  data,
  nodeId,
  context,
  step,
  publish,
}: NodeExecutorParams) {
  await publish(
    displayChannel().status({
      nodeId,
      status: "loading",
    })
  );

  try {
    const variableName = data.variableName as string | undefined;

    const displayData = variableName ? context[variableName] : context;

    await publish(
      displayChannel().status({
        nodeId,
        status: "success",
        displayData,
      })
    );

    return context;
  } catch (error) {
    await publish(
      displayChannel().status({
        nodeId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );

    throw error;
  }
}
