import { z } from "zod";
import { monthSchema } from "@/features/dashboard/month";
import { normalizeMoneyInput } from "@/lib/money";

const balanceSchema = z
  .string()
  .trim()
  .min(1, "Informe o saldo real.")
  .max(21, "O saldo informado é muito longo.")
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

export const balanceCorrectionSchema = z.object({
  financialAccountId: z.string().min(1).max(191, "Identificador inválido."),
  month: monthSchema,
  actualBalance: balanceSchema,
});
