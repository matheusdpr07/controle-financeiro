// @vitest-environment node
import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { expect, test, vi } from "vitest";
import { authOptions } from "@/lib/auth/options";
import { validateAuthInput } from "@/lib/auth/validation";

vi.mock("server-only", () => ({}));

let nextClientIP = 1;

function createTestAuth() {
  const database: Record<string, Record<string, unknown>[]> = {
    user: [],
    session: [],
    account: [],
    verification: [],
  };
  const auth = betterAuth({
    ...authOptions,
    baseURL: "http://localhost:3000",
    secret: randomBytes(32).toString("base64"),
    database: memoryAdapter(database),
    hooks: { before: validateAuthInput },
    advanced: { disableOriginCheck: false },
    rateLimit: { enabled: true },
    logger: { disabled: true },
  });
  const clientIP = `192.0.2.${nextClientIP++}`;
  function post(path: string, body: unknown, origin = "http://localhost:3000") {
    return auth.handler(
      new Request(`http://localhost:3000/api/auth${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin,
          "x-forwarded-for": clientIP,
        },
        body: JSON.stringify(body),
      }),
    );
  }
  return { database, post };
}

test("o handler rejeita nome inválido mesmo sem a validação HTML", async () => {
  const { database, post } = createTestAuth();
  const response = await post("/sign-up/email", {
    name: " ",
    email: "maria@example.com",
    password: "uma senha longa",
  });
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({ code: "INVALID_AUTH_INPUT" });
  expect(database.user).toHaveLength(0);
});

test("o handler persiste nome/e-mail normalizados e ignora identidade enviada", async () => {
  const { database, post } = createTestAuth();
  const response = await post("/sign-up/email", {
    name: "  Maria Silva  ",
    email: "MARIA@example.com",
    password: "uma senha longa",
    userId: "identidade-injetada",
    emailVerified: true,
  });
  expect(response.status).toBe(200);
  expect(database.user).toHaveLength(1);
  expect(database.user[0]).toMatchObject({
    name: "Maria Silva",
    email: "maria@example.com",
    emailVerified: false,
  });
  expect(database.user[0].id).not.toBe("identidade-injetada");
  expect(database.account[0].password).not.toBe("uma senha longa");
  expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/i);
});

test("o handler mantém a proteção de origem", async () => {
  const { database, post } = createTestAuth();
  const response = await post(
    "/sign-up/email",
    {
      name: "Maria",
      email: "maria@example.com",
      password: "uma senha longa",
    },
    "https://origem-externa.example",
  );
  expect(response.status).toBe(403);
  expect(database.user).toHaveLength(0);
});

test("o handler limita tentativas de login via HTTP", async () => {
  const { post } = createTestAuth();
  const statuses: number[] = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await post("/sign-in/email", {
      email: "maria@example.com",
      password: "",
    });
    statuses.push(response.status);
    if (attempt === 3)
      expect(response.headers.get("x-retry-after")).toBeTruthy();
  }
  expect(statuses).toEqual([400, 400, 400, 429]);
});
