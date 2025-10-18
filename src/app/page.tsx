import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import Logout from "./logout";

const Page = async () => {
  await requireAuth();
  const data = await caller.getUsers();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen min-w-screen gap-y-6 p-10">
      <h1 className="text-3xl font-bold">Welcome!</h1>
      <div>{JSON.stringify(data, null, 2)}</div>
      <Logout />
    </div>
  );
};

export default Page;
