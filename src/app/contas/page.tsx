import type { Metadata } from "next";
import { PrivateShell } from "@/components/private-shell";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccountForm } from "@/features/accounts/account-form";
import { setFinancialAccountArchivedAction } from "@/features/accounts/actions";
import {
  listFinancialAccounts,
  type FinancialAccountDTO,
} from "@/features/accounts/data";
import { financialAccountTypeLabels } from "@/features/accounts/schemas";
import { formatBrlAmount } from "@/lib/money";

export const metadata: Metadata = {
  title: "Contas | Controle Financeiro",
};

function AccountItem({ account }: { account: FinancialAccountDTO }) {
  return (
    <li className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(23,63,53,0.05)] ring-1 ring-[#173f35]/8 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[#173f35]">{account.name}</p>
            <span className="rounded-full bg-[#edf2ee] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#527064] uppercase">
              {financialAccountTypeLabels[account.type]}
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#1d2a26]">
            {formatBrlAmount(account.currentBalance)}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Saldo de abertura {formatBrlAmount(account.openingBalance)} em{" "}
            <time dateTime={account.openingBalanceDate}>
              {account.openingBalanceDate.split("-").reverse().join("/")}
            </time>
          </p>
        </div>
        <form action={setFinancialAccountArchivedAction}>
          <input type="hidden" name="id" value={account.id} />
          <input
            type="hidden"
            name="archived"
            value={account.archived ? "false" : "true"}
          />
          <SubmitButton
            label={account.archived ? "Restaurar" : "Arquivar"}
            pendingLabel="Aguarde…"
            variant="outline"
          />
        </form>
      </div>
      {!account.archived && (
        <details className="group mt-5 border-t border-[#e4e8e4] pt-4">
          <summary className="w-fit cursor-pointer list-none rounded-lg px-2 py-1 text-sm font-semibold text-[#527064] outline-none hover:bg-[#edf2ee] focus-visible:ring-3 focus-visible:ring-[#74a995]/35">
            Editar
          </summary>
          <div className="mt-5 rounded-2xl bg-[#f7f8f5] p-4 sm:p-5">
            <AccountForm account={account} />
          </div>
        </details>
      )}
    </li>
  );
}

export default async function AccountsPage() {
  const accounts = await listFinancialAccounts();
  const active = accounts.filter((account) => !account.archived);
  const archived = accounts.filter((account) => account.archived);

  return (
    <PrivateShell current="contas">
      <div className="space-y-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-[#527064]">Organização</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#173f35] sm:text-5xl">
            Contas
          </h1>
          <p className="mt-4 text-base leading-7 text-[#66716c]">
            Cadastre as contas e os meios que você deseja acompanhar.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.35fr)]">
          <Card className="lg:sticky lg:top-32">
            <CardHeader>
              <CardTitle>Nova conta</CardTitle>
              <CardDescription>
                O saldo informado será a base dos cálculos futuros.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountForm />
            </CardContent>
          </Card>

          <div className="space-y-10">
            <section aria-labelledby="active-accounts-title">
              <div className="flex items-end justify-between gap-4">
                <h2
                  id="active-accounts-title"
                  className="text-2xl font-semibold tracking-[-0.03em] text-[#173f35]"
                >
                  Contas ativas
                </h2>
                <span className="rounded-full bg-[#e7efe9] px-3 py-1 text-xs font-semibold text-[#527064]">
                  {active.length}
                </span>
              </div>
              {active.length ? (
                <ul className="mt-5 space-y-4">
                  {active.map((account) => (
                    <AccountItem key={account.id} account={account} />
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-3xl border border-dashed border-[#ccd7d0] bg-white/50 px-6 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma conta ativa.
                </p>
              )}
            </section>

            {archived.length > 0 && (
              <section aria-labelledby="archived-accounts-title">
                <h2
                  id="archived-accounts-title"
                  className="text-2xl font-semibold tracking-[-0.03em] text-[#65736d]"
                >
                  Contas arquivadas
                </h2>
                <ul className="mt-5 space-y-4 opacity-80">
                  {archived.map((account) => (
                    <AccountItem key={account.id} account={account} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </PrivateShell>
  );
}
