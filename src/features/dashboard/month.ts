import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

type MonthlyEntry = {
  occurredOn: string;
  kind: "INCOME" | "EXPENSE";
  amount: string;
  deleted?: boolean;
};

type MonthlyTransfer = {
  occurredOn: string;
  direction: "INCOMING" | "OUTGOING";
  amount: string;
  deleted?: boolean;
};

type MonthlyAdjustment = {
  month: string;
  amount: string;
};

type AccountMonthInput = {
  month: string;
  openingBalance: string;
  openingBalanceDate: string;
  entries: MonthlyEntry[];
  transfers: MonthlyTransfer[];
  adjustments: MonthlyAdjustment[];
};

export type AccountMonthResult = {
  opening: string;
  adjustments: string;
  income: string;
  expense: string;
  outgoingTransfers: string;
  incomingTransfers: string;
  closing: string;
};

function toMonth(date: string) {
  return date.slice(0, 7);
}

function zeroResult(): AccountMonthResult {
  return {
    opening: "0.00",
    adjustments: "0.00",
    income: "0.00",
    expense: "0.00",
    outgoingTransfers: "0.00",
    incomingTransfers: "0.00",
    closing: "0.00",
  };
}

export function getCurrentMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return monthSchema.parse(`${year}-${month}`);
}

export function getMonthRange(month: string) {
  const parsed = monthSchema.parse(month);
  const [year, monthNumber] = parsed.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthNumber - 1, 1));
  const end = new Date(Date.UTC(year, monthNumber, 1));
  const previousDate = new Date(Date.UTC(year, monthNumber - 2, 1));
  const nextDate = end;
  const toIdentifier = (date: Date) => date.toISOString().slice(0, 7);

  return {
    start,
    end,
    previous: toIdentifier(previousDate),
    next: toIdentifier(nextDate),
    label: new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(start),
  };
}

export function calculateAccountMonth(
  input: AccountMonthInput,
): AccountMonthResult {
  monthSchema.parse(input.month);
  if (toMonth(input.openingBalanceDate) > input.month) return zeroResult();

  let opening = new Prisma.Decimal(input.openingBalance);
  let adjustments = new Prisma.Decimal(0);
  let income = new Prisma.Decimal(0);
  let expense = new Prisma.Decimal(0);
  let outgoingTransfers = new Prisma.Decimal(0);
  let incomingTransfers = new Prisma.Decimal(0);

  for (const entry of input.entries) {
    if (entry.deleted || entry.occurredOn < input.openingBalanceDate) continue;
    const entryMonth = toMonth(entry.occurredOn);
    const amount = new Prisma.Decimal(entry.amount);
    if (entryMonth < input.month) {
      opening =
        entry.kind === "INCOME" ? opening.plus(amount) : opening.minus(amount);
    } else if (entryMonth === input.month) {
      if (entry.kind === "INCOME") income = income.plus(amount);
      else expense = expense.plus(amount);
    }
  }

  for (const transfer of input.transfers) {
    if (transfer.deleted || transfer.occurredOn < input.openingBalanceDate) {
      continue;
    }
    const transferMonth = toMonth(transfer.occurredOn);
    const amount = new Prisma.Decimal(transfer.amount);
    if (transferMonth < input.month) {
      opening =
        transfer.direction === "INCOMING"
          ? opening.plus(amount)
          : opening.minus(amount);
    } else if (transferMonth === input.month) {
      if (transfer.direction === "INCOMING") {
        incomingTransfers = incomingTransfers.plus(amount);
      } else {
        outgoingTransfers = outgoingTransfers.plus(amount);
      }
    }
  }

  for (const adjustment of input.adjustments) {
    const amount = new Prisma.Decimal(adjustment.amount);
    if (adjustment.month < input.month) opening = opening.plus(amount);
    else if (adjustment.month === input.month) {
      adjustments = adjustments.plus(amount);
    }
  }

  const closing = opening
    .plus(adjustments)
    .plus(income)
    .minus(expense)
    .minus(outgoingTransfers)
    .plus(incomingTransfers);

  return {
    opening: opening.toFixed(2),
    adjustments: adjustments.toFixed(2),
    income: income.toFixed(2),
    expense: expense.toFixed(2),
    outgoingTransfers: outgoingTransfers.toFixed(2),
    incomingTransfers: incomingTransfers.toFixed(2),
    closing: closing.toFixed(2),
  };
}
