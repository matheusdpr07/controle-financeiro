import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { AuthForm } from "@/features/auth/auth-form";
import { SignOutButton } from "@/features/auth/sign-out-button";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => mocks }));
vi.mock("@/lib/auth/client", () => ({
  getAuthClient: () => ({
    signIn: { email: mocks.signIn },
    signUp: { email: mocks.signUp },
    signOut: mocks.signOut,
  }),
}));

beforeEach(() => vi.resetAllMocks());

function fillCredentials() {
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: "MARIA@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: "  minha senha longa  " },
  });
}

test("cadastro envia credenciais normalizadas e abre a área autenticada", async () => {
  mocks.signUp.mockResolvedValue({ data: {}, error: null });
  render(<AuthForm mode="sign-up" />);
  fillCredentials();
  fireEvent.change(screen.getByLabelText("Nome"), {
    target: { value: "  Maria Silva  " },
  });
  fireEvent.click(screen.getByRole("button", { name: "Criar acesso" }));
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/area"));
  expect(mocks.signUp).toHaveBeenCalledWith({
    name: "Maria Silva",
    email: "maria@example.com",
    password: "  minha senha longa  ",
  });
  expect(mocks.refresh).toHaveBeenCalledOnce();
});

test("bloqueia submissões repetidas e não revela a existência do e-mail", async () => {
  let resolveRequest!: (value: {
    error: { status: number; code: string; message: string };
  }) => void;
  mocks.signIn.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
  );
  render(<AuthForm mode="sign-in" />);
  fillCredentials();
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
  const pendingButton = screen.getByRole("button", { name: "Aguarde…" });
  expect(pendingButton).toBeDisabled();
  fireEvent.click(pendingButton);
  expect(mocks.signIn).toHaveBeenCalledOnce();
  resolveRequest({
    error: { status: 401, code: "USER_NOT_FOUND", message: "User not found" },
  });
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Confira seu e-mail e sua senha.",
  );
  expect(mocks.replace).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
});

test("apresenta a limitação de tentativas", async () => {
  mocks.signIn.mockResolvedValue({ error: { status: 429 } });
  render(<AuthForm mode="sign-in" />);
  fillCredentials();
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Muitas tentativas",
  );
  expect(mocks.replace).not.toHaveBeenCalled();
});

test("recupera o formulário após falha de conexão", async () => {
  mocks.signIn.mockRejectedValue(new Error("offline"));
  render(<AuthForm mode="sign-in" />);
  fillCredentials();
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível conectar",
  );
  expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
});

test("logout só redireciona depois da confirmação do servidor", async () => {
  mocks.signOut
    .mockResolvedValueOnce({ error: { status: 500 } })
    .mockResolvedValueOnce({ error: null });
  render(<SignOutButton />);
  fireEvent.click(screen.getByRole("button", { name: "Sair" }));
  await screen.findByRole("alert");
  expect(mocks.replace).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Sair" }));
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/entrar"));
  expect(mocks.refresh).toHaveBeenCalledOnce();
});
