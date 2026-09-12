import { beforeEach, expect, test, vi } from "vitest";
import {
  createFinancialEntry,
  createFinancialTransfer,
  setFinancialEntryDeleted,
  setFinancialTransferDeleted,
  updateFinancialEntry,
  updateFinancialTransfer,
} from "@/features/entries/data";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  accountFindFirst: vi.fn(),
  accountFindMany: vi.fn(),
  categoryFindFirst: vi.fn(),
  entryCreate: vi.fn(),
  entryUpdateMany: vi.fn(),
  transferCreate: vi.fn(),
  transferUpdateMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/db/prisma", () => ({
  getPrisma: () => ({
    financialAccount: {
      findFirst: mocks.accountFindFirst,
      findMany: mocks.accountFindMany,
    },
    category: { findFirst: mocks.categoryFindFirst },
    financialEntry: {
      create: mocks.entryCreate,
      updateMany: mocks.entryUpdateMany,
    },
    financialTransfer: {
      create: mocks.transferCreate,
      updateMany: mocks.transferUpdateMany,
    },
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
    openingBalanceDate: new Date("2026-09-01T00:00:00.000Z"),
  });
  mocks.accountFindMany.mockResolvedValue([
    { openingBalanceDate: new Date("2026-09-01T00:00:00.000Z") },
    { openingBalanceDate: new Date("2026-09-05T00:00:00.000Z") },
  ]);
  mocks.categoryFindFirst.mockResolvedValue({ id: "categoria-1" });
  mocks.entryCreate.mockResolvedValue({ id: "lancamento-1" });
  mocks.entryUpdateMany.mockResolvedValue({ count: 1 });
  mocks.transferCreate.mockResolvedValue({ id: "transferencia-1" });
  mocks.transferUpdateMany.mockResolvedValue({ count: 1 });
});

test("lançamento valida referências e deriva o proprietário da sessão", async () => {
  const input = {
    description: "Mercado",
    kind: "EXPENSE" as const,
    amount: "100.00",
    occurredOn: "2026-09-10",
    financialAccountId: "conta-1",
    categoryId: "categoria-1",
  };
  expect(await createFinancialEntry(input)).toBe("created");
  expect(mocks.accountFindFirst).toHaveBeenCalledWith({
    where: {
      id: "conta-1",
      userId: "usuario-da-sessao",
      archivedAt: null,
    },
    select: { openingBalanceDate: true },
  });
  expect(mocks.categoryFindFirst).toHaveBeenCalledWith({
    where: {
      id: "categoria-1",
      userId: "usuario-da-sessao",
      kind: "EXPENSE",
      archivedAt: null,
    },
    select: { id: true },
  });
  expect(mocks.entryCreate).toHaveBeenCalledWith({
    data: {
      userId: "usuario-da-sessao",
      financialAccountId: "conta-1",
      categoryId: "categoria-1",
      kind: "EXPENSE",
      description: "Mercado",
      amount: "100.00",
      occurredOn: new Date("2026-09-10T00:00:00.000Z"),
    },
    select: { id: true },
  });
});

test("referência inválida impede criação sem revelar outro usuário", async () => {
  mocks.categoryFindFirst.mockResolvedValue(null);
  const result = await createFinancialEntry({
    description: "Mercado",
    kind: "EXPENSE",
    amount: "100.00",
    occurredOn: "2026-09-10",
    financialAccountId: "conta-1",
    categoryId: "categoria-de-outro-usuario",
  });
  expect(result).toBe("invalid-reference");
  expect(mocks.entryCreate).not.toHaveBeenCalled();
});

test("data anterior ao saldo de abertura impede o lançamento", async () => {
  mocks.accountFindFirst.mockResolvedValue({
    openingBalanceDate: new Date("2026-09-11T00:00:00.000Z"),
  });
  const result = await createFinancialEntry({
    description: "Registro antigo",
    kind: "INCOME",
    amount: "100.00",
    occurredOn: "2026-09-10",
    financialAccountId: "conta-1",
    categoryId: null,
  });
  expect(result).toBe("invalid-reference");
  expect(mocks.entryCreate).not.toHaveBeenCalled();
});

test("edição e remoção de lançamento combinam id e proprietário", async () => {
  await updateFinancialEntry("lancamento-1", {
    description: "Mercado semanal",
    kind: "EXPENSE",
    amount: "90.00",
    occurredOn: "2026-09-09",
    financialAccountId: "conta-1",
    categoryId: null,
  });
  await setFinancialEntryDeleted("lancamento-1", true);
  expect(mocks.entryUpdateMany).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      where: { id: "lancamento-1", userId: "usuario-da-sessao" },
    }),
  );
  expect(mocks.entryUpdateMany).toHaveBeenNthCalledWith(2, {
    where: { id: "lancamento-1", userId: "usuario-da-sessao" },
    data: { deletedAt: expect.any(Date) },
  });
});

test("transferência valida duas contas ativas do proprietário", async () => {
  const input = {
    description: "Reserva",
    amount: "200.00",
    occurredOn: "2026-09-10",
    sourceAccountId: "conta-1",
    destinationAccountId: "conta-2",
  };
  expect(await createFinancialTransfer(input)).toBe("created");
  expect(mocks.accountFindMany).toHaveBeenCalledWith({
    where: {
      id: { in: ["conta-1", "conta-2"] },
      userId: "usuario-da-sessao",
      archivedAt: null,
    },
    select: { openingBalanceDate: true },
  });
  expect(mocks.transferCreate).toHaveBeenCalledWith({
    data: {
      userId: "usuario-da-sessao",
      sourceAccountId: "conta-1",
      destinationAccountId: "conta-2",
      description: "Reserva",
      amount: "200.00",
      occurredOn: new Date("2026-09-10T00:00:00.000Z"),
    },
    select: { id: true },
  });
});

test("edição e remoção de transferência combinam id e proprietário", async () => {
  await updateFinancialTransfer("transferencia-1", {
    description: "Reserva ajustada",
    amount: "180.00",
    occurredOn: "2026-09-09",
    sourceAccountId: "conta-1",
    destinationAccountId: "conta-2",
  });
  await setFinancialTransferDeleted("transferencia-1", false);
  expect(mocks.transferUpdateMany).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      where: { id: "transferencia-1", userId: "usuario-da-sessao" },
    }),
  );
  expect(mocks.transferUpdateMany).toHaveBeenNthCalledWith(2, {
    where: { id: "transferencia-1", userId: "usuario-da-sessao" },
    data: { deletedAt: null },
  });
});
