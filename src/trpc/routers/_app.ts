import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ ctx }) => {
    const { auth } = ctx;

    return prisma.user.findMany({
      where: {
        id: auth?.user?.id,
      },
    });
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
