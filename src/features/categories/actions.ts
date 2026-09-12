"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createCategory,
  setCategoryArchived,
  updateCategory,
} from "@/features/categories/data";
import {
  categoryIdSchema,
  categorySchema,
} from "@/features/categories/schemas";

export type CategoryFormState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: Partial<Record<"name" | "kind", string[]>>;
};

function readCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
  });
}

const archivedFormSchema = z.object({
  id: categoryIdSchema,
  archived: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export async function createCategoryAction(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = readCategoryForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos informados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const result = await createCategory(parsed.data);
  if (result === "conflict") {
    return {
      status: "error",
      message: "Já existe uma categoria com esse nome e natureza.",
    };
  }
  revalidatePath("/categorias");
  return { status: "success", message: "Categoria criada." };
}

export async function updateCategoryAction(
  id: string,
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsedId = categoryIdSchema.safeParse(id);
  const parsed = readCategoryForm(formData);
  if (!parsedId.success || !parsed.success) {
    return {
      status: "error",
      message: "Confira os campos informados.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const result = await updateCategory(parsedId.data, parsed.data);
  if (result === "conflict") {
    return {
      status: "error",
      message: "Já existe uma categoria com esse nome e natureza.",
    };
  }
  if (result === "not-found") {
    return { status: "error", message: "Categoria não encontrada." };
  }
  revalidatePath("/categorias");
  return { status: "success", message: "Categoria atualizada." };
}

export async function setCategoryArchivedAction(formData: FormData) {
  const parsed = archivedFormSchema.safeParse({
    id: formData.get("id"),
    archived: formData.get("archived"),
  });
  if (!parsed.success) return;

  await setCategoryArchived(parsed.data.id, parsed.data.archived);
  revalidatePath("/categorias");
}
