import { beforeEach, expect, test, vi } from "vitest";
import { requireUser } from "@/lib/auth/session";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));

beforeEach(() => vi.resetAllMocks());

test("sem sessão válida redireciona para entrar", async () => {
  mocks.headers.mockResolvedValue(new Headers());
  mocks.getSession.mockResolvedValue(null);
  mocks.redirect.mockImplementation(() => {
    throw new Error("redirect");
  });
  await expect(requireUser()).rejects.toThrow("redirect");
  expect(mocks.redirect).toHaveBeenCalledWith("/entrar");
});

test("retorna somente a identidade explícita da sessão validada no servidor", async () => {
  const headers = new Headers({ cookie: "cookie-de-teste" });
  mocks.headers.mockResolvedValue(headers);
  mocks.getSession.mockResolvedValue({
    session: { token: "token-privado" },
    user: {
      id: "id-da-sessao",
      name: "Maria",
      email: "maria@example.com",
      emailVerified: false,
      createdAt: new Date(),
    },
  });
  expect(await requireUser()).toEqual({
    id: "id-da-sessao",
    name: "Maria",
    email: "maria@example.com",
  });
  expect(mocks.getSession).toHaveBeenCalledWith({ headers });
  expect(mocks.redirect).not.toHaveBeenCalled();
});
