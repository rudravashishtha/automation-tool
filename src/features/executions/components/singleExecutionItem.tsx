"use client";

import { useState } from "react";
import Link from "next/link";
import { useSuspenseExecution } from "../hooks/use-executions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStatusIcon } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase().concat(status.slice(1).toLowerCase());

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const [showStackTrace, setShowStackTrace] = useState(false);

  const { data: execution } = useSuspenseExecution(executionId);

  const {
    inngestEventId,
    workflow,
    startedAt: executionStartedAt,
    completedAt: executionCompletedAt,
    status,
    error,
    errorStack,
    output,
  } = execution;

  const startedAt = new Date(executionStartedAt);
  const completedAt = executionCompletedAt
    ? new Date(executionCompletedAt)
    : null;

  const duration = completedAt
    ? Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)
    : null;

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">{getStatusIcon(status)}</div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{formatStatus(status)}</CardTitle>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {formatStatus(status)}
              </span>
            </div>

            <CardDescription className="mt-1">
              Execution for{" "}
              <span className="font-medium text-foreground">
                {workflow.name}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
          <div>
            <p className="text-muted-foreground">Workflow</p>

            <div className="flex items-center gap-1">
              <Link
                href={`/workflows/${workflow.id}`}
                className="font-medium text-primary hover:underline"
              >
                {workflow.name}
              </Link>

              <Link
                href={`/workflows/${workflow.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <ExternalLinkIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium">{formatStatus(status)}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Started</p>
            <p>{formatDistanceToNow(startedAt, { addSuffix: true })}</p>
          </div>

          {completedAt && (
            <div>
              <p className="text-muted-foreground">Completed</p>
              <p>{formatDistanceToNow(completedAt, { addSuffix: true })}</p>
            </div>
          )}

          {duration !== null && (
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p>{duration}s</p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground">Event ID</p>
            <p className="font-mono text-xs break-all">{inngestEventId}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-900 mb-2">Error</p>
            <p className="font-mono text-sm text-red-800">{error}</p>

            {errorStack && (
              <Collapsible
                open={showStackTrace}
                onOpenChange={setShowStackTrace}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 px-0 text-red-900 hover:bg-transparent"
                  >
                    {showStackTrace ? "Hide" : "Show"} stack trace
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-red-100 p-3 text-xs text-red-800">
                    {errorStack}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {output && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Output</p>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(output, undefined, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
