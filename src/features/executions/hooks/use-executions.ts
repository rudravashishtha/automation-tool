import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionsParams } from "./use-executions-params";
import { Execution, ExecutionStatus } from "@/generated/prisma";

/**
 * Hook to fetch all the executions using suspense
 */

export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();

  return useSuspenseQuery(
    trpc.executions.getMany.queryOptions(params, {
      // refetchInterval: (query) => {
      //   const data = query.state.data;

      //   const hasRunning =
      //     data && data.items.some((e) => e.status === ExecutionStatus.RUNNING);

      //   return hasRunning ? 3000 : false;
      // },
      refetchOnWindowFocus: true,
    })
  );
};

/**
 * Hook to fetch a single execution using suspense
 */
export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};
