"use client";

import { formatDistanceToNow } from "date-fns";
import { Execution, ExecutionStatus } from "@/generated/prisma";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useRouter } from "next/navigation";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { cn } from "@/lib/utils";
import { getStatusIcon, getStatusLabel } from "../lib/utils";

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();

  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = () => {
  const executions = useSuspenseExecutions();

  return (
    <EntityHeader
      title="Executions"
      description="View your workflow execution history"
      newButtonLabel={
        executions.isFetching ? "Refreshing…" : "Refresh Executions"
      }
      onNew={() => executions.refetch()}
      showAddIcon={false}
    />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    !!executions.data.totalPages && (
      <EntityPagination
        disabled={executions.isFetching}
        totalPages={executions.data.totalPages}
        page={executions.data.page}
        onPageChange={(page) => setParams({ ...params, page })}
      />
    )
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error loading executions..." />;
};

export const ExecutionsEmpty = () => {
  const router = useRouter();

  const handleRedirectToWorkflows = () => {
    router.push("/workflows");
  };

  return (
    <EmptyView
      onNew={handleRedirectToWorkflows}
      addNewLabel="Go to workflows"
      message="No executions found."
      messageSubtitle="Run something to see executions here."
      showAddIcon={false}
    />
  );
};

export const ExecutionItem = ({
  data,
}: {
  data: Execution & {
    workflow: {
      id: string;
      name: string;
    };
  };
}) => {
  const startedAt = new Date(data.startedAt);
  const completedAt = data.completedAt ? new Date(data.completedAt) : null;

  const duration = completedAt
    ? Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)
    : null;

  const subtitle = (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Started {formatDistanceToNow(startedAt, { addSuffix: true })}</span>
      {duration !== null && (
        <>
          <span aria-hidden>&bull;</span>
          <span>Took {duration}s</span>
        </>
      )}
    </div>
  );

  return (
    <EntityItem
      href={`executions/${data.id}`}
      title={data.workflow.name}
      subtitle={subtitle}
      image={
        <div className="size-8 rounded-full bg-muted flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }
      right={
        <span
          className={cn(
            "text-sm font-medium",
            data.status === ExecutionStatus.SUCCESS && "text-green-600",
            data.status === ExecutionStatus.FAILED && "text-red-600",
            data.status === ExecutionStatus.RUNNING && "text-blue-600"
          )}
        >
          {getStatusLabel(data.status)}
        </span>
      }
    />
  );
};
