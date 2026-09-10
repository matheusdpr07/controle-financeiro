import type { BetterAuthOptions } from "better-auth";

export const authOptions = {
  appName: "Controle Financeiro",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: false },
  },
} satisfies BetterAuthOptions;
