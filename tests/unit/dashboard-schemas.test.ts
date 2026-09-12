import { describe, expect, test } from "vitest";
import { balanceCorrectionSchema } from "@/features/dashboard/schemas";

describe("correção de saldo mensal", () => {
  test("aceita saldo real positivo, zero ou negativo e normaliza o decimal", () => {
    expect(
      balanceCorrectionSchema.parse({
        financialAccountId: "account-1",
        month: "2026-09",
        actualBalance: "1234,56",
      }).actualBalance,
    ).toBe("1234.56");
    expect(
      balanceCorrectionSchema.parse({
        financialAccountId: "account-1",
        month: "2026-09",
        actualBalance: "-25,10",
      }).actualBalance,
    ).toBe("-25.10");
  });

  test("rejeita período, conta e valor inválidos", () => {
    expect(
      balanceCorrectionSchema.safeParse({
        financialAccountId: "",
        month: "2026-13",
        actualBalance: "12,345",
      }).success,
    ).toBe(false);
  });
});
