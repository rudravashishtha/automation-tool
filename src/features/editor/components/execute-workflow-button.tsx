import { Button } from "@/components/ui/button";
import { FlaskConicalIcon } from "lucide-react";
import {
  useExecuteWorkflow,
  useUpdateWorkflow,
} from "@/features/workflows/hooks/use-workflows";
import { useAtomValue } from "jotai";
import { editorAtom } from "../store/atoms";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const executeWorkflow = useExecuteWorkflow();
  const saveWorkflow = useUpdateWorkflow({ showToast: false });
  const editor = useAtomValue(editorAtom);

  const handleSaveAndExecute = async () => {
    if (!editor || !workflowId) return;

    const nodes = editor.getNodes();
    const edges = editor.getEdges();

    try {
      // Await save to complete before executing
      await saveWorkflow.mutateAsync({
        id: workflowId,
        nodes,
        edges,
      });

      // Execute the workflow only after successful save
      await executeWorkflow.mutateAsync({ id: workflowId });
    } catch (error) {
      // Handle error (optional)
      console.error("Save or execute workflow failed", error);
    }
  };

  const isAnyPending = saveWorkflow.isPending || executeWorkflow.isPending;

  return (
    <Button size="lg" disabled={isAnyPending} onClick={handleSaveAndExecute}>
      <FlaskConicalIcon className="size-4" /> Execute Workflow
    </Button>
  );
};
