import { describe, expect, test } from "vitest";
import { financialAccountSchema } from "@/features/accounts/schemas";
import { categorySchema } from "@/features/categories/schemas";
import {
  financialEntrySchema,
  financialTransferSchema,
} from "@/features/entries/schemas";
import { formatBrlAmount, normalizeMoneyInput } from "@/lib/money";

describe("valores monetários", () => {
  test.each([
    ["0", "0.00"],
    ["-0,00", "0.00"],
    ["0012,3", "12.30"],
    ["99999999999999999.99", "99999999999999999.99"],
    ["-1234.56", "-1234.56"],
  ])("normaliza %s sem converter para ponto flutuante", (input, expected) => {
    expect(normalizeMoneyInput(input)).toBe(expected);
  });

  test.each(["", "1.234,56", "1,234", "--1", "1e3", "100000000000000000"])(
    "rejeita valor fora de DECIMAL(19,2): %s",
    (input) => expect(normalizeMoneyInput(input)).toBeNull(),
  );

  test("formata BRL preservando todos os dígitos", () => {
    expect(formatBrlAmount("12345678901234567.89")).toBe(
      "R$ 12.345.678.901.234.567,89",
    );
    expect(formatBrlAmount("-12.30")).toBe("-R$ 12,30");
  });
});

describe("entradas financeiras", () => {
  test("normaliza conta e descarta identidade enviada pelo navegador", () => {
    expect(
      financialAccountSchema.parse({
        name: "  Conta principal  ",
        type: "CHECKING",
        openingBalance: "1234,5",
        openingBalanceDate: "2026-09-10",
        userId: "outro-usuario",
        currencyCode: "USD",
      }),
    ).toEqual({
      name: "Conta principal",
      type: "CHECKING",
      openingBalance: "1234.50",
      openingBalanceDate: "2026-09-10",
    });
  });

  test.each([
    { type: "CREDIT_CARD" },
    { openingBalance: "1,999" },
    { openingBalanceDate: "2026-02-30" },
    { name: "a" },
  ])("rejeita conta inválida: %j", (change) => {
    expect(
      financialAccountSchema.safeParse({
        name: "Conta",
        type: "CASH",
        openingBalance: "0",
        openingBalanceDate: "2026-09-10",
        ...change,
      }).success,
    ).toBe(false);
  });

  test("normaliza categoria e descarta identidade externa", () => {
    expect(
      categorySchema.parse({
        name: "  Alimentação  ",
        kind: "EXPENSE",
        userId: "outro-usuario",
      }),
    ).toEqual({ name: "Alimentação", kind: "EXPENSE" });
  });

  test.each([{ kind: "TRANSFER" }, { name: "a" }, { name: "a".repeat(101) }])(
    "rejeita categoria inválida: %j",
    (change) => {
      expect(
        categorySchema.safeParse({
          name: "Salário",
          kind: "INCOME",
          ...change,
        }).success,
      ).toBe(false);
    },
  );
});

describe("lançamentos pessoais", () => {
  test("normaliza receita e descarta campos externos", () => {
    expect(
      financialEntrySchema.parse({
        description: "  Pagamento mensal  ",
        kind: "INCOME",
        amount: "2500,5",
        occurredOn: "2026-09-10",
        financialAccountId: "conta-1",
        categoryId: "",
        userId: "outro-usuario",
      }),
    ).toEqual({
      description: "Pagamento mensal",
      kind: "INCOME",
      amount: "2500.50",
      occurredOn: "2026-09-10",
      financialAccountId: "conta-1",
      categoryId: null,
    });
  });

  test.each(["0", "-1", "1,999", "100000000000000000"])(
    "rejeita valor de lançamento inválido: %s",
    (amount) => {
      expect(
        financialEntrySchema.safeParse({
          description: "Mercado",
          kind: "EXPENSE",
          amount,
          occurredOn: "2026-09-10",
          financialAccountId: "conta-1",
          categoryId: "categoria-1",
        }).success,
      ).toBe(false);
    },
  );

  test("valida transferência como registro entre contas diferentes", () => {
    expect(
      financialTransferSchema.parse({
        description: "  Reserva do mês  ",
        amount: "100,00",
        occurredOn: "2026-09-10",
        sourceAccountId: "conta-1",
        destinationAccountId: "conta-2",
        userId: "outro-usuario",
      }),
    ).toEqual({
      description: "Reserva do mês",
      amount: "100.00",
      occurredOn: "2026-09-10",
      sourceAccountId: "conta-1",
      destinationAccountId: "conta-2",
    });
    expect(
      financialTransferSchema.safeParse({
        description: "Reserva",
        amount: "100",
        occurredOn: "2026-09-10",
        sourceAccountId: "conta-1",
        destinationAccountId: "conta-1",
      }).success,
    ).toBe(false);
  });
});
