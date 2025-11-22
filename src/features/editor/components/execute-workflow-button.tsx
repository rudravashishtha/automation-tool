import { Button } from "@/components/ui/button";
import { FlaskConicalIcon, Loader2Icon } from "lucide-react";
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

  const handleExecuteOnly = async () => {
    if (!workflowId) return;

    try {
      await executeWorkflow.mutateAsync({ id: workflowId });
    } catch (error) {
      console.error("Execute workflow failed", error);
    }
  };

  const handleSaveAndExecute = async () => {
    if (!editor || !workflowId) return;

    const nodes = editor.getNodes();
    const edges = editor.getEdges();

    try {
      await saveWorkflow.mutateAsync({
        id: workflowId,
        nodes,
        edges,
      });

      await executeWorkflow.mutateAsync({ id: workflowId });
    } catch (error) {
      console.error("Save or execute workflow failed", error);
    }
  };

  const isSaving = saveWorkflow.isPending;
  const isExecuting = executeWorkflow.isPending;
  const isAnyPending = isSaving || isExecuting;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isAnyPending ? (
        <Button size="lg" disabled className="w-full sm:w-auto">
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          {isSaving ? "Saving..." : "Executing..."}
        </Button>
      ) : (
        <>
          <Button
            size="lg"
            variant="outline"
            disabled={!workflowId}
            onClick={handleExecuteOnly}
          >
            <FlaskConicalIcon className="mr-2 h-4 w-4" />
            Execute (last saved)
          </Button>

          <Button
            size="lg"
            disabled={!workflowId || !editor}
            onClick={handleSaveAndExecute}
          >
            <FlaskConicalIcon className="mr-2 h-4 w-4" />
            Save & Execute
          </Button>
        </>
      )}
    </div>
  );
};
