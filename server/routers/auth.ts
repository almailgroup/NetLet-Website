/**
 * Registration, sign-in and sign-out against NetLet's own user table.
 *
 * Two behaviours here are deliberate rather than incidental:
 *
 * Registration and sign-in both answer with the same "Email or password is
 * incorrect" on failure, and registration hashes a password even when the
 * address is already taken. Together those stop the endpoints being used to
 * enumerate which addresses have accounts — the reply and the time taken look
 * the same either way.
 *
 * The session cookie is httpOnly, so the token is never readable from
 * JavaScript and cannot be exfiltrated by a script injected into the page.
 */
import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { SESSION_MAX_AGE_MS, signSession } from "../_core/auth";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { publicProcedure, router } from "../_core/trpc";
import { hashPassword, verifyPassword } from "../_core/password";
import { createUser, getUserByEmail, touchLastSignedIn } from "../db";
import type { User } from "../../drizzle/schema";

const credentials = z.object({
  email: z.string().trim().email().max(320),
  // Long enough to matter, and capped because scrypt hashes whatever it is
  // given — an unbounded password is a denial-of-service vector.
  password: z.string().min(10).max(200),
});

const registration = credentials.extend({
  name: z.string().trim().min(1).max(255).optional(),
});

/** The shape sent to the client: never the hash. */
export type PublicUser = Pick<User, "id" | "email" | "name" | "role">;

function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

function assertConfigured() {
  if (!ENV.cookieSecret) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Authentication is not configured: JWT_SECRET is unset.",
    });
  }
  if (!ENV.databaseUrl) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Authentication is not configured: DATABASE_URL is unset.",
    });
  }
}

const invalidCredentials = new TRPCError({
  code: "UNAUTHORIZED",
  message: "Email or password is incorrect.",
});

export const authRouter = router({
  /** Current user, or null. Cheap enough to call on every page load. */
  me: publicProcedure.query(({ ctx }) => (ctx.user ? toPublicUser(ctx.user) : null)),

  register: publicProcedure.input(registration).mutation(async ({ ctx, input }) => {
    assertConfigured();

    // Hashed before the duplicate check so a taken address and a free one cost
    // the same time; otherwise the response latency leaks which is which.
    const passwordHash = await hashPassword(input.password);
    const user = await createUser({ email: input.email, passwordHash, name: input.name ?? null });
    if (!user) {
      throw new TRPCError({ code: "CONFLICT", message: "That email is already registered." });
    }

    const token = await signSession(user.id);
    ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: SESSION_MAX_AGE_MS });
    return toPublicUser(user);
  }),

  login: publicProcedure.input(credentials).mutation(async ({ ctx, input }) => {
    assertConfigured();

    const user = await getUserByEmail(input.email);
    if (!user) {
      // Hash anyway. Returning early for an unknown address would make sign-in
      // measurably faster for addresses that do not exist.
      await hashPassword(input.password);
      throw invalidCredentials;
    }

    if (!(await verifyPassword(input.password, user.passwordHash))) throw invalidCredentials;

    await touchLastSignedIn(user.id);
    const token = await signSession(user.id);
    ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: SESSION_MAX_AGE_MS });
    return toPublicUser(user);
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
    return { success: true } as const;
  }),
});
