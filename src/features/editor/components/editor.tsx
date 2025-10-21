"use client";

import { EnhancedLoadingView } from "@/components/enhanced-loading-view";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

export const EditorLoading = () => {
  return (
    <EnhancedLoadingView 
      message="Hold On! We are loading your editor." 
      showProgress={true}
      duration={5000}
    />
  );
};

export const EditorError = () => {
  return <ErrorView message="Some error occured while loading your editor." />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  return <p>{JSON.stringify(workflow, null, 2)}</p>;
};
