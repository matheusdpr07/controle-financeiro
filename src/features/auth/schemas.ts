import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "O e-mail é muito longo.")
  .pipe(z.email("Informe um e-mail válido."));

export const signInSchema = z.object({
  email,
  password: z
    .string()
    .min(1, "Informe sua senha.")
    .max(128, "A senha deve ter no máximo 128 caracteres."),
});

export const signUpSchema = signInSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  password: z
    .string()
    .min(12, "Use uma senha com pelo menos 12 caracteres.")
    .max(128, "A senha deve ter no máximo 128 caracteres."),
});
