import { randomUUID } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createMariaDbConnectionUrl } from "../../src/lib/db/mariadb-connection-url";
import { getServerEnv } from "../../src/lib/env";

const env = getServerEnv();
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(createMariaDbConnectionUrl(env.DATABASE_URL)),
});
const authE2EBaseURL = process.env.AUTH_E2E_BASE_URL ?? "http://127.0.0.1:3101";
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

async function createFinancialAccount(
  page: Page,
  name: string,
  openingBalance: string,
  openingBalanceDate: string,
) {
  const card = page
    .getByRole("heading", { name: "Nova conta" })
    .locator("..")
    .locator("..");
  await card.getByLabel("Nome", { exact: true }).fill(name);
  await card
    .getByRole("button", { name: "Continuar para saldo inicial" })
    .click();
  await card.getByLabel("Saldo inicial", { exact: true }).fill(openingBalance);
  await card
    .getByLabel("Data do saldo inicial", { exact: true })
    .fill(openingBalanceDate);
  await card.getByRole("button", { name: "Criar conta" }).click();
}

test("MySQL: autenticação, contas, categorias e isolamento entre usuários", async ({
  page,
  context,
  browser,
}) => {
  await page.goto("/area");
  await expect(page).toHaveURL(/\/entrar$/);
  for (const privatePath of ["/contas", "/categorias", "/lancamentos"]) {
    await page.goto(privatePath);
    await expect(page).toHaveURL(/\/entrar$/);
  }
  await context.addCookies([
    {
      name: "better-auth.session_token",
      value: "sessao-forjada",
      url: authE2EBaseURL,
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

  await page.goto("/contas");
  await createFinancialAccount(
    page,
    "Conta principal",
    "12345678901234567,89",
    "2026-09-10",
  );
  await expect(page.getByText("Conta criada.")).toBeVisible();
  const firstFinancialAccount = await prisma.financialAccount.findFirstOrThrow({
    where: { userId: firstUser.id, name: "Conta principal" },
  });
  expect(firstFinancialAccount.currencyCode).toBe("BRL");
  expect(firstFinancialAccount.openingBalance.toFixed(2)).toBe(
    "12345678901234567.89",
  );
  expect(firstFinancialAccount.openingBalanceDate.toISOString()).toBe(
    "2026-09-10T00:00:00.000Z",
  );

  await createFinancialAccount(page, "Conta principal", "0", "2026-09-10");
  await expect(
    page.getByText("Já existe uma conta com esse nome."),
  ).toBeVisible();

  const accountItem = page
    .getByRole("listitem")
    .filter({ hasText: "Conta principal" });
  await accountItem.getByText("Editar", { exact: true }).click();
  await accountItem
    .getByLabel("Nome", { exact: true })
    .fill("Reserva principal");
  await accountItem.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByText("Reserva principal", { exact: true }),
  ).toBeVisible();
  const renamedAccount = page
    .getByRole("listitem")
    .filter({ hasText: "Reserva principal" });
  await renamedAccount.getByRole("button", { name: "Arquivar" }).click();
  await expect(
    page.getByRole("heading", { name: "Contas arquivadas" }),
  ).toBeVisible();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Reserva principal" })
    .getByRole("button", { name: "Restaurar" })
    .click();
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "Reserva principal" })
      .getByRole("button", { name: "Arquivar" }),
  ).toBeVisible();

  await page.goto("/categorias");
  await page.getByLabel("Nome", { exact: true }).fill("Alimentação");
  await page.getByRole("button", { name: "Criar categoria" }).click();
  await expect(page.getByText("Categoria criada.")).toBeVisible();
  const firstCategory = await prisma.category.findFirstOrThrow({
    where: { userId: firstUser.id, name: "Alimentação" },
  });
  expect(firstCategory.kind).toBe("EXPENSE");

  await page.goto("/contas");
  await createFinancialAccount(page, "Carteira", "200,00", "2026-09-10");
  await expect(page.getByText("Conta criada.")).toBeVisible();
  const secondFinancialAccount = await prisma.financialAccount.findFirstOrThrow(
    {
      where: { userId: firstUser.id, name: "Carteira" },
    },
  );

  await page.goto("/lancamentos");
  const entryForm = page.locator("form").filter({
    has: page.getByRole("button", { name: "Criar lançamento" }),
  });
  await entryForm.getByLabel("Descrição").fill("Mercado semanal");
  await entryForm.getByLabel("Valor").fill("150,75");
  await entryForm
    .getByLabel("Conta", { exact: true })
    .selectOption(firstFinancialAccount.id);
  await entryForm.getByLabel("Categoria").selectOption(firstCategory.id);
  await entryForm.getByLabel("Data").fill("2026-09-10");
  await entryForm.getByRole("button", { name: "Criar lançamento" }).click();
  await expect(page.getByText("Lançamento criado.")).toBeVisible();
  const firstEntry = await prisma.financialEntry.findFirstOrThrow({
    where: { userId: firstUser.id, description: "Mercado semanal" },
  });
  expect(firstEntry.kind).toBe("EXPENSE");
  expect(firstEntry.amount.toFixed(2)).toBe("150.75");
  expect(firstEntry.occurredOn.toISOString()).toBe("2026-09-10T00:00:00.000Z");
  expect(firstEntry.financialAccountId).toBe(firstFinancialAccount.id);
  expect(firstEntry.categoryId).toBe(firstCategory.id);
  await expect(
    prisma.financialEntry.create({
      data: {
        userId: firstUser.id,
        financialAccountId: firstFinancialAccount.id,
        kind: "EXPENSE",
        description: "Valor inválido",
        amount: "0",
        occurredOn: new Date("2026-09-10T00:00:00.000Z"),
      },
    }),
  ).rejects.toThrow();

  const entryItem = page
    .getByRole("listitem")
    .filter({ hasText: "Mercado semanal" });
  await entryItem.getByText("Editar", { exact: true }).click();
  await entryItem.getByLabel("Valor").fill("145,25");
  await entryItem.getByRole("button", { name: "Salvar lançamento" }).click();
  await expect(page.getByText("Lançamento atualizado.")).toBeVisible();
  expect(
    (
      await prisma.financialEntry.findUniqueOrThrow({
        where: { id: firstEntry.id },
      })
    ).amount.toFixed(2),
  ).toBe("145.25");
  await page
    .getByRole("listitem")
    .filter({ hasText: "Mercado semanal" })
    .getByRole("button", { name: "Remover" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Registros removidos" }),
  ).toBeVisible();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Mercado semanal" })
    .getByRole("button", { name: "Restaurar" })
    .click();
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "Mercado semanal" })
      .getByRole("button", { name: "Remover" }),
  ).toBeVisible();

  const transferForm = page.locator("form").filter({
    has: page.getByRole("button", { name: "Registrar transferência" }),
  });
  await transferForm.getByLabel("Descrição").fill("Reserva mensal");
  await transferForm
    .getByLabel("Conta de origem")
    .selectOption(firstFinancialAccount.id);
  await transferForm
    .getByLabel("Conta de destino")
    .selectOption(firstFinancialAccount.id);
  await transferForm.getByLabel("Valor").fill("100,00");
  await transferForm.getByLabel("Data").fill("2026-09-10");
  await transferForm
    .getByRole("button", { name: "Registrar transferência" })
    .click();
  await expect(page.getByText("Selecione contas diferentes.")).toBeVisible();
  await transferForm.getByLabel("Descrição").fill("Reserva mensal");
  await transferForm
    .getByLabel("Conta de origem")
    .selectOption(firstFinancialAccount.id);
  await transferForm
    .getByLabel("Conta de destino")
    .selectOption(secondFinancialAccount.id);
  await transferForm.getByLabel("Valor").fill("100,00");
  await transferForm.getByLabel("Data").fill("2026-09-10");
  await transferForm
    .getByRole("button", { name: "Registrar transferência" })
    .click();
  await expect(
    page.getByRole("status").getByText("Transferência registrada.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Reserva mensal" }),
  ).toBeVisible();
  const firstTransfer = await prisma.financialTransfer.findFirstOrThrow({
    where: { userId: firstUser.id, description: "Reserva mensal" },
  });
  expect(firstTransfer.amount.toFixed(2)).toBe("100.00");
  expect(firstTransfer.sourceAccountId).toBe(firstFinancialAccount.id);
  expect(firstTransfer.destinationAccountId).toBe(secondFinancialAccount.id);

  await page.goto("/contas");
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "Reserva principal" })
      .getByText("R$ 12.345.678.901.234.322,64", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "Carteira" })
      .getByText("R$ 300,00", { exact: true }),
  ).toBeVisible();

  await page.goto("/area?month=2026-09");
  await expect(
    page.getByRole("heading", { name: "Seu mês em equilíbrio." }),
  ).toBeVisible();
  const monthlyWallet = page
    .getByRole("listitem")
    .filter({ hasText: "Carteira" });
  await monthlyWallet.getByText("Corrigir saldo inicial").click();
  await monthlyWallet.getByLabel("Saldo real de Carteira").fill("210,00");
  await monthlyWallet.getByRole("button", { name: "Registrar ajuste" }).click();
  await expect(
    monthlyWallet.getByText("Ajuste de saldo registrado."),
  ).toBeVisible();
  await expect(
    monthlyWallet.getByText("R$ 310,00", { exact: true }),
  ).toBeVisible();
  const balanceAdjustment = await prisma.balanceAdjustment.findUniqueOrThrow({
    where: {
      financialAccountId_month: {
        financialAccountId: secondFinancialAccount.id,
        month: new Date("2026-09-01T00:00:00.000Z"),
      },
    },
  });
  expect(balanceAdjustment.expectedBalance.toFixed(2)).toBe("200.00");
  expect(balanceAdjustment.actualBalance.toFixed(2)).toBe("210.00");
  expect(balanceAdjustment.amount.toFixed(2)).toBe("10.00");

  const secondContext = await browser.newContext({
    baseURL: authE2EBaseURL,
  });
  try {
    const secondPage = await secondContext.newPage();
    await signUp(secondPage, emails[1], "Segunda Pessoa");
    const secondUser = await prisma.user.findUniqueOrThrow({
      where: { email: emails[1] },
    });
    await secondPage.goto("/contas");
    await expect(
      secondPage.getByText("Reserva principal", { exact: true }),
    ).toHaveCount(0);
    await createFinancialAccount(
      secondPage,
      "Conta principal",
      "50,00",
      "2026-09-10",
    );
    await expect(secondPage.getByText("Conta criada.")).toBeVisible();
    expect(
      await prisma.financialAccount.count({
        where: { name: "Conta principal" },
      }),
    ).toBe(1);

    await secondPage.goto("/categorias");
    await expect(
      secondPage.getByText("Alimentação", { exact: true }),
    ).toHaveCount(0);
    await secondPage.getByLabel("Nome", { exact: true }).fill("Alimentação");
    await secondPage.getByRole("button", { name: "Criar categoria" }).click();
    await expect(secondPage.getByText("Categoria criada.")).toBeVisible();
    expect(
      await prisma.category.count({ where: { name: "Alimentação" } }),
    ).toBe(2);

    await secondPage.goto("/lancamentos");
    await expect(
      secondPage.getByText("Mercado semanal", { exact: true }),
    ).toHaveCount(0);
    await expect(
      secondPage.getByText("Reserva mensal", { exact: true }),
    ).toHaveCount(0);

    await page.goto("/contas");
    await expect(
      page.getByText("Reserva principal", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Conta principal", { exact: true }),
    ).toHaveCount(0);
    await page.goto(`/area?userId=${secondUser.id}`);
    await expect(page.getByText(emails[0], { exact: true })).toBeVisible();
    await expect(page.getByText(emails[1], { exact: true })).toHaveCount(0);
    await secondPage.goto("/area");
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
