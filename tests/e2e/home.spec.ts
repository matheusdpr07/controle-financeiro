import { expect, test } from "@playwright/test";

test("renderiza a página inicial sem MySQL", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Controle Financeiro");
  await expect(
    page.getByRole("heading", { level: 1, name: "Controle Financeiro" }),
  ).toBeVisible();
  await expect(
    page.getByText("A fundação do projeto está configurada."),
  ).toBeVisible();
});
