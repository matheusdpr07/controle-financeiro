import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { validateAuthInput } from "@/lib/auth/validation";
import { authOptions } from "@/lib/auth/options";
import { getPrisma } from "@/lib/db/prisma";
import { getServerEnv } from "@/lib/env";

function createAuth() {
  const env = getServerEnv();
  return betterAuth({
    ...authOptions,
    hooks: { before: validateAuthInput },
    rateLimit: { enabled: true },
    database: prismaAdapter(getPrisma(), { provider: "mysql" }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
    advanced: {
      useSecureCookies: env.NODE_ENV === "production",
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
    },
  });
}

let auth: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  auth ??= createAuth();
  return auth;
}
