// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
import { getClientEnv, getServerEnv } from "@/lib/env";

afterEach(() => vi.unstubAllEnvs());

test("informa o nome das variáveis ausentes sem precisar conectar ao banco", () => {
  vi.stubEnv("DATABASE_URL", undefined);
  vi.stubEnv("BETTER_AUTH_SECRET", undefined);
  expect(() => getServerEnv()).toThrow(/DATABASE_URL/);
  expect(() => getServerEnv()).toThrow(/BETTER_AUTH_SECRET/);
});

test("expõe ao cliente somente a URL pública validada", () => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  vi.stubEnv("BETTER_AUTH_SECRET", "segredo-privado-de-teste-nao-utilizado");
  expect(getClientEnv()).toEqual({
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  });
});

test.each([
  "javascript:alert(1)",
  "não-é-uma-url",
  "",
  "https://example.com/caminho",
  "https://usuario:senha@example.com",
])("rejeita uma origem pública inválida: %s", (url) => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", url);
  expect(() => getClientEnv()).toThrow(/NEXT_PUBLIC_APP_URL/);
});

test("valida servidor e exige HTTPS em produção, sem expor valores privados", () => {
  vi.stubEnv(
    "DATABASE_URL",
    "mysql://unit-test:unit-test-only@localhost:3306/unit_test",
  );
  vi.stubEnv("BETTER_AUTH_SECRET", "segredo-exclusivo-de-teste-sem-conexao");
  vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  vi.stubEnv("NODE_ENV", "test");
  expect(getServerEnv().NODE_ENV).toBe("test");
  vi.stubEnv("NODE_ENV", "production");
  expect(() => getServerEnv()).toThrow(/Use HTTPS em produção/);
  vi.stubEnv(
    "DATABASE_URL",
    "mysql://%XX:unit-test-only@localhost:3306/unit_test",
  );
  expect(() => getServerEnv()).toThrow(/DATABASE_URL/);
  expect(() => getServerEnv()).not.toThrow(/unit-test-only/);
});
