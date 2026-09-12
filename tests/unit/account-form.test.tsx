import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { AccountForm } from "@/features/accounts/account-form";

vi.mock("@/features/accounts/actions", () => ({
  createFinancialAccountAction: vi.fn(),
  updateFinancialAccountAction: vi.fn(),
}));

test("separa a identificação da conta e o saldo inicial em duas etapas", () => {
  render(<AccountForm />);

  expect(screen.getByText("Etapa 1 de 2")).toBeVisible();
  expect(screen.getByLabelText("Nome")).toBeVisible();
  expect(screen.queryByLabelText("Saldo inicial")).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText("Nome"), {
    target: { value: "Conta principal" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Continuar para saldo inicial" }),
  );

  expect(screen.getByText("Etapa 2 de 2")).toBeVisible();
  expect(screen.getByLabelText("Saldo inicial")).toHaveValue("R$ 0,00");
  expect(screen.getByRole("button", { name: "Criar conta" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Voltar" })).toBeVisible();
});
