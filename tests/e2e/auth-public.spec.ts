import { expect, test } from "@playwright/test";

test("navega entre entrada e cadastro sem depender do banco", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(
    page.getByRole("heading", { name: "Entrar", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("E-mail")).toHaveAttribute(
    "autocomplete",
    "email",
  );
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await page.getByRole("link", { name: "Criar acesso" }).click();
  await expect(page).toHaveURL(/\/cadastro$/);
  await expect(page.getByLabel("Nome")).toBeVisible();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "minlength",
    "12",
  );
  await expect(page.getByText("Use entre 12 e 128 caracteres.")).toBeVisible();
});
