import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import Home from "@/app/page";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

test("apresenta a proposta do produto e os caminhos de acesso", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Entenda para onde seu dinheiro vai.",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Sem conexão bancária e sem movimentar dinheiro."),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Começar agora" })).toHaveAttribute(
    "href",
    "/cadastro",
  );
  expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
    "href",
    "/entrar",
  );
  expect(
    screen.getByRole("button", { name: "Tema automático" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "Do saldo inicial ao fechamento.",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "Cada valor no lugar que faz sentido.",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "Entrou, saiu ou mudou de conta.",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "A realidade muda. Seu histórico explica.",
    }),
  ).toBeInTheDocument();
});
