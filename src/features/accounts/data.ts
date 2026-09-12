import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db/prisma";
import type { FinancialAccountType } from "@/features/accounts/schemas";

export type FinancialAccountDTO = {
  id: string;
  name: string;
  type: FinancialAccountType;
  currencyCode: string;
  openingBalance: string;
  currentBalance: string;
  openingBalanceDate: string;
  archived: boolean;
};

export type FinancialAccountInput = {
  name: string;
  type: FinancialAccountType;
  openingBalance: string;
  openingBalanceDate: string;
};

export type FinancialAccountMutationResult =
  "created" | "updated" | "not-found" | "conflict";

const financialAccountSelect = {
  id: true,
  name: true,
  type: true,
  currencyCode: true,
  openingBalance: true,
  openingBalanceDate: true,
  archivedAt: true,
} satisfies Prisma.FinancialAccountSelect;

function toFinancialAccountDTO(
  account: Prisma.FinancialAccountGetPayload<{
    select: typeof financialAccountSelect;
  }>,
  currentBalance: Prisma.Decimal,
): FinancialAccountDTO {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    currencyCode: account.currencyCode,
    openingBalance: account.openingBalance.toFixed(2),
    currentBalance: currentBalance.toFixed(2),
    openingBalanceDate: account.openingBalanceDate.toISOString().slice(0, 10),
    archived: account.archivedAt !== null,
  };
}

function isUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function toFinancialDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function listFinancialAccounts() {
  const user = await requireUser();
  const prisma = getPrisma();
  const [
    accounts,
    entryTotals,
    outgoingTotals,
    incomingTotals,
    adjustmentTotals,
  ] = await Promise.all([
    prisma.financialAccount.findMany({
      where: { userId: user.id },
      orderBy: [{ archivedAt: "asc" }, { name: "asc" }],
      select: financialAccountSelect,
    }),
    prisma.financialEntry.groupBy({
      by: ["financialAccountId", "kind"],
      where: { userId: user.id, deletedAt: null },
      _sum: { amount: true },
    }),
    prisma.financialTransfer.groupBy({
      by: ["sourceAccountId"],
      where: { userId: user.id, deletedAt: null },
      _sum: { amount: true },
    }),
    prisma.financialTransfer.groupBy({
      by: ["destinationAccountId"],
      where: { userId: user.id, deletedAt: null },
      _sum: { amount: true },
    }),
    prisma.balanceAdjustment.groupBy({
      by: ["financialAccountId"],
      where: { userId: user.id },
      _sum: { amount: true },
    }),
  ]);

  return accounts.map((account) => {
    let currentBalance = account.openingBalance;
    for (const total of entryTotals) {
      if (
        total.financialAccountId !== account.id ||
        total._sum.amount === null
      ) {
        continue;
      }
      currentBalance =
        total.kind === "INCOME"
          ? currentBalance.plus(total._sum.amount)
          : currentBalance.minus(total._sum.amount);
    }
    for (const total of outgoingTotals) {
      if (total.sourceAccountId === account.id && total._sum.amount !== null) {
        currentBalance = currentBalance.minus(total._sum.amount);
      }
    }
    for (const total of incomingTotals) {
      if (
        total.destinationAccountId === account.id &&
        total._sum.amount !== null
      ) {
        currentBalance = currentBalance.plus(total._sum.amount);
      }
    }
    for (const total of adjustmentTotals) {
      if (
        total.financialAccountId === account.id &&
        total._sum.amount !== null
      ) {
        currentBalance = currentBalance.plus(total._sum.amount);
      }
    }
    return toFinancialAccountDTO(account, currentBalance);
  });
}

export async function createFinancialAccount(
  input: FinancialAccountInput,
): Promise<FinancialAccountMutationResult> {
  const user = await requireUser();
  try {
    await getPrisma().financialAccount.create({
      data: {
        userId: user.id,
        name: input.name,
        type: input.type,
        currencyCode: "BRL",
        openingBalance: input.openingBalance,
        openingBalanceDate: toFinancialDate(input.openingBalanceDate),
      },
      select: { id: true },
    });
    return "created";
  } catch (error) {
    if (isUniqueConflict(error)) return "conflict";
    throw error;
  }
}

export async function updateFinancialAccount(
  id: string,
  input: FinancialAccountInput,
): Promise<FinancialAccountMutationResult> {
  const user = await requireUser();
  try {
    const result = await getPrisma().financialAccount.updateMany({
      where: { id, userId: user.id },
      data: {
        name: input.name,
        type: input.type,
        openingBalance: input.openingBalance,
        openingBalanceDate: toFinancialDate(input.openingBalanceDate),
      },
    });
    return result.count === 1 ? "updated" : "not-found";
  } catch (error) {
    if (isUniqueConflict(error)) return "conflict";
    throw error;
  }
}

export async function setFinancialAccountArchived(
  id: string,
  archived: boolean,
): Promise<"updated" | "not-found"> {
  const user = await requireUser();
  const result = await getPrisma().financialAccount.updateMany({
    where: { id, userId: user.id },
    data: { archivedAt: archived ? new Date() : null },
  });
  return result.count === 1 ? "updated" : "not-found";
}
