# Tema escuro e landing animada — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar temas automático, claro e escuro em todas as telas e uma página inicial editorial com vetores financeiros originais animados por Anime.js.

**Architecture:** O tema será aplicado antes da primeira pintura por um script mínimo e controlado por um Client Component isolado; páginas e shells continuam Server Components. A landing permanece renderizada no servidor e recebe movimento progressivo por um controlador cliente que atua sobre elementos identificados, respeita movimento reduzido e se degrada para conteúdo estático.

**Tech Stack:** Next.js 16.3.4, React 19.2.8, TypeScript 5.9.3, Tailwind CSS 4.3.3, Anime.js 4.5.0, Vitest 4.1.11, React Testing Library 16.3.3 e Playwright 1.63.0.

**Spec:** `docs/superpowers/specs/2026-09-15-dark-theme-animated-landing-design.md`

## Global Constraints

- As preferências válidas são exatamente `system`, `light` e `dark`.
- Anime.js deve ser instalado na versão estável e exata `4.5.0`.
- Não criar funcionalidades financeiras, integrações externas, migrations ou mudanças de banco.
- Não reutilizar imagens, textos, marca ou vetores da Beagle Ship.
- Todo conteúdo deve funcionar antes da animação e com `prefers-reduced-motion: reduce`.
- Usar Server Components por padrão e Client Components somente para tema e movimento.
- Não adicionar comentários manuscritos ao código.
- Preservar TypeScript estrito, responsividade a partir de 320 px e contraste WCAG AA.
- Não criar valores financeiros fictícios na composição pública.

---

### Task 1: Infraestrutura de tema

**Files:**

- Create: `src/features/theme/theme.ts`
- Create: `src/features/theme/theme-bootstrap.tsx`
- Create: `src/features/theme/theme-toggle.tsx`
- Modify: `src/app/layout.tsx`
- Test: `tests/unit/theme.test.tsx`

**Interfaces:**

- Produces: `ThemePreference = "system" | "light" | "dark"`.
- Produces: `resolveTheme(preference: ThemePreference, systemDark: boolean): "light" | "dark"`.
- Produces: `applyTheme(preference: ThemePreference, systemDark: boolean): void`.
- Produces: `<ThemeBootstrap />` e `<ThemeToggle />` sem propriedades obrigatórias.

- [ ] **Step 1: Escrever os testes que falham para resolução e persistência**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { resolveTheme } from "@/features/theme/theme";

afterEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  vi.restoreAllMocks();
});

test("resolve o tema automático pela preferência do sistema", () => {
  expect(resolveTheme("system", true)).toBe("dark");
  expect(resolveTheme("system", false)).toBe("light");
});

test("alterna e persiste as três preferências", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  render(<ThemeToggle />);
  const toggle = screen.getByRole("button", { name: /tema automático/i });
  fireEvent.click(toggle);
  expect(localStorage.getItem("controle-financeiro-theme")).toBe("light");
  expect(document.documentElement).not.toHaveClass("dark");
  fireEvent.click(toggle);
  expect(localStorage.getItem("controle-financeiro-theme")).toBe("dark");
  expect(document.documentElement).toHaveClass("dark");
});
```

- [ ] **Step 2: Executar o teste e confirmar a falha esperada**

Run: `npx vitest run tests/unit/theme.test.tsx`

Expected: FAIL porque os módulos de tema ainda não existem.

- [ ] **Step 3: Implementar tipos e aplicação do tema**

```ts
export const themePreferences = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof themePreferences)[number];
export const themeStorageKey = "controle-financeiro-theme";

export function resolveTheme(
  preference: ThemePreference,
  systemDark: boolean,
): "light" | "dark" {
  if (preference === "system") return systemDark ? "dark" : "light";
  return preference;
}

export function applyTheme(preference: ThemePreference, systemDark: boolean) {
  const resolved = resolveTheme(preference, systemDark);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = preference;
  document.documentElement.style.colorScheme = resolved;
}
```

- [ ] **Step 4: Implementar a inicialização anterior à pintura**

`ThemeBootstrap` deve renderizar um `<script>` inline que lê
`controle-financeiro-theme`, valida os três valores, consulta
`matchMedia("(prefers-color-scheme: dark)")` e aplica classe, `data-theme` e
`color-scheme`. Qualquer falha deve resultar em modo automático.

```tsx
const source = `(function(){var e=document.documentElement;var m=function(){return matchMedia("(prefers-color-scheme: dark)").matches};try{var k="controle-financeiro-theme";var p=localStorage.getItem(k);if(p!=="light"&&p!=="dark"&&p!=="system")p="system";var d=p==="dark"||(p==="system"&&m());e.classList.toggle("dark",d);e.dataset.theme=p;e.style.colorScheme=d?"dark":"light"}catch(x){var d=m();e.classList.toggle("dark",d);e.dataset.theme="system";e.style.colorScheme=d?"dark":"light"}})()`;

export function ThemeBootstrap() {
  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}
```

- [ ] **Step 5: Implementar o controle cliente**

`ThemeToggle` deve iniciar em `system`, sincronizar a preferência após montar,
escutar mudanças de `matchMedia` enquanto estiver em automático e percorrer
`system → light → dark → system`. O botão deve expor o nome atual em
`aria-label` e texto visível ou oculto.

```tsx
const labels: Record<ThemePreference, string> = {
  system: "Tema automático",
  light: "Tema claro",
  dark: "Tema escuro",
};

const nextPreference: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const stored = localStorage.getItem(themeStorageKey);
    const initial = themePreferences.includes(stored as ThemePreference)
      ? (stored as ThemePreference)
      : "system";
    setPreference(initial);
    applyTheme(initial, media.matches);
    const syncSystem = () => {
      if (document.documentElement.dataset.theme === "system") {
        applyTheme("system", media.matches);
      }
    };
    media.addEventListener("change", syncSystem);
    return () => media.removeEventListener("change", syncSystem);
  }, []);

  function cycleTheme() {
    const next = nextPreference[preference];
    localStorage.setItem(themeStorageKey, next);
    setPreference(next);
    applyTheme(next, matchMedia("(prefers-color-scheme: dark)").matches);
  }

  return (
    <button type="button" aria-label={labels[preference]} onClick={cycleTheme}>
      <span aria-hidden="true">
        {preference === "system" ? "◐" : preference === "light" ? "☀" : "☾"}
      </span>
      <span className="sr-only">{labels[preference]}</span>
    </button>
  );
}
```

- [ ] **Step 6: Integrar no layout raiz**

`src/app/layout.tsx` deve adicionar `suppressHydrationWarning` ao `<html>`, renderizar
`<ThemeBootstrap />` antes do corpo visível e exportar `viewport` com
`colorScheme: "light dark"`.

- [ ] **Step 7: Executar testes e validação de tipos**

Run: `npx vitest run tests/unit/theme.test.tsx tests/unit/layout-shells.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/theme src/app/layout.tsx tests/unit/theme.test.tsx
git commit -m "feat(theme): adiciona temas automático claro e escuro"
```

### Task 2: Tokens visuais e componentes compartilhados

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/label.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/brand-mark.tsx`
- Modify: `src/components/private-shell.tsx`
- Modify: `src/components/auth-shell.tsx`
- Modify: `src/components/submit-button.tsx`
- Modify: `src/features/auth/auth-form.tsx`
- Modify: `tests/unit/layout-shells.test.tsx`

**Interfaces:**

- Consumes: `<ThemeToggle />` da Task 1.
- Produces: tokens Tailwind `surface`, `surface-raised`, `subtle`, `income`,
  `expense`, `transfer` e respectivos foregrounds.
- Produces: shells com seletor de tema e sem cores hexadecimais locais.

- [ ] **Step 1: Ampliar o teste dos shells**

```tsx
expect(
  screen.getByRole("button", { name: /tema automático/i }),
).toBeInTheDocument();
```

Adicionar essa expectativa aos testes de `PrivateShell` e `AuthShell`.

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npx vitest run tests/unit/layout-shells.test.tsx`

Expected: FAIL porque os shells ainda não renderizam `ThemeToggle`.

- [ ] **Step 3: Definir os tokens dos dois temas**

Adicionar ao `@theme inline` os aliases abaixo e definir valores OKLCH em `:root`
e `.dark`:

```css
--color-surface: var(--surface);
--color-surface-raised: var(--surface-raised);
--color-subtle: var(--subtle);
--color-income: var(--income);
--color-income-foreground: var(--income-foreground);
--color-expense: var(--expense);
--color-expense-foreground: var(--expense-foreground);
--color-transfer: var(--transfer);
--color-transfer-foreground: var(--transfer-foreground);
```

Usar os valores iniciais abaixo e ajustá-los somente se a medição de contraste
exigir. Adicionar transição de `background-color`, `border-color` e `color` somente
quando movimento reduzido não estiver ativo.

```css
:root {
  --background: oklch(0.978 0.007 154);
  --surface: oklch(0.955 0.012 156);
  --surface-raised: oklch(1 0 0);
  --foreground: oklch(0.24 0.024 160);
  --primary: oklch(0.38 0.09 159);
  --primary-foreground: oklch(0.99 0.003 150);
  --income: oklch(0.53 0.13 158);
  --income-foreground: oklch(0.31 0.08 158);
  --expense: oklch(0.59 0.17 29);
  --expense-foreground: oklch(0.38 0.14 29);
  --transfer: oklch(0.55 0.1 285);
  --transfer-foreground: oklch(0.38 0.09 285);
}

.dark {
  --background: oklch(0.15 0.014 165);
  --surface: oklch(0.19 0.018 164);
  --surface-raised: oklch(0.225 0.022 162);
  --foreground: oklch(0.96 0.008 150);
  --primary: oklch(0.78 0.12 158);
  --primary-foreground: oklch(0.16 0.025 162);
  --income: oklch(0.74 0.13 158);
  --income-foreground: oklch(0.86 0.1 156);
  --expense: oklch(0.72 0.14 28);
  --expense-foreground: oklch(0.84 0.1 27);
  --transfer: oklch(0.74 0.1 285);
  --transfer-foreground: oklch(0.84 0.075 285);
}

@media (prefers-reduced-motion: no-preference) {
  body,
  [data-slot="card"],
  [data-slot="button"],
  [data-slot="input"],
  [data-slot="select"] {
    transition-duration: 180ms;
    transition-property: background-color, border-color, color, box-shadow;
  }
}
```

- [ ] **Step 4: Migrar os componentes básicos para tokens**

Substituir `bg-white`, sombras com RGB verde fixo e textos hexadecimais por
`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
`border-border` e `ring-ring`. Manter variantes, tamanhos, `aria-invalid`, foco e
estados desabilitados existentes.

```tsx
const cardClasses =
  "bg-card text-card-foreground shadow-[0_18px_60px_color-mix(in_oklch,var(--foreground)_7%,transparent)] ring-1 ring-border";
const outlineButtonClasses =
  "border-border bg-surface-raised text-foreground hover:bg-muted hover:text-primary";
const fieldClasses =
  "border-input bg-surface-raised text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25";
```

- [ ] **Step 5: Migrar marca e shells**

Adicionar `<ThemeToggle />` ao cabeçalho privado e à coluna de autenticação. Usar
`bg-background`, `bg-surface`, `text-foreground`, `text-primary`,
`text-muted-foreground` e bordas semânticas. A navegação ativa continua anunciada
por `aria-current="page"`.

- [ ] **Step 6: Executar os testes de componentes**

Run: `npx vitest run tests/unit/layout-shells.test.tsx tests/unit/home.test.tsx tests/unit/account-form.test.tsx tests/unit/currency-input.test.tsx`

Expected: PASS.

Run: `npm run lint && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css src/components src/features/auth tests/unit/layout-shells.test.tsx
git commit -m "feat(ui): aplica identidade visual aos componentes compartilhados"
```

### Task 3: Temas nas telas financeiras

**Files:**

- Modify: `src/app/area/page.tsx`
- Modify: `src/app/contas/page.tsx`
- Modify: `src/app/categorias/page.tsx`
- Modify: `src/app/lancamentos/page.tsx`
- Modify: `src/features/accounts/account-form.tsx`
- Modify: `src/features/categories/category-form.tsx`
- Modify: `src/features/dashboard/balance-correction-form.tsx`
- Modify: `src/features/entries/entry-form.tsx`
- Modify: `src/features/entries/transfer-form.tsx`

**Interfaces:**

- Consumes: tokens e componentes compartilhados da Task 2.
- Produces: quatro rotas privadas coerentes e legíveis nos dois temas.

- [ ] **Step 1: Registrar a linha de base dos testes privados**

Run: `npx vitest run tests/unit/dashboard-page.test.tsx tests/unit/account-form.test.tsx tests/unit/financial-domain.test.ts`

Expected: PASS antes da mudança visual.

- [ ] **Step 2: Migrar o painel mensal**

Trocar fundos, textos, bordas, anéis e estados financeiros fixos pelos tokens.
`Saldo inicial`, `Receitas`, `Despesas`, `Ajustes` e `Saldo final` devem manter
rótulos textuais e ganhar superfícies semânticas discretas. Navegação mensal e
formulário de correção mantêm comportamento atual.

```tsx
const monthlySummaryClasses = {
  opening: "bg-surface text-foreground ring-1 ring-border",
  income: "bg-income/10 text-income-foreground ring-1 ring-income/20",
  expense: "bg-expense/10 text-expense-foreground ring-1 ring-expense/20",
  adjustment: "bg-transfer/10 text-transfer-foreground ring-1 ring-transfer/20",
  closing: "bg-primary text-primary-foreground ring-1 ring-primary/20",
};
```

- [ ] **Step 3: Migrar contas, categorias e lançamentos**

Aplicar os mesmos tokens a títulos, cartões, listas, badges, campos, mensagens e
ações. Receita e despesa nunca dependerão somente de verde e vermelho; os rótulos
e sinais monetários existentes permanecem.

```tsx
const entryToneClasses = {
  INCOME: "bg-income/10 text-income-foreground ring-1 ring-income/20",
  EXPENSE: "bg-expense/10 text-expense-foreground ring-1 ring-expense/20",
  TRANSFER: "bg-transfer/10 text-transfer-foreground ring-1 ring-transfer/20",
};
```

- [ ] **Step 4: Migrar formulários financeiros**

Atualizar somente classes visuais nos cinco formulários. Preservar Server Actions,
schemas, máscara BRL, estados de erro, etapas da conta e dados enviados.

- [ ] **Step 5: Executar a suíte financeira**

Run: `npx vitest run tests/unit/dashboard-page.test.tsx tests/unit/dashboard-schemas.test.ts tests/unit/monthly-report.test.ts tests/unit/account-form.test.tsx tests/unit/currency-input.test.tsx tests/unit/financial-domain.test.ts`

Expected: PASS.

Run: `npm run lint && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/area src/app/contas src/app/categorias src/app/lancamentos src/features/accounts/account-form.tsx src/features/categories/category-form.tsx src/features/dashboard/balance-correction-form.tsx src/features/entries/entry-form.tsx src/features/entries/transfer-form.tsx
git commit -m "feat(ui): adapta telas financeiras aos novos temas"
```

### Task 4: Landing editorial e movimento

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/app/page.tsx`
- Create: `src/features/landing/financial-orbit.tsx`
- Create: `src/features/landing/landing-motion.tsx`
- Test: `tests/unit/landing-motion.test.tsx`
- Modify: `tests/unit/home.test.tsx`
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**

- Produces: `<FinancialOrbit />`, SVG decorativo sem propriedades obrigatórias.
- Produces: `<LandingMotion />`, controlador cliente sem saída visual.
- Consumes: `animate`, `createScope`, `stagger` e `svg` de `animejs` 4.5.0.

- [ ] **Step 1: Instalar a dependência exata**

Run: `npm install --save-exact animejs@4.5.0`

Expected: `package.json` e `package-lock.json` registram exatamente `4.5.0` e
`npm ls animejs` apresenta uma única versão válida.

- [ ] **Step 2: Escrever o teste de movimento reduzido**

```tsx
import { render, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { LandingMotion } from "@/features/landing/landing-motion";

const animate = vi.fn();
vi.mock("animejs", () => ({
  animate,
  createScope: vi.fn(),
  stagger: vi.fn(),
  svg: { createDrawable: vi.fn() },
}));

test("não inicia movimento quando o usuário prefere redução", async () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  document.body.innerHTML = "<main data-landing-root></main>";
  render(<LandingMotion />);
  await waitFor(() => expect(animate).not.toHaveBeenCalled());
});
```

- [ ] **Step 3: Executar o teste e confirmar a falha**

Run: `npx vitest run tests/unit/landing-motion.test.tsx`

Expected: FAIL porque `LandingMotion` ainda não existe.

- [ ] **Step 4: Criar o vetor financeiro original**

`FinancialOrbit` deve renderizar um SVG com `viewBox="0 0 720 720"`,
`role="presentation"`, `aria-hidden="true"` e grupos identificados por
`data-orbit-layer`, `data-orbit-line` e `data-orbit-node`. Usar círculos, retângulos
arredondados e caminhos próprios para representar camadas de saldo, receitas,
despesas e curva mensal sem valores numéricos.

```tsx
export function FinancialOrbit() {
  return (
    <svg viewBox="0 0 720 720" role="presentation" aria-hidden="true">
      <g data-orbit-layer>
        <circle cx="360" cy="360" r="250" fill="none" />
        <path
          data-orbit-line
          d="M148 438 C250 332 344 476 548 246"
          fill="none"
        />
      </g>
      <g data-orbit-layer>
        <rect x="184" y="210" width="352" height="220" rx="36" />
        <circle data-orbit-node cx="548" cy="246" r="12" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 5: Implementar o controlador Anime.js**

`LandingMotion` deve localizar `[data-landing-root]`, retornar imediatamente em
movimento reduzido e criar um escopo Anime.js. O escopo anima a entrada de
`[data-reveal]`, desenha `[data-orbit-line]` e aplica flutuação curta às camadas.
Usar `IntersectionObserver` para revelar seções posteriores. A limpeza desconecta
o observador e chama `scope.revert()`.

```tsx
"use client";

import { useEffect } from "react";
import { animate, createScope, stagger, svg } from "animejs";

export function LandingMotion() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector<HTMLElement>("[data-landing-root]");
    if (!root) return;
    const continuous: ReturnType<typeof animate>[] = [];
    const scope = createScope({ root }).add(() => {
      animate("[data-reveal]", {
        opacity: [0, 1],
        translateY: [24, 0],
        delay: stagger(70),
        duration: 800,
        ease: "outExpo",
      });
      animate(svg.createDrawable("[data-orbit-line]"), {
        draw: ["0 0", "0 1"],
        duration: 1200,
        ease: "inOutQuart",
      });
      root.querySelectorAll("[data-orbit-layer]").forEach((layer, index) => {
        continuous.push(
          animate(layer, {
            translateY: [0, index % 2 === 0 ? -10 : 10],
            rotate: [0, index % 2 === 0 ? 1.2 : -1.2],
            duration: 3600 + index * 400,
            ease: "inOutSine",
            alternate: true,
            loop: true,
          }),
        );
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target.querySelectorAll("[data-section-reveal]"), {
            opacity: [0, 1],
            translateY: [28, 0],
            delay: stagger(80),
            duration: 700,
            ease: "outExpo",
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 },
    );
    root
      .querySelectorAll("[data-motion-section]")
      .forEach((section) => observer.observe(section));

    const move = (event: PointerEvent) => {
      root.style.setProperty(
        "--pointer-x",
        `${event.clientX / innerWidth - 0.5}`,
      );
      root.style.setProperty(
        "--pointer-y",
        `${event.clientY / innerHeight - 0.5}`,
      );
    };
    const syncVisibility = () => {
      continuous.forEach((animation) =>
        document.hidden ? animation.pause() : animation.play(),
      );
    };
    root.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      observer.disconnect();
      root.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", syncVisibility);
      scope.revert();
    };
  }, []);
  return null;
}
```

- [ ] **Step 6: Reconstruir a página inicial**

`src/app/page.tsx` deve permanecer Server Component, renderizar
`data-landing-root`, `<FinancialOrbit />` e `<LandingMotion />`. Manter o título
“Entenda para onde seu dinheiro vai.”, a frase “Sem conexão bancária e sem
movimentar dinheiro.” e links para `/cadastro` e `/entrar`. Criar as cinco seções
aprovadas na especificação e usar somente vetores locais.

- [ ] **Step 7: Atualizar testes de conteúdo e responsividade**

Manter as asserções atuais e acrescentar títulos das seções, seletor de tema e
ausência de overflow em 320 px, 390 px e 1440 px. No Playwright, usar
`page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" })` e confirmar
que conteúdo e chamadas continuam visíveis.

- [ ] **Step 8: Executar testes da landing e build**

Run: `npx vitest run tests/unit/home.test.tsx tests/unit/landing-motion.test.tsx tests/unit/theme.test.tsx`

Expected: PASS.

Run: `npm run test:e2e`

Expected: PASS em Chromium.

Run: `npm run build -- --webpack`

Expected: PASS com a landing disponível sem MySQL.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/app/page.tsx src/features/landing tests/unit/home.test.tsx tests/unit/landing-motion.test.tsx tests/e2e/home.spec.ts
git commit -m "feat(landing): cria experiência financeira animada"
```

### Task 5: Validação integrada e documentação

**Files:**

- Modify: `README.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/VALIDATION.md`

**Interfaces:**

- Consumes: temas e landing concluídos nas Tasks 1 a 4.
- Produces: evidências reproduzíveis e documentação coerente com o código final.

- [ ] **Step 1: Executar validações estáticas e unitárias**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test`

Expected: formatação aprovada, zero avisos de lint, tipos aprovados e toda a suíte
Vitest verde.

- [ ] **Step 2: Executar fluxos públicos e autenticados**

Run: `npm run test:e2e`

Expected: página inicial e navegação pública aprovadas em Chromium.

Run: `AUTH_E2E_BASE_URL=http://localhost:3000 AUTH_E2E_REUSE_SERVER=true npm run test:e2e:auth`

Expected: cadastro, login, contas, categorias, lançamentos e relatório mensal
aprovados no MySQL 8.4 local.

- [ ] **Step 3: Executar build e auditoria**

Run: `npm run build -- --webpack`

Expected: build de produção aprovado para todas as rotas.

Run: `npm audit --audit-level=high`

Expected: zero vulnerabilidades altas ou críticas.

- [ ] **Step 4: Revisar a interface renderizada**

Capturar desktop 1440 × 1000 e celular 390 × 844 em temas claro e escuro. Confirmar
contraste, ausência de overflow, visibilidade de foco, conteúdo com movimento
reduzido e coerência das sete rotas.

- [ ] **Step 5: Atualizar documentação**

Registrar no README como usar o seletor. Em arquitetura, documentar inicialização,
armazenamento local, limite do Client Component e Anime.js. Marcar o refinamento
visual correspondente no roadmap e adicionar comandos, resultados e limitações em
`docs/VALIDATION.md`.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/ARCHITECTURE.md docs/ROADMAP.md docs/VALIDATION.md
git commit -m "docs: registra temas e validação da landing"
```

- [ ] **Step 7: Conferir o estado final**

Run: `git diff --check && git status --short --branch && git log --oneline -8`

Expected: árvore limpa, branch à frente apenas pelos commits planejados e nenhum
push executado automaticamente.
