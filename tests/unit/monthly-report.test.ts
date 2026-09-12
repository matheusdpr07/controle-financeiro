import { describe, expect, test } from "vitest";
import {
  calculateAccountMonth,
  getCurrentMonth,
  getMonthRange,
  monthSchema,
} from "@/features/dashboard/month";

describe("período mensal", () => {
  test("determina o mês civil de São Paulo", () => {
    expect(getCurrentMonth(new Date("2026-10-01T01:00:00.000Z"))).toBe(
      "2026-09",
    );
  });

  test("valida o parâmetro e cria limites UTC sem alterar o dia civil", () => {
    expect(monthSchema.parse("2026-09")).toBe("2026-09");
    expect(monthSchema.safeParse("2026-13").success).toBe(false);

    const range = getMonthRange("2026-01");
    expect(range.start.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-02-01T00:00:00.000Z");
    expect(range.previous).toBe("2025-12");
    expect(range.next).toBe("2026-02");
    expect(range.label).toBe("janeiro de 2026");
  });
});

describe("cálculo mensal por conta", () => {
  test("usa o saldo de abertura no primeiro mês e mantém os movimentos separados", () => {
    const report = calculateAccountMonth({
      month: "2026-09",
      openingBalance: "1000.00",
      openingBalanceDate: "2026-09-10",
      entries: [
        { occurredOn: "2026-09-12", kind: "INCOME", amount: "300.50" },
        { occurredOn: "2026-09-20", kind: "EXPENSE", amount: "80.25" },
      ],
      transfers: [
        { occurredOn: "2026-09-21", direction: "OUTGOING", amount: "50.00" },
        { occurredOn: "2026-09-22", direction: "INCOMING", amount: "20.00" },
      ],
      adjustments: [],
    });

    expect(report).toEqual({
      opening: "1000.00",
      adjustments: "0.00",
      income: "300.50",
      expense: "80.25",
      outgoingTransfers: "50.00",
      incomingTransfers: "20.00",
      closing: "1190.25",
    });
  });

  test("carrega o fechamento anterior e exibe a correção do mês como ajuste", () => {
    const report = calculateAccountMonth({
      month: "2026-09",
      openingBalance: "500.00",
      openingBalanceDate: "2026-07-01",
      entries: [
        { occurredOn: "2026-07-02", kind: "INCOME", amount: "100.00" },
        { occurredOn: "2026-08-02", kind: "EXPENSE", amount: "40.00" },
        { occurredOn: "2026-09-03", kind: "EXPENSE", amount: "25.00" },
      ],
      transfers: [
        { occurredOn: "2026-08-05", direction: "INCOMING", amount: "10.00" },
      ],
      adjustments: [
        { month: "2026-08", amount: "5.00" },
        { month: "2026-09", amount: "-20.00" },
      ],
    });

    expect(report.opening).toBe("575.00");
    expect(report.adjustments).toBe("-20.00");
    expect(report.expense).toBe("25.00");
    expect(report.closing).toBe("530.00");
  });

  test("não inclui registros removidos nem valores posteriores ao mês", () => {
    const report = calculateAccountMonth({
      month: "2026-09",
      openingBalance: "100.00",
      openingBalanceDate: "2026-09-01",
      entries: [
        {
          occurredOn: "2026-09-02",
          kind: "INCOME",
          amount: "50.00",
          deleted: true,
        },
        { occurredOn: "2026-10-01", kind: "INCOME", amount: "90.00" },
      ],
      transfers: [],
      adjustments: [],
    });

    expect(report.closing).toBe("100.00");
  });
});
