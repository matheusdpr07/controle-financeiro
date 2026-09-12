import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "@/app/page";

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
});
