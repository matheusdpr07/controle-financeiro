import { expect, test } from "@playwright/test";

test("renderiza a página inicial sem MySQL", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Controle Financeiro");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Entenda para onde seu dinheiro vai.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Sem conexão bancária e sem movimentar dinheiro."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Começar agora" }),
  ).toHaveAttribute("href", "/cadastro");
});

test("mantém a página inicial utilizável em tela móvel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Entenda para onde seu dinheiro vai.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar acesso" })).toBeVisible();

  const dimensoes = await page.evaluate(() => ({
    larguraVisivel: document.documentElement.clientWidth,
    larguraTotal: document.documentElement.scrollWidth,
  }));

  expect(dimensoes.larguraTotal).toBe(dimensoes.larguraVisivel);
});
