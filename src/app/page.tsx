import { getQueryClient, trpc } from "@/trpc/server";
import Client from "./client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

const Page = async () => {
  const queryCleint = getQueryClient();

  void queryCleint.prefetchQuery(trpc.getUsers.queryOptions());

  return (
    <div>
      <HydrationBoundary state={dehydrate(queryCleint)}>
        <Client />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
