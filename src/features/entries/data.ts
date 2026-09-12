import "server-only";
import { Prisma } from "@/generated/prisma/client";
import type { FinancialEntryKind } from "@/features/entries/schemas";
import { requireUser } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db/prisma";

export type EntryAccountOptionDTO = {
  id: string;
  name: string;
  archived: boolean;
};

export type EntryCategoryOptionDTO = {
  id: string;
  name: string;
  kind: FinancialEntryKind;
  archived: boolean;
};

export type FinancialEntryDTO = {
  recordType: "entry";
  id: string;
  description: string;
  kind: FinancialEntryKind;
  amount: string;
  occurredOn: string;
  account: { id: string; name: string };
  category: { id: string; name: string } | null;
  deleted: boolean;
};

export type FinancialTransferDTO = {
  recordType: "transfer";
  id: string;
  description: string;
  amount: string;
  occurredOn: string;
  sourceAccount: { id: string; name: string };
  destinationAccount: { id: string; name: string };
  deleted: boolean;
};

export type FinancialEntryInput = {
  description: string;
  kind: FinancialEntryKind;
  amount: string;
  occurredOn: string;
  financialAccountId: string;
  categoryId: string | null;
};

export type FinancialTransferInput = {
  description: string;
  amount: string;
  occurredOn: string;
  sourceAccountId: string;
  destinationAccountId: string;
};

export type FinancialRecordMutationResult =
  "created" | "updated" | "not-found" | "invalid-reference";

const entrySelect = {
  id: true,
  description: true,
  kind: true,
  amount: true,
  occurredOn: true,
  deletedAt: true,
  financialAccount: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
} satisfies Prisma.FinancialEntrySelect;

const transferSelect = {
  id: true,
  description: true,
  amount: true,
  occurredOn: true,
  deletedAt: true,
  sourceAccount: { select: { id: true, name: true } },
  destinationAccount: { select: { id: true, name: true } },
} satisfies Prisma.FinancialTransferSelect;

function toFinancialDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateString(value: Date) {
  return value.toISOString().slice(0, 10);
}

function toEntryDTO(
  entry: Prisma.FinancialEntryGetPayload<{ select: typeof entrySelect }>,
): FinancialEntryDTO {
  return {
    recordType: "entry",
    id: entry.id,
    description: entry.description,
    kind: entry.kind,
    amount: entry.amount.toFixed(2),
    occurredOn: toDateString(entry.occurredOn),
    account: entry.financialAccount,
    category: entry.category,
    deleted: entry.deletedAt !== null,
  };
}

function toTransferDTO(
  transfer: Prisma.FinancialTransferGetPayload<{
    select: typeof transferSelect;
  }>,
): FinancialTransferDTO {
  return {
    recordType: "transfer",
    id: transfer.id,
    description: transfer.description,
    amount: transfer.amount.toFixed(2),
    occurredOn: toDateString(transfer.occurredOn),
    sourceAccount: transfer.sourceAccount,
    destinationAccount: transfer.destinationAccount,
    deleted: transfer.deletedAt !== null,
  };
}

export async function getFinancialEntriesPageData() {
  const user = await requireUser();
  const prisma = getPrisma();
  const [accounts, categories, entries, transfers] = await Promise.all([
    prisma.financialAccount.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, archivedAt: true },
    }),
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: [{ kind: "asc" }, { name: "asc" }],
      select: { id: true, name: true, kind: true, archivedAt: true },
    }),
    prisma.financialEntry.findMany({
      where: { userId: user.id },
      orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }],
      select: entrySelect,
    }),
    prisma.financialTransfer.findMany({
      where: { userId: user.id },
      orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }],
      select: transferSelect,
    }),
  ]);

  return {
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      archived: account.archivedAt !== null,
    })),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      kind: category.kind,
      archived: category.archivedAt !== null,
    })),
    entries: entries.map(toEntryDTO),
    transfers: transfers.map(toTransferDTO),
  };
}

async function referencesAreValid(userId: string, input: FinancialEntryInput) {
  const prisma = getPrisma();
  const [account, category] = await Promise.all([
    prisma.financialAccount.findFirst({
      where: { id: input.financialAccountId, userId, archivedAt: null },
      select: { openingBalanceDate: true },
    }),
    input.categoryId
      ? prisma.category.findFirst({
          where: {
            id: input.categoryId,
            userId,
            kind: input.kind,
            archivedAt: null,
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);
  return (
    account !== null &&
    toDateString(account.openingBalanceDate) <= input.occurredOn &&
    (!input.categoryId || category !== null)
  );
}

async function transferReferencesAreValid(
  userId: string,
  input: FinancialTransferInput,
) {
  const accounts = await getPrisma().financialAccount.findMany({
    where: {
      id: { in: [input.sourceAccountId, input.destinationAccountId] },
      userId,
      archivedAt: null,
    },
    select: { openingBalanceDate: true },
  });
  return (
    accounts.length === 2 &&
    accounts.every(
      (account) => toDateString(account.openingBalanceDate) <= input.occurredOn,
    )
  );
}

export async function createFinancialEntry(
  input: FinancialEntryInput,
): Promise<FinancialRecordMutationResult> {
  const user = await requireUser();
  if (!(await referencesAreValid(user.id, input))) return "invalid-reference";
  await getPrisma().financialEntry.create({
    data: {
      userId: user.id,
      financialAccountId: input.financialAccountId,
      categoryId: input.categoryId,
      kind: input.kind,
      description: input.description,
      amount: input.amount,
      occurredOn: toFinancialDate(input.occurredOn),
    },
    select: { id: true },
  });
  return "created";
}

export async function updateFinancialEntry(
  id: string,
  input: FinancialEntryInput,
): Promise<FinancialRecordMutationResult> {
  const user = await requireUser();
  if (!(await referencesAreValid(user.id, input))) return "invalid-reference";
  const result = await getPrisma().financialEntry.updateMany({
    where: { id, userId: user.id },
    data: {
      financialAccountId: input.financialAccountId,
      categoryId: input.categoryId,
      kind: input.kind,
      description: input.description,
      amount: input.amount,
      occurredOn: toFinancialDate(input.occurredOn),
    },
  });
  return result.count === 1 ? "updated" : "not-found";
}

export async function setFinancialEntryDeleted(
  id: string,
  deleted: boolean,
): Promise<"updated" | "not-found"> {
  const user = await requireUser();
  const result = await getPrisma().financialEntry.updateMany({
    where: { id, userId: user.id },
    data: { deletedAt: deleted ? new Date() : null },
  });
  return result.count === 1 ? "updated" : "not-found";
}

export async function createFinancialTransfer(
  input: FinancialTransferInput,
): Promise<FinancialRecordMutationResult> {
  const user = await requireUser();
  if (!(await transferReferencesAreValid(user.id, input))) {
    return "invalid-reference";
  }
  await getPrisma().financialTransfer.create({
    data: {
      userId: user.id,
      sourceAccountId: input.sourceAccountId,
      destinationAccountId: input.destinationAccountId,
      description: input.description,
      amount: input.amount,
      occurredOn: toFinancialDate(input.occurredOn),
    },
    select: { id: true },
  });
  return "created";
}

export async function updateFinancialTransfer(
  id: string,
  input: FinancialTransferInput,
): Promise<FinancialRecordMutationResult> {
  const user = await requireUser();
  if (!(await transferReferencesAreValid(user.id, input))) {
    return "invalid-reference";
  }
  const result = await getPrisma().financialTransfer.updateMany({
    where: { id, userId: user.id },
    data: {
      sourceAccountId: input.sourceAccountId,
      destinationAccountId: input.destinationAccountId,
      description: input.description,
      amount: input.amount,
      occurredOn: toFinancialDate(input.occurredOn),
    },
  });
  return result.count === 1 ? "updated" : "not-found";
}

export async function setFinancialTransferDeleted(
  id: string,
  deleted: boolean,
): Promise<"updated" | "not-found"> {
  const user = await requireUser();
  const result = await getPrisma().financialTransfer.updateMany({
    where: { id, userId: user.id },
    data: { deletedAt: deleted ? new Date() : null },
  });
  return result.count === 1 ? "updated" : "not-found";
}
