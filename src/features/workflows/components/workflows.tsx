"use client";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Workflow as WorkflowType } from "@/generated/prisma";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useRenameWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { WorkflowIcon } from "lucide-react";
import { WorkflowNameDialog } from "./workflow-name-dialog";

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Workflows"
    />
  );
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <EntityList
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={<WorkflowsEmpty />}
    />
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateWorkflow = () => {
    setIsDialogOpen(true);
  };

  const handleSubmitWorkflowName = (name: string) => {
    createWorkflow.mutate(
      { name },
      {
        onSuccess: (data) => {
          setIsDialogOpen(false);
          router.push(`/workflows/${data.id}`);
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreateWorkflow}
        newButtonLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
      <WorkflowNameDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitWorkflowName}
        isLoading={createWorkflow.isPending}
        title="Create New Workflow"
        description="Enter a name for your new workflow"
      />
    </>
  );
};

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams();

  return (
    !!workflows.data.totalPages && (
      <EntityPagination
        disabled={workflows.isFetching}
        totalPages={workflows.data.totalPages}
        page={workflows.data.page}
        onPageChange={(page) => setParams({ ...params, page })}
      />
    )
  );
};

export const WorkFlowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading workflows..." />;
};

export const WorkflowsError = () => {
  return <ErrorView message="Error loading workflows..." />;
};

export const WorkflowsEmpty = () => {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateWorkflow = () => {
    setIsDialogOpen(true);
  };

  const handleSubmitWorkflowName = (name: string) => {
    createWorkflow.mutate(
      { name },
      {
        onSuccess: (data) => {
          setIsDialogOpen(false);
          router.push(`/workflows/${data.id}`);
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  return (
    <>
      {modal}
      <EmptyView
        onNew={handleCreateWorkflow}
        addNewLabel="Add Workflow"
        btnDisabled={createWorkflow.isPending}
        message="No workflows have been created yet."
        messageSubtitle="Start by setting up your first workflow to begin automating your process."
      />
      <WorkflowNameDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitWorkflowName}
        isLoading={createWorkflow.isPending}
        title="Create New Workflow"
        description="Enter a name for your new workflow"
      />
    </>
  );
};

export const WorkflowItem = ({ data }: { data: WorkflowType }) => {
  const removeWorkflow = useRemoveWorkflow();
  const renameWorkflow = useRenameWorkflow();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const createdAt = new Date(data.createdAt);
  const updatedAt = new Date(data.updatedAt);
  const isUpdated = updatedAt.getTime() !== createdAt.getTime();

  const handleRemoveWorkflow = () => {
    removeWorkflow.mutate({ id: data.id });
  };

  const handleRenameWorkflow = () => {
    setIsRenameDialogOpen(true);
  };

  const handleSubmitRename = (name: string) => {
    renameWorkflow.mutate(
      { id: data.id, name },
      {
        onSuccess: () => {
          setIsRenameDialogOpen(false);
        },
      }
    );
  };

  return (
    <>
      <EntityItem
        href={`workflows/${data.id}`}
        title={data.name}
        subtitle={
          <>
            {isUpdated ? (
              <>
                Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}{" "}
                &bull; Created{" "}
                {formatDistanceToNow(createdAt, { addSuffix: true })}{" "}
              </>
            ) : (
              <>Created {formatDistanceToNow(createdAt, { addSuffix: true })}</>
            )}
          </>
        }
        image={
          <div className="size-8 flex items-center justify-center">
            <WorkflowIcon className="size-5 text-muted-foreground" />
          </div>
        }
        onRemove={handleRemoveWorkflow}
        onRename={handleRenameWorkflow}
        isRemoving={removeWorkflow.isPending}
        workflowId={data.id}
      />
      <WorkflowNameDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onSubmit={handleSubmitRename}
        isLoading={renameWorkflow.isPending}
        title="Rename Workflow"
        description="Enter a new name for your workflow"
        defaultName={data.name}
      />
    </>
  );
};
