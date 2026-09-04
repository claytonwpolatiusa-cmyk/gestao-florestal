import { COOKIE_NAME } from "@shared/const";
import { createHash, randomBytes } from "node:crypto";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createContentLead, createDelegatedCode, listActiveDelegatedCodes, revokeDelegatedCodes, updateUserProfile } from "./db";
import { forestRouter } from "./routers/forest";

export const appRouter = router({
  system: systemRouter,
  content: router({
    captureLead: publicProcedure.input(z.object({
      name: z.string().trim().min(2).max(180),
      email: z.string().email().max(320),
      whatsapp: z.string().trim().max(32).optional().nullable(),
      contentUpdatesConsent: z.literal(true),
      commercialContactConsent: z.boolean().default(false),
      source: z.string().trim().max(120).default("conteudos"),
    })).mutation(({ input }) => createContentLead(input)),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(180), email: z.string().email().max(320) })).mutation(({ ctx, input }) => updateUserProfile(ctx.user.openId, input)),
    createDelegatedCode: protectedProcedure.input(z.object({ durationHours: z.union([z.literal(4), z.literal(24), z.literal(168)]) })).mutation(async ({ ctx, input }) => { const raw = `TW-${randomBytes(4).toString("hex").toUpperCase()}`; const hash = createHash("sha256").update(raw).digest("hex"); const expiresAt = new Date(Date.now() + input.durationHours * 3600000); await createDelegatedCode(ctx.user.id, hash, expiresAt); return { code: raw, expiresAt }; }),
    listDelegatedCodes: protectedProcedure.query(({ ctx }) => listActiveDelegatedCodes(ctx.user.id)),
    revokeDelegatedCodes: protectedProcedure.mutation(async ({ ctx }) => { await revokeDelegatedCodes(ctx.user.id); return { success: true }; }),
  }),
  forest: forestRouter,
});

export type AppRouter = typeof appRouter;
