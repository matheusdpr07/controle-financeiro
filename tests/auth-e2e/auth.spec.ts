import { randomUUID } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { getServerEnv } from "../../src/lib/env";

const env = getServerEnv();
const url = new URL(env.DATABASE_URL);
url.searchParams.set("timezone", "+00:00");
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url.toString()) });
const emails = [0, 1].map(() => `auth-e2e-${randomUUID()}@example.com`);
const password = `Teste-${randomUUID()}`;

test.beforeAll(async () => {
  const [server] = await prisma.$queryRaw<
    {
      version: string;
      databaseName: string;
      currentUser: string;
      timeZone: string;
    }[]
  >`SELECT VERSION() AS version, DATABASE() AS databaseName, CURRENT_USER() AS currentUser, @@session.time_zone AS timeZone`;
  expect(server.version).toMatch(/^8\.4\./);
  expect(server.databaseName).toBe("controle_financeiro");
  expect(server.currentUser).toMatch(/^controle_financeiro@/);
  expect(server.timeZone).toBe("+00:00");
});

test.afterAll(async () => {
  try {
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
  } finally {
    await prisma.$disconnect();
  }
});

async function signUp(page: Page, email: string, name: string) {
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Criar acesso" }).click();
  await expect(page).toHaveURL(/\/area$/);
}

test("MySQL: cadastro, isolamento, persistência, logout, login e expiração", async ({
  page,
  context,
  browser,
}) => {
  await page.goto("/area");
  await expect(page).toHaveURL(/\/entrar$/);
  await context.addCookies([
    {
      name: "better-auth.session_token",
      value: "sessao-forjada",
      url: "http://127.0.0.1:3101",
    },
  ]);
  await page.goto("/area");
  await expect(page).toHaveURL(/\/entrar$/);
  await context.clearCookies();

  await signUp(page, emails[0], "Primeira Pessoa");
  const firstUser = await prisma.user.findUniqueOrThrow({
    where: { email: emails[0] },
    include: { accounts: true, sessions: true },
  });
  expect(firstUser.accounts).toHaveLength(1);
  expect(firstUser.accounts[0].providerId).toBe("credential");
  expect(firstUser.accounts[0].password).toBeTruthy();
  expect(firstUser.accounts[0].password === password).toBe(false);
  expect(firstUser.sessions).toHaveLength(1);
  expect(firstUser.sessions[0].expiresAt.getTime()).toBeGreaterThan(Date.now());
  const sessionCookies = (await context.cookies()).filter((cookie) =>
    cookie.name.endsWith("session_token"),
  );
  expect(sessionCookies).toHaveLength(1);
  expect(sessionCookies[0].httpOnly).toBe(true);
  expect(sessionCookies[0].sameSite).toBe("Lax");
  await page.reload();
  await expect(page.getByText(emails[0], { exact: true })).toBeVisible();

  const secondContext = await browser.newContext({
    baseURL: "http://127.0.0.1:3101",
  });
  try {
    const secondPage = await secondContext.newPage();
    await signUp(secondPage, emails[1], "Segunda Pessoa");
    const secondUser = await prisma.user.findUniqueOrThrow({
      where: { email: emails[1] },
    });
    await page.goto(`/area?userId=${secondUser.id}`);
    await expect(page.getByText(emails[0], { exact: true })).toBeVisible();
    await expect(page.getByText(emails[1], { exact: true })).toHaveCount(0);
    await expect(
      secondPage.getByText(emails[1], { exact: true }),
    ).toBeVisible();
    await expect(secondPage.getByText(emails[0], { exact: true })).toHaveCount(
      0,
    );
  } finally {
    await secondContext.close();
  }

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/entrar$/);
  expect(await prisma.session.count({ where: { userId: firstUser.id } })).toBe(
    0,
  );
  await context.addCookies(sessionCookies);
  await page.goto("/area");
  await expect(page).toHaveURL(/\/entrar$/);
  await context.clearCookies();

  await page.getByLabel("E-mail").fill(emails[0]);
  await page.getByLabel("Senha", { exact: true }).fill("senha-incorreta");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText(/Confira seu e-mail e sua senha/)).toBeVisible();
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/area$/);
  await prisma.session.updateMany({
    where: { userId: firstUser.id },
    data: { expiresAt: new Date(Date.now() - 60_000) },
  });
  await page.reload();
  await expect(page).toHaveURL(/\/entrar$/);
});
