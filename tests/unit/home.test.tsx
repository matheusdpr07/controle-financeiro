import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "@/app/page";

test("apresenta a fundação sem simular funcionalidades financeiras", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Controle Financeiro" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("A fundação do projeto está configurada."),
  ).toBeInTheDocument();
});
