"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

const Client = () => {
  const trpc = useTRPC();
  const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions());
  return (
    <div>
      {users?.map((user: Record<string, any>) => (
        <div key={user.id}>
          <div>Name: {user.name}</div>
          <div>Email: {user.email}</div>
        </div>
      ))}
    </div>
  );
};

export default Client;
