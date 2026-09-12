import { render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { AuthShell } from "@/components/auth-shell";
import { PrivateShell } from "@/components/private-shell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

test("o shell privado expõe as seções e identifica a página atual", () => {
  render(
    <PrivateShell current="contas">
      <h1>Contas</h1>
    </PrivateShell>,
  );

  const navigation = screen.getByRole("navigation", {
    name: "Navegação principal",
  });
  expect(
    within(navigation).getByRole("link", { name: "Início" }),
  ).toHaveAttribute("href", "/area");
  expect(
    within(navigation).getByRole("link", { name: "Contas" }),
  ).toHaveAttribute("aria-current", "page");
  expect(
    within(navigation).getByRole("link", { name: "Categorias" }),
  ).toHaveAttribute("href", "/categorias");
  expect(
    within(navigation).getByRole("link", { name: "Lançamentos" }),
  ).toHaveAttribute("href", "/lancamentos");
  expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
});

test("o shell de autenticação mantém o caminho alternativo de acesso", () => {
  render(
    <AuthShell
      title="Entrar"
      description="Acesse com seu e-mail e sua senha."
      alternateText="Ainda não tem acesso?"
      alternateLabel="Criar acesso"
      alternateHref="/cadastro"
    >
      <form aria-label="Formulário de entrada" />
    </AuthShell>,
  );

  expect(
    screen.getByRole("heading", { level: 1, name: "Entrar" }),
  ).toBeVisible();
  expect(screen.getByRole("main")).toContainElement(
    screen.getByRole("form", { name: "Formulário de entrada" }),
  );
  expect(screen.getByRole("link", { name: "Criar acesso" })).toHaveAttribute(
    "href",
    "/cadastro",
  );
  expect(
    screen.getByRole("link", { name: "Controle Financeiro — início" }),
  ).toHaveAttribute("href", "/");
});
