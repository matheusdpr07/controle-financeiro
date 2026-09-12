import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db/prisma";
import type { CategoryKind } from "@/features/categories/schemas";

export type CategoryDTO = {
  id: string;
  name: string;
  kind: CategoryKind;
  archived: boolean;
};

export type CategoryInput = { name: string; kind: CategoryKind };
export type CategoryMutationResult =
  "created" | "updated" | "not-found" | "conflict";

const categorySelect = {
  id: true,
  name: true,
  kind: true,
  archivedAt: true,
} satisfies Prisma.CategorySelect;

function toCategoryDTO(
  category: Prisma.CategoryGetPayload<{ select: typeof categorySelect }>,
): CategoryDTO {
  return {
    id: category.id,
    name: category.name,
    kind: category.kind,
    archived: category.archivedAt !== null,
  };
}

function isUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function listCategories() {
  const user = await requireUser();
  const categories = await getPrisma().category.findMany({
    where: { userId: user.id },
    orderBy: [{ archivedAt: "asc" }, { kind: "asc" }, { name: "asc" }],
    select: categorySelect,
  });
  return categories.map(toCategoryDTO);
}

export async function createCategory(
  input: CategoryInput,
): Promise<CategoryMutationResult> {
  const user = await requireUser();
  try {
    await getPrisma().category.create({
      data: { userId: user.id, name: input.name, kind: input.kind },
      select: { id: true },
    });
    return "created";
  } catch (error) {
    if (isUniqueConflict(error)) return "conflict";
    throw error;
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<CategoryMutationResult> {
  const user = await requireUser();
  try {
    const result = await getPrisma().category.updateMany({
      where: { id, userId: user.id },
      data: input,
    });
    return result.count === 1 ? "updated" : "not-found";
  } catch (error) {
    if (isUniqueConflict(error)) return "conflict";
    throw error;
  }
}

export async function setCategoryArchived(
  id: string,
  archived: boolean,
): Promise<"updated" | "not-found"> {
  const user = await requireUser();
  const result = await getPrisma().category.updateMany({
    where: { id, userId: user.id },
    data: { archivedAt: archived ? new Date() : null },
  });
  return result.count === 1 ? "updated" : "not-found";
}
