import { z } from "zod";

const appUrl = z.url({ protocol: /^https?$/ }).refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return (
    !url.username &&
    !url.password &&
    url.pathname === "/" &&
    !url.search &&
    !url.hash
  );
}, "Informe somente a origem HTTP(S), sem caminho ou credenciais.");

const clientSchema = z.object({ NEXT_PUBLIC_APP_URL: appUrl });
const serverSchema = clientSchema
  .extend({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url({ protocol: /^mysql$/ }).refine((value) => {
      try {
        const url = new URL(value);
        return (
          !!url.username &&
          decodeURIComponent(url.username).toLowerCase() !== "root" &&
          !!url.password &&
          url.pathname.length > 1
        );
      } catch {
        return false;
      }
    }, "Informe uma conexão MySQL com banco, senha e usuário próprio (nunca root)."),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "Use um segredo aleatório com pelo menos 32 caracteres."),
    BETTER_AUTH_URL: appUrl,
  })
  .superRefine((value, context) => {
    if (
      !URL.canParse(value.BETTER_AUTH_URL) ||
      !URL.canParse(value.NEXT_PUBLIC_APP_URL)
    )
      return;
    if (
      new URL(value.BETTER_AUTH_URL).origin !==
      new URL(value.NEXT_PUBLIC_APP_URL).origin
    ) {
      context.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_URL"],
        message: "Deve ter a mesma origem de NEXT_PUBLIC_APP_URL.",
      });
    }
    if (value.NODE_ENV === "production") {
      for (const key of ["BETTER_AUTH_URL", "NEXT_PUBLIC_APP_URL"] as const) {
        if (!value[key].startsWith("https://")) {
          context.addIssue({
            code: "custom",
            path: [key],
            message: "Use HTTPS em produção.",
          });
        }
      }
    }
  });

function parseEnvironment<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    throw new Error(
      `Variáveis de ambiente inválidas. Confira .env.example.\n${details.join("\n")}`,
    );
  }
  return result.data;
}

export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error(
      "As variáveis privadas só podem ser acessadas no servidor.",
    );
  }
  return parseEnvironment(serverSchema, {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}

export function getClientEnv() {
  return parseEnvironment(clientSchema, {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}
