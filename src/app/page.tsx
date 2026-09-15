import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { FinancialOrbit } from "@/features/landing/financial-orbit";
import { LandingMotion } from "@/features/landing/landing-motion";
import { ThemeToggle } from "@/features/theme/theme-toggle";

const monthItems = [
  {
    label: "Saldo inicial",
    className: "bg-foreground/12",
    width: "w-[58%]",
  },
  { label: "Receitas", className: "bg-income", width: "w-[82%]" },
  { label: "Despesas", className: "bg-expense", width: "w-[46%]" },
  { label: "Saldo final", className: "bg-primary", width: "w-[70%]" },
] as const;

const accounts = [
  { label: "Conta principal", tone: "bg-primary/15 text-primary" },
  { label: "Dinheiro", tone: "bg-income/15 text-income-foreground" },
  {
    label: "Carteira digital",
    tone: "bg-transfer/15 text-transfer-foreground",
  },
] as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-3 text-xs font-bold tracking-[0.18em] text-primary uppercase">
      <span aria-hidden="true" className="h-px w-8 bg-primary/50" />
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <div
      data-landing-root
      className="min-h-screen overflow-x-clip bg-background text-foreground"
    >
      <LandingMotion />
      <a
        href="#conteudo"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform focus:translate-y-0"
      >
        Ir para o conteúdo
      </a>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/78 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
          <BrandMark />
          <nav aria-label="Acesso" className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/entrar">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/cadastro">Criar acesso</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="conteudo">
        <section
          data-scroll-panel
          className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -top-40 right-[-12rem] -z-10 size-[38rem] rounded-full bg-primary/12 blur-3xl"
          />
          <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6 lg:px-10 lg:py-16">
            <div className="relative z-10 max-w-2xl">
              <div data-reveal>
                <SectionLabel>Controle financeiro pessoal</SectionLabel>
              </div>
              <h1
                data-reveal
                className="mt-7 max-w-2xl text-5xl leading-[0.98] font-semibold tracking-[-0.065em] text-balance sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
              >
                Entenda para onde seu dinheiro vai.
              </h1>
              <p
                data-reveal
                className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl"
              >
                Acompanhe o começo, os movimentos e o fechamento de cada mês em
                uma visão feita para a sua rotina.
              </p>
              <div data-reveal className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="px-6 text-base">
                  <Link href="/cadastro">
                    Começar agora
                    <span aria-hidden="true">↗</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-background/50 px-6 text-base backdrop-blur-sm"
                >
                  <Link href="#como-funciona">Ver como funciona</Link>
                </Button>
              </div>
              <p
                data-reveal
                className="mt-7 flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="grid size-6 place-items-center rounded-full bg-income/12 font-bold text-income-foreground ring-1 ring-income/20"
                >
                  ✓
                </span>
                Sem conexão bancária e sem movimentar dinheiro.
              </p>
              <Button asChild variant="ghost" className="mt-4 px-0 sm:hidden">
                <Link href="/entrar">Já tenho acesso</Link>
              </Button>
            </div>

            <div data-reveal className="relative -mx-8 lg:mx-0">
              <FinancialOrbit />
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          data-motion-section
          data-scroll-panel
          aria-labelledby="month-title"
          className="relative overflow-hidden bg-hero text-hero-foreground"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24 lg:px-10 lg:py-36">
            <div data-section-reveal>
              <p className="text-xs font-bold tracking-[0.18em] text-hero-muted uppercase">
                Veja seu mês
              </p>
              <h2
                id="month-title"
                className="mt-6 text-4xl leading-[1.04] font-semibold tracking-[-0.055em] text-balance sm:text-5xl lg:text-6xl"
              >
                Do saldo inicial ao fechamento.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-hero-muted">
                Todo começo de mês fica registrado. Receitas, despesas e ajustes
                mostram como o saldo chegou ao resultado final.
              </p>
            </div>

            <div
              data-section-reveal
              aria-hidden="true"
              className="relative rounded-[2.25rem] bg-hero-foreground/[0.06] p-5 ring-1 ring-hero-foreground/12 sm:p-8"
            >
              <div className="rounded-[1.75rem] bg-surface-raised p-6 text-foreground shadow-2xl ring-1 ring-border sm:p-8">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-6">
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
                      Visão mensal
                    </p>
                    <p className="mt-2 text-xl font-semibold">Seu mês</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                    Organizado
                  </span>
                </div>
                <div className="mt-7 space-y-6">
                  {monthItems.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="size-2 rounded-full bg-current opacity-40" />
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${item.className} ${item.width}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          data-motion-section
          data-scroll-panel
          aria-labelledby="accounts-title"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-24 lg:px-10 lg:py-36">
            <div
              data-section-reveal
              aria-hidden="true"
              className="relative mx-auto min-h-96 w-full max-w-xl"
            >
              {accounts.map((account, index) => (
                <div
                  key={account.label}
                  className={`absolute right-0 left-0 rounded-[2rem] bg-surface-raised p-6 shadow-[0_24px_60px_var(--shadow-soft)] ring-1 ring-border sm:p-8 ${
                    index === 0
                      ? "top-0 rotate-[-2deg]"
                      : index === 1
                        ? "top-24 translate-x-3 rotate-[1deg] sm:translate-x-10"
                        : "top-48 -translate-x-2 rotate-[-1deg] sm:-translate-x-8"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{account.label}</span>
                    <span
                      className={`grid size-10 place-items-center rounded-2xl ${account.tone}`}
                    >
                      <span className="size-2.5 rounded-full bg-current" />
                    </span>
                  </div>
                  <div className="mt-8 h-3 w-2/3 rounded-full bg-muted" />
                </div>
              ))}
            </div>

            <div data-section-reveal>
              <SectionLabel>Organize suas contas</SectionLabel>
              <h2
                id="accounts-title"
                className="mt-6 text-4xl leading-[1.04] font-semibold tracking-[-0.055em] text-balance sm:text-5xl lg:text-6xl"
              >
                Cada valor no lugar que faz sentido.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Cadastre as contas que você já usa e informe o saldo real de
                cada uma. O sistema reúne a visão sem assumir o controle do seu
                dinheiro.
              </p>
            </div>
          </div>
        </section>

        <section
          data-motion-section
          data-scroll-panel
          aria-labelledby="entries-title"
          className="border-y border-border bg-surface"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24 lg:px-10 lg:py-36">
            <div data-section-reveal>
              <SectionLabel>Registre cada movimento</SectionLabel>
              <h2
                id="entries-title"
                className="mt-6 text-4xl leading-[1.04] font-semibold tracking-[-0.055em] text-balance sm:text-5xl lg:text-6xl"
              >
                Entrou, saiu ou mudou de conta.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Descreva cada movimentação em reais, associe uma categoria e
                mantenha o contexto necessário para consultar depois.
              </p>
            </div>

            <div
              data-section-reveal
              aria-hidden="true"
              className="relative mx-auto flex min-h-80 w-full max-w-xl items-center justify-between gap-3 sm:gap-8"
            >
              <div className="relative z-10 rounded-[2rem] bg-income/10 p-5 text-income-foreground ring-1 ring-income/25 sm:p-7">
                <span className="text-xs font-bold tracking-[0.14em] uppercase">
                  Receita
                </span>
                <div className="mt-5 h-2 w-20 rounded-full bg-income/45" />
              </div>
              <div className="absolute top-1/2 right-20 left-20 h-px bg-gradient-to-r from-income via-primary to-expense sm:right-28 sm:left-28" />
              <div className="relative z-20 grid size-16 shrink-0 place-items-center rounded-full bg-primary text-xl text-primary-foreground shadow-xl ring-8 ring-surface">
                ↔
              </div>
              <div className="relative z-10 rounded-[2rem] bg-expense/10 p-5 text-expense-foreground ring-1 ring-expense/25 sm:p-7">
                <span className="text-xs font-bold tracking-[0.14em] uppercase">
                  Despesa
                </span>
                <div className="mt-5 h-2 w-20 rounded-full bg-expense/45" />
              </div>
            </div>
          </div>
        </section>

        <section
          data-motion-section
          data-scroll-panel
          aria-labelledby="correction-title"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-24 lg:px-10 lg:py-36">
            <div
              data-section-reveal
              aria-hidden="true"
              className="rounded-[2.25rem] bg-surface-raised p-6 shadow-[0_28px_70px_var(--shadow-soft)] ring-1 ring-border sm:p-9"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold">Conferência de saldo</p>
                <span className="rounded-full bg-transfer/10 px-3 py-1 text-xs font-semibold text-transfer-foreground">
                  Ajuste registrado
                </span>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-muted p-5">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    Saldo esperado
                  </p>
                  <div className="mt-6 h-3 w-3/4 rounded-full bg-foreground/20" />
                </div>
                <div className="rounded-2xl bg-transfer/10 p-5 ring-1 ring-transfer/20">
                  <p className="text-xs font-bold tracking-wide text-transfer-foreground uppercase">
                    Saldo informado
                  </p>
                  <div className="mt-6 h-3 w-4/5 rounded-full bg-transfer/45" />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-border px-5 py-4 text-sm text-muted-foreground">
                <span className="grid size-8 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  ✓
                </span>
                O histórico do começo do mês permanece claro.
              </div>
            </div>

            <div data-section-reveal>
              <SectionLabel>Corrija seu saldo</SectionLabel>
              <h2
                id="correction-title"
                className="mt-6 text-4xl leading-[1.04] font-semibold tracking-[-0.055em] text-balance sm:text-5xl lg:text-6xl"
              >
                A realidade muda. Seu histórico explica.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Quando o saldo real for diferente, registre a correção. A
                diferença aparece como ajuste no relatório mensal e pode ser
                corrigida novamente.
              </p>
            </div>
          </div>
        </section>

        <section
          data-motion-section
          data-scroll-panel
          className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10"
        >
          <div
            data-section-reveal
            className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-9 overflow-hidden rounded-[2.5rem] bg-hero px-7 py-12 text-hero-foreground shadow-[0_30px_80px_var(--shadow-soft)] sm:px-12 sm:py-16 md:flex-row md:items-end lg:px-16"
          >
            <div
              aria-hidden="true"
              className="absolute -top-28 -right-16 size-72 rounded-full border-[3.5rem] border-hero-accent/60"
            />
            <div className="relative max-w-3xl">
              <p className="text-xs font-bold tracking-[0.18em] text-hero-muted uppercase">
                Comece pelo seu saldo
              </p>
              <h2 className="mt-5 text-4xl leading-[1.05] font-semibold tracking-[-0.05em] text-balance sm:text-5xl">
                Clareza financeira começa com um registro.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-hero-muted">
                Crie seu acesso, cadastre sua primeira conta e acompanhe o mês
                no seu ritmo.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="relative shrink-0 bg-hero-foreground px-6 text-base text-hero hover:bg-hero-muted"
            >
              <Link href="/cadastro">Criar meu acesso</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-8 text-sm text-muted-foreground sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-foreground">
            Controle Financeiro
          </span>
          <span>Organização pessoal para escolhas mais conscientes.</span>
        </div>
      </footer>
    </div>
  );
}
