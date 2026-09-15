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
    <li className="rounded-3xl bg-surface-raised p-5 shadow-[0_10px_30px_var(--shadow-soft)] ring-1 ring-border sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{account.name}</p>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase ring-1 ring-border/70">
              {financialAccountTypeLabels[account.type]}
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-foreground">
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
        <details className="group mt-5 border-t border-border pt-4">
          <summary className="w-fit cursor-pointer list-none rounded-lg px-2 py-1 text-sm font-semibold text-primary outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/35">
            Editar
          </summary>
          <div className="mt-5 rounded-2xl bg-surface p-4 ring-1 ring-border/70 sm:p-5">
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
          <p className="text-sm font-semibold text-primary">Organização</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl">
            Contas
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
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
                  className="text-2xl font-semibold tracking-[-0.03em] text-foreground"
                >
                  Contas ativas
                </h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
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
                <p className="mt-5 rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma conta ativa.
                </p>
              )}
            </section>

            {archived.length > 0 && (
              <section aria-labelledby="archived-accounts-title">
                <h2
                  id="archived-accounts-title"
                  className="text-2xl font-semibold tracking-[-0.03em] text-muted-foreground"
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
