import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { updateUserProfile } from "./db";
import { forestRouter } from "./routers/forest";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(180), email: z.string().email().max(320) })).mutation(({ ctx, input }) => updateUserProfile(ctx.user.openId, input)),
  }),
  forest: forestRouter,
});

export type AppRouter = typeof appRouter;
