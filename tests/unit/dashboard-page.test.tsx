import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import AreaPage from "@/app/area/page";

const mocks = vi.hoisted(() => ({
  getMonthlyDashboard: vi.fn(),
}));

vi.mock("@/features/dashboard/data", () => ({
  getMonthlyDashboard: mocks.getMonthlyDashboard,
}));
vi.mock("@/features/dashboard/balance-correction-form", () => ({
  BalanceCorrectionForm: ({ accountName }: { accountName: string }) => (
    <div>Correção de {accountName}</div>
  ),
}));
vi.mock("@/components/private-shell", () => ({
  PrivateShell: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}));

const emptyReport = {
  opening: "0.00",
  adjustments: "0.00",
  income: "0.00",
  expense: "0.00",
  outgoingTransfers: "0.00",
  incomingTransfers: "0.00",
  closing: "0.00",
};

beforeEach(() => {
  vi.resetAllMocks();
});

test("orienta a criação da primeira conta quando o usuário ainda não começou", async () => {
  mocks.getMonthlyDashboard.mockResolvedValue({
    user: { name: "Pessoa", email: "pessoa@example.com" },
    hasAccounts: false,
    month: "2026-09",
    label: "setembro de 2026",
    previousMonth: "2026-08",
    nextMonth: "2026-10",
    canCorrect: true,
    accounts: [],
    summary: emptyReport,
  });

  render(await AreaPage({ searchParams: Promise.resolve({}) }));

  expect(screen.getByText("Etapa 1 de 2")).toBeVisible();
  expect(screen.getByRole("link", { name: "Começar agora" })).toHaveAttribute(
    "href",
    "/contas",
  );
  expect(screen.getByText("pessoa@example.com")).toBeVisible();
});

test("mostra o relatório mensal e a correção separada das movimentações", async () => {
  mocks.getMonthlyDashboard.mockResolvedValue({
    user: { name: "Pessoa", email: "pessoa@example.com" },
    hasAccounts: true,
    month: "2026-09",
    label: "setembro de 2026",
    previousMonth: "2026-08",
    nextMonth: "2026-10",
    canCorrect: true,
    accounts: [
      {
        id: "conta-1",
        name: "Conta principal",
        type: "CHECKING",
        archived: false,
        report: {
          ...emptyReport,
          opening: "1000.00",
          adjustments: "-20.00",
          income: "300.00",
          expense: "100.00",
          closing: "1180.00",
        },
        correction: {
          expectedBalance: "1000.00",
          actualBalance: "980.00",
          amount: "-20.00",
        },
      },
    ],
    summary: {
      ...emptyReport,
      opening: "1000.00",
      adjustments: "-20.00",
      income: "300.00",
      expense: "100.00",
      closing: "1180.00",
    },
  });

  render(
    await AreaPage({
      searchParams: Promise.resolve({ month: "2026-09" }),
    }),
  );

  expect(
    screen.getByRole("heading", { name: "Seu mês em equilíbrio." }),
  ).toBeVisible();
  expect(screen.getAllByText("Ajustes")).toHaveLength(2);
  expect(screen.getAllByText("-R$ 20,00")).toHaveLength(2);
  expect(screen.getByText("Correção de Conta principal")).toBeInTheDocument();
  expect(mocks.getMonthlyDashboard).toHaveBeenCalledWith("2026-09");
});
