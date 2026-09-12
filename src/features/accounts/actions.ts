"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createFinancialAccount,
  setFinancialAccountArchived,
  updateFinancialAccount,
} from "@/features/accounts/data";
import {
  financialAccountIdSchema,
  financialAccountSchema,
} from "@/features/accounts/schemas";

export type FinancialAccountFormState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: Partial<
    Record<"name" | "type" | "openingBalance" | "openingBalanceDate", string[]>
  >;
};

function readFinancialAccountForm(formData: FormData) {
  return financialAccountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    openingBalance: formData.get("openingBalance"),
    openingBalanceDate: formData.get("openingBalanceDate"),
  });
}

const archivedFormSchema = z.object({
  id: financialAccountIdSchema,
  archived: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export async function createFinancialAccountAction(
  _previousState: FinancialAccountFormState,
  formData: FormData,
): Promise<FinancialAccountFormState> {
  const parsed = readFinancialAccountForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos informados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const result = await createFinancialAccount(parsed.data);
  if (result === "conflict") {
    return {
      status: "error",
      message: "Já existe uma conta com esse nome.",
    };
  }
  revalidatePath("/contas");
  revalidatePath("/area");
  return { status: "success", message: "Conta criada." };
}

export async function updateFinancialAccountAction(
  id: string,
  _previousState: FinancialAccountFormState,
  formData: FormData,
): Promise<FinancialAccountFormState> {
  const parsedId = financialAccountIdSchema.safeParse(id);
  const parsed = readFinancialAccountForm(formData);
  if (!parsedId.success || !parsed.success) {
    return {
      status: "error",
      message: "Confira os campos informados.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const result = await updateFinancialAccount(parsedId.data, parsed.data);
  if (result === "conflict") {
    return {
      status: "error",
      message: "Já existe uma conta com esse nome.",
    };
  }
  if (result === "not-found") {
    return { status: "error", message: "Conta não encontrada." };
  }
  revalidatePath("/contas");
  revalidatePath("/area");
  return { status: "success", message: "Conta atualizada." };
}

export async function setFinancialAccountArchivedAction(formData: FormData) {
  const parsed = archivedFormSchema.safeParse({
    id: formData.get("id"),
    archived: formData.get("archived"),
  });
  if (!parsed.success) return;

  await setFinancialAccountArchived(parsed.data.id, parsed.data.archived);
  revalidatePath("/contas");
  revalidatePath("/area");
}
