import { beforeEach, expect, test, vi } from "vitest";
import { saveBalanceCorrection } from "@/features/dashboard/data";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  accountFindFirst: vi.fn(),
  adjustmentUpsert: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/db/prisma", () => ({
  getPrisma: () => ({
    financialAccount: { findFirst: mocks.accountFindFirst },
    balanceAdjustment: { upsert: mocks.adjustmentUpsert },
  }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireUser.mockResolvedValue({
    id: "usuario-da-sessao",
    name: "Pessoa",
    email: "pessoa@example.com",
  });
  mocks.accountFindFirst.mockResolvedValue({
    id: "conta-1",
    openingBalance: "500.00",
    openingBalanceDate: new Date("2026-08-01T00:00:00.000Z"),
    financialEntries: [
      {
        kind: "INCOME",
        amount: "50.00",
        occurredOn: new Date("2026-08-10T00:00:00.000Z"),
      },
    ],
    outgoingTransfers: [],
    incomingTransfers: [],
    balanceAdjustments: [],
  });
  mocks.adjustmentUpsert.mockResolvedValue({ id: "ajuste-1" });
});

test("correção valida a conta do usuário e salva somente a diferença", async () => {
  expect(
    await saveBalanceCorrection({
      financialAccountId: "conta-1",
      month: "2026-09",
      actualBalance: "525.00",
    }),
  ).toBe("saved");

  expect(mocks.accountFindFirst).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        id: "conta-1",
        userId: "usuario-da-sessao",
        archivedAt: null,
      }),
    }),
  );
  const upsert = mocks.adjustmentUpsert.mock.calls[0][0];
  expect(upsert.create.userId).toBe("usuario-da-sessao");
  expect(upsert.create.expectedBalance.toFixed(2)).toBe("550.00");
  expect(upsert.create.actualBalance.toFixed(2)).toBe("525.00");
  expect(upsert.create.amount.toFixed(2)).toBe("-25.00");
  expect(upsert.update.amount.toFixed(2)).toBe("-25.00");
});

test("conta ausente ou de outro usuário não cria ajuste", async () => {
  mocks.accountFindFirst.mockResolvedValue(null);

  expect(
    await saveBalanceCorrection({
      financialAccountId: "conta-alheia",
      month: "2026-09",
      actualBalance: "525.00",
    }),
  ).toBe("not-found");
  expect(mocks.adjustmentUpsert).not.toHaveBeenCalled();
});
