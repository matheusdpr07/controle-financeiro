import { beforeEach, expect, test, vi } from "vitest";
import {
  createFinancialAccount,
  setFinancialAccountArchived,
  updateFinancialAccount,
} from "@/features/accounts/data";
import {
  createCategory,
  setCategoryArchived,
  updateCategory,
} from "@/features/categories/data";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  financialCreate: vi.fn(),
  financialUpdateMany: vi.fn(),
  categoryCreate: vi.fn(),
  categoryUpdateMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/db/prisma", () => ({
  getPrisma: () => ({
    financialAccount: {
      create: mocks.financialCreate,
      updateMany: mocks.financialUpdateMany,
    },
    category: {
      create: mocks.categoryCreate,
      updateMany: mocks.categoryUpdateMany,
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
  mocks.financialCreate.mockResolvedValue({ id: "conta" });
  mocks.categoryCreate.mockResolvedValue({ id: "categoria" });
  mocks.financialUpdateMany.mockResolvedValue({ count: 1 });
  mocks.categoryUpdateMany.mockResolvedValue({ count: 1 });
});

test("criações derivam o proprietário exclusivamente da sessão", async () => {
  await createFinancialAccount({
    name: "Conta",
    type: "CHECKING",
    openingBalance: "10.00",
    openingBalanceDate: "2026-09-10",
  });
  await createCategory({ name: "Mercado", kind: "EXPENSE" });

  expect(mocks.financialCreate).toHaveBeenCalledWith({
    data: {
      userId: "usuario-da-sessao",
      name: "Conta",
      type: "CHECKING",
      currencyCode: "BRL",
      openingBalance: "10.00",
      openingBalanceDate: new Date("2026-09-10T00:00:00.000Z"),
    },
    select: { id: true },
  });
  expect(mocks.categoryCreate).toHaveBeenCalledWith({
    data: {
      userId: "usuario-da-sessao",
      name: "Mercado",
      kind: "EXPENSE",
    },
    select: { id: true },
  });
});

test("edições combinam o identificador com o proprietário da sessão", async () => {
  await updateFinancialAccount("conta-alvo", {
    name: "Reserva",
    type: "SAVINGS",
    openingBalance: "20.00",
    openingBalanceDate: "2026-09-09",
  });
  await updateCategory("categoria-alvo", {
    name: "Supermercado",
    kind: "EXPENSE",
  });

  expect(mocks.financialUpdateMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { id: "conta-alvo", userId: "usuario-da-sessao" },
    }),
  );
  expect(mocks.categoryUpdateMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { id: "categoria-alvo", userId: "usuario-da-sessao" },
    }),
  );
});

test("arquivamento também exige sessão e propriedade", async () => {
  await setFinancialAccountArchived("conta-alvo", true);
  await setCategoryArchived("categoria-alvo", false);

  expect(mocks.financialUpdateMany).toHaveBeenCalledWith({
    where: { id: "conta-alvo", userId: "usuario-da-sessao" },
    data: { archivedAt: expect.any(Date) },
  });
  expect(mocks.categoryUpdateMany).toHaveBeenCalledWith({
    where: { id: "categoria-alvo", userId: "usuario-da-sessao" },
    data: { archivedAt: null },
  });
});
