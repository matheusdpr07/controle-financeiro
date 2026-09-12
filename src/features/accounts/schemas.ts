import { z } from "zod";
import { normalizeMoneyInput } from "@/lib/money";

export const financialAccountTypes = [
  "CHECKING",
  "SAVINGS",
  "CASH",
  "INVESTMENT",
  "OTHER",
] as const;

export type FinancialAccountType = (typeof financialAccountTypes)[number];

export const financialAccountTypeLabels: Record<FinancialAccountType, string> =
  {
    CHECKING: "Conta corrente",
    SAVINGS: "Poupança",
    CASH: "Dinheiro",
    INVESTMENT: "Investimento",
    OTHER: "Outra",
  };

const moneySchema = z
  .string()
  .trim()
  .min(1, "Informe o saldo de abertura.")
  .max(21, "O saldo de abertura é muito longo.")
  .transform((value, context) => {
    const normalized = normalizeMoneyInput(value);
    if (!normalized) {
      context.addIssue({
        code: "custom",
        message: "Use até 17 dígitos inteiros e duas casas decimais.",
      });
      return z.NEVER;
    }
    return normalized;
  });

export const financialAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  type: z.enum(financialAccountTypes, "Selecione um tipo de conta."),
  openingBalance: moneySchema,
  openingBalanceDate: z.iso.date("Informe uma data válida."),
});

export const financialAccountIdSchema = z
  .string()
  .min(1)
  .max(191, "Identificador inválido.");
