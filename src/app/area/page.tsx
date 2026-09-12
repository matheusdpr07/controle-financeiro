import type { Metadata } from "next";
import Link from "next/link";
import { PrivateShell } from "@/components/private-shell";
import { BalanceCorrectionForm } from "@/features/dashboard/balance-correction-form";
import { getMonthlyDashboard } from "@/features/dashboard/data";
import { getCurrentMonth, monthSchema } from "@/features/dashboard/month";
import { formatBrlAmount } from "@/lib/money";

export const metadata: Metadata = {
  title: "Resumo mensal | Controle Financeiro",
};

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "adjustment";
}) {
  const colors = {
    neutral: "text-[#173f35]",
    positive: "text-[#267254]",
    negative: "text-[#a3473d]",
    adjustment: "text-[#7b6037]",
  };
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(23,63,53,0.05)] ring-1 ring-[#173f35]/8">
      <dt className="text-sm font-medium text-[#6f7a75]">{label}</dt>
      <dd
        className={`mt-3 text-2xl font-semibold tracking-[-0.035em] ${colors[tone]}`}
      >
        {formatBrlAmount(value)}
      </dd>
    </div>
  );
}

function Onboarding() {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-[#173f35] text-white shadow-[0_24px_65px_rgba(23,63,53,0.18)]">
      <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:p-14">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#a9c9bc]">Etapa 1 de 2</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Comece pela conta que você já usa.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#d6e5df]">
            Cadastre onde você organiza seu dinheiro. Em seguida, informe o
            saldo inicial para começar seu histórico financeiro.
          </p>
        </div>
        <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/15">
          <p className="text-sm font-medium text-[#cfe0d9]">Próximo passo</p>
          <p className="mt-2 text-xl font-semibold">
            Criar uma conta financeira
          </p>
          <Link
            href="/contas"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#173f35] shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none"
          >
            Começar agora
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function AreaPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const requestedMonth = (await searchParams).month;
  const parsedMonth = monthSchema.safeParse(requestedMonth);
  const month = parsedMonth.success ? parsedMonth.data : getCurrentMonth();
  const dashboard = await getMonthlyDashboard(month);

  return (
    <PrivateShell current="area">
      <div className="space-y-9">
        {!dashboard.hasAccounts ? (
          <Onboarding />
        ) : (
          <>
            <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#527064]">
                  Visão mensal
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#173f35] sm:text-5xl">
                  Seu mês em equilíbrio.
                </h1>
                <p className="mt-4 text-base leading-7 text-[#66716c] first-letter:uppercase">
                  {dashboard.label}
                </p>
              </div>
              <nav
                aria-label="Navegação entre meses"
                className="flex items-center rounded-2xl bg-white p-1 shadow-sm ring-1 ring-[#173f35]/8"
              >
                <Link
                  href={`/area?month=${dashboard.previousMonth}`}
                  aria-label="Mês anterior"
                  className="grid size-10 place-items-center rounded-xl text-[#173f35] hover:bg-[#edf2ee] focus-visible:ring-3 focus-visible:ring-[#74a995]/35 focus-visible:outline-none"
                >
                  ←
                </Link>
                <span className="min-w-36 px-3 text-center text-sm font-semibold text-[#30443c] first-letter:uppercase">
                  {dashboard.label}
                </span>
                <Link
                  href={`/area?month=${dashboard.nextMonth}`}
                  aria-label="Próximo mês"
                  className="grid size-10 place-items-center rounded-xl text-[#173f35] hover:bg-[#edf2ee] focus-visible:ring-3 focus-visible:ring-[#74a995]/35 focus-visible:outline-none"
                >
                  →
                </Link>
              </nav>
            </header>

            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <Metric label="Saldo inicial" value={dashboard.summary.opening} />
              <Metric
                label="Ajustes"
                value={dashboard.summary.adjustments}
                tone="adjustment"
              />
              <Metric
                label="Receitas"
                value={dashboard.summary.income}
                tone="positive"
              />
              <Metric
                label="Despesas"
                value={dashboard.summary.expense}
                tone="negative"
              />
              <Metric label="Saldo final" value={dashboard.summary.closing} />
            </dl>

            <section aria-labelledby="accounts-month-title">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#527064]">
                    Detalhes
                  </p>
                  <h2
                    id="accounts-month-title"
                    className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#173f35]"
                  >
                    Saldos por conta
                  </h2>
                </div>
                <Link
                  href="/lancamentos"
                  className="rounded-xl bg-[#173f35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#24594b] focus-visible:ring-3 focus-visible:ring-[#74a995]/40 focus-visible:outline-none"
                >
                  Novo lançamento
                </Link>
              </div>

              {dashboard.accounts.length ? (
                <ul className="mt-5 grid gap-4 lg:grid-cols-2">
                  {dashboard.accounts.map((account) => (
                    <li
                      key={account.id}
                      className="rounded-3xl bg-white p-6 shadow-[0_10px_30px_rgba(23,63,53,0.05)] ring-1 ring-[#173f35]/8"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[#173f35]">
                            {account.name}
                          </p>
                          <p className="mt-1 text-sm text-[#75807b]">
                            Saldo inicial{" "}
                            {formatBrlAmount(account.report.opening)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold tracking-[0.08em] text-[#7a847f] uppercase">
                            Saldo final
                          </p>
                          <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#173f35]">
                            {formatBrlAmount(account.report.closing)}
                          </p>
                        </div>
                      </div>
                      <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-[#e4e8e4] py-4 text-sm">
                        <div>
                          <dt className="text-[#7a847f]">Receitas</dt>
                          <dd className="mt-1 font-semibold text-[#267254]">
                            {formatBrlAmount(account.report.income)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#7a847f]">Despesas</dt>
                          <dd className="mt-1 font-semibold text-[#a3473d]">
                            {formatBrlAmount(account.report.expense)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#7a847f]">Ajustes</dt>
                          <dd className="mt-1 font-semibold text-[#7b6037]">
                            {formatBrlAmount(account.report.adjustments)}
                          </dd>
                        </div>
                      </dl>
                      {!account.archived && dashboard.canCorrect && (
                        <details className="group mt-4">
                          <summary className="w-fit cursor-pointer list-none rounded-lg px-2 py-1 text-sm font-semibold text-[#527064] outline-none hover:bg-[#edf2ee] focus-visible:ring-3 focus-visible:ring-[#74a995]/35">
                            Corrigir saldo inicial
                          </summary>
                          <div className="mt-4 rounded-2xl bg-[#f7f8f5] p-4">
                            <p className="mb-4 text-sm leading-6 text-[#66716c]">
                              Informe o saldo real no início do mês. A diferença
                              ficará registrada separadamente como ajuste.
                            </p>
                            <BalanceCorrectionForm
                              accountId={account.id}
                              accountName={account.name}
                              month={dashboard.month}
                              defaultValue={
                                account.correction?.actualBalance ??
                                account.report.opening
                              }
                            />
                          </div>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-3xl border border-dashed border-[#ccd7d0] bg-white/50 px-6 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma conta existia neste período.
                </p>
              )}
            </section>
          </>
        )}
        <section className="rounded-3xl border border-[#dfe4df] bg-white/70 px-6 py-5 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <h2 className="font-semibold text-[#173f35]">Acesso protegido</h2>
            <p className="mt-1 text-sm leading-6 text-[#66716c]">
              Seus dados financeiros pertencem ao acesso abaixo.
            </p>
          </div>
          <dl className="mt-4 min-w-0 sm:mt-0 sm:text-right">
            <dt className="text-xs font-semibold tracking-[0.08em] text-[#7a847f] uppercase">
              E-mail
            </dt>
            <dd className="mt-1 truncate text-sm font-medium text-[#30443c]">
              {dashboard.user.email}
            </dd>
          </dl>
        </section>
      </div>
    </PrivateShell>
  );
}
