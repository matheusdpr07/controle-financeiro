import { describe, expect, test } from "vitest";
import { signInSchema, signUpSchema } from "@/features/auth/schemas";

const credentials = {
  name: "  Maria Silva  ",
  email: "  MARIA@example.com  ",
  password: "  minha senha longa  ",
};

describe("entradas de autenticação", () => {
  test("normaliza nome/e-mail, preserva a senha e descarta propriedades extras", () => {
    expect(
      signUpSchema.parse({ ...credentials, userId: "outro-usuario" }),
    ).toEqual({
      name: "Maria Silva",
      email: "maria@example.com",
      password: credentials.password,
    });
  });

  test.each([
    { name: " " },
    { name: "a".repeat(101) },
    { email: "invalido" },
    { email: 123 },
    { password: "a".repeat(11) },
    { password: "a".repeat(129) },
    { password: null },
  ])("rejeita cadastro inválido: %j", (input) => {
    expect(signUpSchema.safeParse({ ...credentials, ...input }).success).toBe(
      false,
    );
  });

  test("aceita os limites de senha no cadastro", () => {
    for (const length of [12, 128]) {
      expect(
        signUpSchema.safeParse({ ...credentials, password: "a".repeat(length) })
          .success,
      ).toBe(true);
    }
  });

  test("login admite senhas existentes menores, mas rejeita senha vazia ou excessiva", () => {
    expect(
      signInSchema.safeParse({ ...credentials, password: "curta" }).success,
    ).toBe(true);
    for (const password of ["", "a".repeat(129)]) {
      expect(signInSchema.safeParse({ ...credentials, password }).success).toBe(
        false,
      );
    }
  });
});
