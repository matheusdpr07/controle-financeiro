import "server-only";
import { Prisma } from "@/generated/prisma/client";
import {
  calculateAccountMonth,
  getCurrentMonth,
  getMonthRange,
  type AccountMonthResult,
} from "@/features/dashboard/month";
import type { FinancialAccountType } from "@/features/accounts/schemas";
import { requireUser } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db/prisma";

export type BalanceCorrectionInput = {
  financialAccountId: string;
  month: string;
  actualBalance: string;
};

export type MonthlyAccountDTO = {
  id: string;
  name: string;
  type: FinancialAccountType;
  archived: boolean;
  report: AccountMonthResult;
  correction: {
    expectedBalance: string;
    actualBalance: string;
    amount: string;
  } | null;
};

export type MonthlyDashboardDTO = {
  user: { name: string; email: string };
  hasAccounts: boolean;
  month: string;
  label: string;
  previousMonth: string;
  nextMonth: string;
  canCorrect: boolean;
  accounts: MonthlyAccountDTO[];
  summary: AccountMonthResult;
};

type AccountActivity = {
  id: string;
  name: string;
  type: FinancialAccountType;
  openingBalance: Prisma.Decimal | string;
  openingBalanceDate: Date;
  archivedAt: Date | null;
  financialEntries: Array<{
    kind: "INCOME" | "EXPENSE";
    amount: Prisma.Decimal | string;
    occurredOn: Date;
  }>;
  outgoingTransfers: Array<{
    amount: Prisma.Decimal | string;
    occurredOn: Date;
  }>;
  incomingTransfers: Array<{
    amount: Prisma.Decimal | string;
    occurredOn: Date;
  }>;
  balanceAdjustments: Array<{
    month: Date;
    expectedBalance: Prisma.Decimal | string;
    actualBalance: Prisma.Decimal | string;
    amount: Prisma.Decimal | string;
  }>;
};

function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function decimalString(value: Prisma.Decimal | string) {
  return new Prisma.Decimal(value).toFixed(2);
}

function toAccountReport(account: AccountActivity, month: string) {
  return calculateAccountMonth({
    month,
    openingBalance: decimalString(account.openingBalance),
    openingBalanceDate: dateString(account.openingBalanceDate),
    entries: account.financialEntries.map((entry) => ({
      kind: entry.kind,
      amount: decimalString(entry.amount),
      occurredOn: dateString(entry.occurredOn),
    })),
    transfers: [
      ...account.outgoingTransfers.map((transfer) => ({
        direction: "OUTGOING" as const,
        amount: decimalString(transfer.amount),
        occurredOn: dateString(transfer.occurredOn),
      })),
      ...account.incomingTransfers.map((transfer) => ({
        direction: "INCOMING" as const,
        amount: decimalString(transfer.amount),
        occurredOn: dateString(transfer.occurredOn),
      })),
    ],
    adjustments: account.balanceAdjustments.map((adjustment) => ({
      month: dateString(adjustment.month).slice(0, 7),
      amount: decimalString(adjustment.amount),
    })),
  });
}

function sumReports(accounts: MonthlyAccountDTO[]): AccountMonthResult {
  const fields = [
    "opening",
    "adjustments",
    "income",
    "expense",
    "outgoingTransfers",
    "incomingTransfers",
    "closing",
  ] as const;
  const totals = Object.fromEntries(
    fields.map((field) => [
      field,
      accounts
        .reduce(
          (total, account) => total.plus(account.report[field]),
          new Prisma.Decimal(0),
        )
        .toFixed(2),
    ]),
  );
  return totals as AccountMonthResult;
}

function activitySelect(end: Date, userId: string) {
  return {
    id: true,
    name: true,
    type: true,
    openingBalance: true,
    openingBalanceDate: true,
    archivedAt: true,
    financialEntries: {
      where: { userId, occurredOn: { lt: end }, deletedAt: null },
      select: { kind: true, amount: true, occurredOn: true },
    },
    outgoingTransfers: {
      where: { userId, occurredOn: { lt: end }, deletedAt: null },
      select: { amount: true, occurredOn: true },
    },
    incomingTransfers: {
      where: { userId, occurredOn: { lt: end }, deletedAt: null },
      select: { amount: true, occurredOn: true },
    },
    balanceAdjustments: {
      where: { userId, month: { lt: end } },
      select: {
        month: true,
        expectedBalance: true,
        actualBalance: true,
        amount: true,
      },
    },
  } as const;
}

export async function getMonthlyDashboard(
  month: string,
): Promise<MonthlyDashboardDTO> {
  const user = await requireUser();
  const range = getMonthRange(month);
  const records = await getPrisma().financialAccount.findMany({
    where: { userId: user.id },
    orderBy: [{ archivedAt: "asc" }, { name: "asc" }],
    select: activitySelect(range.end, user.id),
  });
  const accounts = records
    .filter(
      (account) => dateString(account.openingBalanceDate).slice(0, 7) <= month,
    )
    .map((account) => {
      const report = toAccountReport(account, month);
      const adjustment = account.balanceAdjustments.find(
        (item) => dateString(item.month).slice(0, 7) === month,
      );
      return {
        id: account.id,
        name: account.name,
        type: account.type,
        archived: account.archivedAt !== null,
        report,
        correction: adjustment
          ? {
              expectedBalance: decimalString(adjustment.expectedBalance),
              actualBalance: decimalString(adjustment.actualBalance),
              amount: decimalString(adjustment.amount),
            }
          : null,
      };
    });

  return {
    user: { name: user.name, email: user.email },
    hasAccounts: records.length > 0,
    month,
    label: range.label,
    previousMonth: range.previous,
    nextMonth: range.next,
    canCorrect: month <= getCurrentMonth(),
    accounts,
    summary: sumReports(accounts),
  };
}

export async function saveBalanceCorrection(
  input: BalanceCorrectionInput,
): Promise<"saved" | "not-found" | "future-month"> {
  const user = await requireUser();
  if (input.month > getCurrentMonth()) return "future-month";
  const range = getMonthRange(input.month);
  const prisma = getPrisma();
  const account = await prisma.financialAccount.findFirst({
    where: {
      id: input.financialAccountId,
      userId: user.id,
      archivedAt: null,
      openingBalanceDate: { lt: range.end },
    },
    select: activitySelect(range.end, user.id),
  });
  if (!account) return "not-found";

  const expectedBalance = new Prisma.Decimal(
    toAccountReport(account, input.month).opening,
  );
  const actualBalance = new Prisma.Decimal(input.actualBalance);
  const amount = actualBalance.minus(expectedBalance);
  const data = { expectedBalance, actualBalance, amount };

  await prisma.balanceAdjustment.upsert({
    where: {
      financialAccountId_month: {
        financialAccountId: account.id,
        month: range.start,
      },
    },
    create: {
      userId: user.id,
      financialAccountId: account.id,
      month: range.start,
      ...data,
    },
    update: data,
    select: { id: true },
  });
  return "saved";
}
