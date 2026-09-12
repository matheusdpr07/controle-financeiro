"use server";

import { revalidatePath } from "next/cache";
import { saveBalanceCorrection } from "@/features/dashboard/data";
import { balanceCorrectionSchema } from "@/features/dashboard/schemas";

export type BalanceCorrectionFormState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: { actualBalance?: string[] };
};

export async function saveBalanceCorrectionAction(
  _previousState: BalanceCorrectionFormState,
  formData: FormData,
): Promise<BalanceCorrectionFormState> {
  const parsed = balanceCorrectionSchema.safeParse({
    financialAccountId: formData.get("financialAccountId"),
    month: formData.get("month"),
    actualBalance: formData.get("actualBalance"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira o saldo informado.",
      errors: {
        actualBalance: parsed.error.flatten().fieldErrors.actualBalance,
      },
    };
  }

  const result = await saveBalanceCorrection(parsed.data);
  if (result === "future-month") {
    return {
      status: "error",
      message:
        "O saldo só pode ser corrigido no mês atual ou em meses passados.",
    };
  }
  if (result === "not-found") {
    return {
      status: "error",
      message: "A conta não está disponível para correção.",
    };
  }

  revalidatePath("/area");
  return { status: "success", message: "Ajuste de saldo registrado." };
}
