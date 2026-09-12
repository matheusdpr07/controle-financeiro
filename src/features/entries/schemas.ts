import { z } from "zod";
import { isPositiveMoney, normalizeMoneyInput } from "@/lib/money";

export const financialEntryKinds = ["INCOME", "EXPENSE"] as const;
export type FinancialEntryKind = (typeof financialEntryKinds)[number];

export const financialEntryKindLabels: Record<FinancialEntryKind, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

const identifierSchema = z.string().min(1).max(191, "Identificador inválido.");

const positiveMoneySchema = z
  .string()
  .trim()
  .min(1, "Informe o valor.")
  .max(20, "O valor é muito longo.")
  .transform((value, context) => {
    const normalized = normalizeMoneyInput(value);
    if (!normalized || !isPositiveMoney(normalized)) {
      context.addIssue({
        code: "custom",
        message: "Informe um valor positivo com até duas casas decimais.",
      });
      return z.NEVER;
    }
    return normalized;
  });

const descriptionSchema = z
  .string()
  .trim()
  .min(2, "Informe uma descrição com pelo menos 2 caracteres.")
  .max(120, "A descrição deve ter no máximo 120 caracteres.");

const categoryIdSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  identifierSchema.nullable(),
);

export const financialEntrySchema = z.object({
  description: descriptionSchema,
  kind: z.enum(financialEntryKinds, "Selecione o tipo do lançamento."),
  amount: positiveMoneySchema,
  occurredOn: z.iso.date("Informe uma data válida."),
  financialAccountId: identifierSchema,
  categoryId: categoryIdSchema,
});

export const financialTransferSchema = z
  .object({
    description: descriptionSchema,
    amount: positiveMoneySchema,
    occurredOn: z.iso.date("Informe uma data válida."),
    sourceAccountId: identifierSchema,
    destinationAccountId: identifierSchema,
  })
  .superRefine((value, context) => {
    if (value.sourceAccountId === value.destinationAccountId) {
      context.addIssue({
        code: "custom",
        path: ["destinationAccountId"],
        message: "Selecione contas diferentes.",
      });
    }
  });

export const financialRecordIdSchema = identifierSchema;
