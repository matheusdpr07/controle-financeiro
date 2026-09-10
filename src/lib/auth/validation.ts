import "server-only";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { signInSchema, signUpSchema } from "@/features/auth/schemas";

export const validateAuthInput = createAuthMiddleware(async (context) => {
  if (context.path !== "/sign-up/email" && context.path !== "/sign-in/email")
    return;
  const schema =
    context.path === "/sign-up/email" ? signUpSchema : signInSchema;
  const result = schema.safeParse(context.body);
  if (!result.success) {
    throw new APIError("BAD_REQUEST", {
      code: "INVALID_AUTH_INPUT",
      message:
        result.error.issues[0]?.message ?? "Confira os dados informados.",
    });
  }
  return { context: { ...context, body: { ...context.body, ...result.data } } };
});
