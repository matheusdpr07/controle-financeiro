import { expect, test } from "@playwright/test";

test("renderiza a página inicial sem MySQL", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
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
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Do saldo inicial ao fechamento.",
    }),
  ).toBeVisible();
});

test("executa o movimento da landing sem erros no navegador", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({
    reducedMotion: "no-preference",
    colorScheme: "dark",
  });
  await page.goto("/");

  const orbit = page.locator("[data-orbit-stage]");
  await page.mouse.move(1100, 320);
  await expect
    .poll(() =>
      orbit.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe("none");

  await page
    .getByRole("heading", {
      level: 2,
      name: "A realidade muda. Seu histórico explica.",
    })
    .scrollIntoViewIfNeeded();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );

  expect(errors).toEqual([]);
});

test("avança e retorna uma seção com um gesto da roda", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const monthSection = page.locator("[data-scroll-panel]").nth(1);
  await page.mouse.move(720, 500);
  await page.mouse.wheel(0, 120);
  await expect
    .poll(() =>
      monthSection.evaluate((element) =>
        Math.abs(element.getBoundingClientRect().top - 72),
      ),
    )
    .toBeLessThan(5);

  await page.mouse.wheel(0, -120);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
});

for (const width of [320, 390, 1440]) {
  test(`mantém a página inicial sem overflow em ${width}px`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Entenda para onde seu dinheiro vai.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Criar acesso" }),
    ).toBeVisible();

    const dimensoes = await page.evaluate(() => ({
      larguraVisivel: document.documentElement.clientWidth,
      larguraTotal: document.documentElement.scrollWidth,
    }));

    expect(dimensoes.larguraTotal).toBe(dimensoes.larguraVisivel);
  });
}
