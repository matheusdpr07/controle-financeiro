"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createFinancialEntry,
  createFinancialTransfer,
  setFinancialEntryDeleted,
  setFinancialTransferDeleted,
  updateFinancialEntry,
  updateFinancialTransfer,
} from "@/features/entries/data";
import {
  financialEntrySchema,
  financialRecordIdSchema,
  financialTransferSchema,
} from "@/features/entries/schemas";

export type FinancialRecordFormState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: Record<string, string[] | undefined>;
};

const deletedFormSchema = z.object({
  id: financialRecordIdSchema,
  deleted: z.enum(["true", "false"]).transform((value) => value === "true"),
});

function readEntryForm(formData: FormData) {
  return financialEntrySchema.safeParse({
    description: formData.get("description"),
    kind: formData.get("kind"),
    amount: formData.get("amount"),
    occurredOn: formData.get("occurredOn"),
    financialAccountId: formData.get("financialAccountId"),
    categoryId: formData.get("categoryId"),
  });
}

function readTransferForm(formData: FormData) {
  return financialTransferSchema.safeParse({
    description: formData.get("description"),
    amount: formData.get("amount"),
    occurredOn: formData.get("occurredOn"),
    sourceAccountId: formData.get("sourceAccountId"),
    destinationAccountId: formData.get("destinationAccountId"),
  });
}

function invalidReferenceState(): FinancialRecordFormState {
  return {
    status: "error",
    message:
      "Selecione contas e categorias ativas que pertençam ao seu acesso.",
  };
}

export async function createFinancialEntryAction(
  _previousState: FinancialRecordFormState,
  formData: FormData,
): Promise<FinancialRecordFormState> {
  const parsed = readEntryForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos informados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const result = await createFinancialEntry(parsed.data);
  if (result === "invalid-reference") return invalidReferenceState();
  revalidatePath("/lancamentos");
  revalidatePath("/area");
  return { status: "success", message: "Lançamento criado." };
}

export async function updateFinancialEntryAction(
  id: string,
  _previousState: FinancialRecordFormState,
  formData: FormData,
): Promise<FinancialRecordFormState> {
  const parsedId = financialRecordIdSchema.safeParse(id);
  const parsed = readEntryForm(formData);
  if (!parsedId.success || !parsed.success) {
    return {
      status: "error",
      message: "Confira os campos informados.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }
  const result = await updateFinancialEntry(parsedId.data, parsed.data);
  if (result === "invalid-reference") return invalidReferenceState();
  if (result === "not-found") {
    return { status: "error", message: "Lançamento não encontrado." };
  }
  revalidatePath("/lancamentos");
  revalidatePath("/area");
  return { status: "success", message: "Lançamento atualizado." };
}

export async function setFinancialEntryDeletedAction(formData: FormData) {
  const parsed = deletedFormSchema.safeParse({
    id: formData.get("id"),
    deleted: formData.get("deleted"),
  });
  if (!parsed.success) return;
  await setFinancialEntryDeleted(parsed.data.id, parsed.data.deleted);
  revalidatePath("/lancamentos");
  revalidatePath("/area");
}

export async function createFinancialTransferAction(
  _previousState: FinancialRecordFormState,
  formData: FormData,
): Promise<FinancialRecordFormState> {
  const parsed = readTransferForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos informados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const result = await createFinancialTransfer(parsed.data);
  if (result === "invalid-reference") return invalidReferenceState();
  revalidatePath("/lancamentos");
  revalidatePath("/area");
  return { status: "success", message: "Transferência registrada." };
}

export async function updateFinancialTransferAction(
  id: string,
  _previousState: FinancialRecordFormState,
  formData: FormData,
): Promise<FinancialRecordFormState> {
  const parsedId = financialRecordIdSchema.safeParse(id);
  const parsed = readTransferForm(formData);
  if (!parsedId.success || !parsed.success) {
    return {
      status: "error",
      message: "Confira os campos informados.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }
  const result = await updateFinancialTransfer(parsedId.data, parsed.data);
  if (result === "invalid-reference") return invalidReferenceState();
  if (result === "not-found") {
    return { status: "error", message: "Transferência não encontrada." };
  }
  revalidatePath("/lancamentos");
  revalidatePath("/area");
  return { status: "success", message: "Transferência atualizada." };
}

export async function setFinancialTransferDeletedAction(formData: FormData) {
  const parsed = deletedFormSchema.safeParse({
    id: formData.get("id"),
    deleted: formData.get("deleted"),
  });
  if (!parsed.success) return;
  await setFinancialTransferDeleted(parsed.data.id, parsed.data.deleted);
  revalidatePath("/lancamentos");
  revalidatePath("/area");
}
