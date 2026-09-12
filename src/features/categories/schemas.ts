import { z } from "zod";

export const categoryKinds = ["INCOME", "EXPENSE"] as const;

export type CategoryKind = (typeof categoryKinds)[number];

export const categoryKindLabels: Record<CategoryKind, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  kind: z.enum(categoryKinds, "Selecione a natureza da categoria."),
});

export const categoryIdSchema = z
  .string()
  .min(1)
  .max(191, "Identificador inválido.");
