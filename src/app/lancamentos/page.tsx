import type { Metadata } from "next";
import Link from "next/link";
import { PrivateShell } from "@/components/private-shell";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  setFinancialEntryDeletedAction,
  setFinancialTransferDeletedAction,
} from "@/features/entries/actions";
import {
  getFinancialEntriesPageData,
  type EntryAccountOptionDTO,
  type EntryCategoryOptionDTO,
  type FinancialEntryDTO,
  type FinancialTransferDTO,
} from "@/features/entries/data";
import { EntryForm } from "@/features/entries/entry-form";
import { financialEntryKindLabels } from "@/features/entries/schemas";
import { TransferForm } from "@/features/entries/transfer-form";
import { formatBrlAmount } from "@/lib/money";

export const metadata: Metadata = {
  title: "Lançamentos | Controle Financeiro",
};

function formatFinancialDate(value: string) {
  return value.split("-").reverse().join("/");
}

function EntryItem({
  accounts,
  categories,
  entry,
}: {
  accounts: EntryAccountOptionDTO[];
  categories: EntryCategoryOptionDTO[];
  entry: FinancialEntryDTO;
}) {
  const canEdit =
    accounts.some(
      (account) => account.id === entry.account.id && !account.archived,
    ) &&
    (!entry.category ||
      categories.some(
        (category) => category.id === entry.category?.id && !category.archived,
      ));

  return (
    <li className="rounded-3xl bg-surface-raised p-5 shadow-[0_10px_30px_var(--shadow-soft)] ring-1 ring-border sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{entry.description}</p>
            <span
              className={
                entry.kind === "INCOME"
                  ? "rounded-full bg-income/10 px-2.5 py-1 text-[11px] font-semibold text-income-foreground ring-1 ring-income/20"
                  : "rounded-full bg-expense/10 px-2.5 py-1 text-[11px] font-semibold text-expense-foreground ring-1 ring-expense/20"
              }
            >
              {financialEntryKindLabels[entry.kind]}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {entry.account.name}
            {entry.category ? ` · ${entry.category.name}` : ""} ·{" "}
            <time dateTime={entry.occurredOn}>
              {formatFinancialDate(entry.occurredOn)}
            </time>
          </p>
          <p
            className={
              entry.kind === "INCOME"
                ? "mt-3 text-xl font-semibold tracking-[-0.025em] text-income-foreground"
                : "mt-3 text-xl font-semibold tracking-[-0.025em] text-expense-foreground"
            }
          >
            {entry.kind === "INCOME" ? "+" : "−"}{" "}
            {formatBrlAmount(entry.amount)}
          </p>
        </div>
        <form action={setFinancialEntryDeletedAction}>
          <input type="hidden" name="id" value={entry.id} />
          <input
            type="hidden"
            name="deleted"
            value={entry.deleted ? "false" : "true"}
          />
          <SubmitButton
            label={entry.deleted ? "Restaurar" : "Remover"}
            pendingLabel="Aguarde…"
            variant="outline"
          />
        </form>
      </div>
      {!entry.deleted && canEdit && (
        <details className="mt-5 border-t border-border pt-4">
          <summary className="w-fit cursor-pointer list-none rounded-lg px-2 py-1 text-sm font-semibold text-primary outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/35">
            Editar
          </summary>
          <div className="mt-5 rounded-2xl bg-surface p-4 ring-1 ring-border/70 sm:p-5">
            <EntryForm
              accounts={accounts}
              categories={categories}
              entry={entry}
            />
          </div>
        </details>
      )}
      {!entry.deleted && !canEdit && (
        <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground ring-1 ring-border/70">
          Restaure a conta ou categoria relacionada para editar este registro.
        </p>
      )}
    </li>
  );
}

function TransferItem({
  accounts,
  transfer,
}: {
  accounts: EntryAccountOptionDTO[];
  transfer: FinancialTransferDTO;
}) {
  const canEdit = [
    transfer.sourceAccount.id,
    transfer.destinationAccount.id,
  ].every((id) =>
    accounts.some((account) => account.id === id && !account.archived),
  );

  return (
    <li className="rounded-3xl bg-surface-raised p-5 shadow-[0_10px_30px_var(--shadow-soft)] ring-1 ring-border sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">
              {transfer.description}
            </p>
            <span className="rounded-full bg-transfer/10 px-2.5 py-1 text-[11px] font-semibold text-transfer-foreground ring-1 ring-transfer/20">
              Transferência
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {transfer.sourceAccount.name} → {transfer.destinationAccount.name} ·{" "}
            <time dateTime={transfer.occurredOn}>
              {formatFinancialDate(transfer.occurredOn)}
            </time>
          </p>
          <p className="mt-3 text-xl font-semibold tracking-[-0.025em] text-transfer-foreground">
            {formatBrlAmount(transfer.amount)}
          </p>
        </div>
        <form action={setFinancialTransferDeletedAction}>
          <input type="hidden" name="id" value={transfer.id} />
          <input
            type="hidden"
            name="deleted"
            value={transfer.deleted ? "false" : "true"}
          />
          <SubmitButton
            label={transfer.deleted ? "Restaurar" : "Remover"}
            pendingLabel="Aguarde…"
            variant="outline"
          />
        </form>
      </div>
      {!transfer.deleted && canEdit && (
        <details className="mt-5 border-t border-border pt-4">
          <summary className="w-fit cursor-pointer list-none rounded-lg px-2 py-1 text-sm font-semibold text-primary outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/35">
            Editar
          </summary>
          <div className="mt-5 rounded-2xl bg-surface p-4 ring-1 ring-border/70 sm:p-5">
            <TransferForm accounts={accounts} transfer={transfer} />
          </div>
        </details>
      )}
      {!transfer.deleted && !canEdit && (
        <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground ring-1 ring-border/70">
          Restaure as contas relacionadas para editar este registro.
        </p>
      )}
    </li>
  );
}

export default async function FinancialEntriesPage() {
  const { accounts, categories, entries, transfers } =
    await getFinancialEntriesPageData();
  const activeAccounts = accounts.filter((account) => !account.archived);
  const activeEntries = entries.filter((entry) => !entry.deleted);
  const activeTransfers = transfers.filter((transfer) => !transfer.deleted);
  const deletedEntries = entries.filter((entry) => entry.deleted);
  const deletedTransfers = transfers.filter((transfer) => transfer.deleted);

  return (
    <PrivateShell current="lancamentos">
      <div className="space-y-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-primary">Movimentações</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl">
            Lançamentos
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Registre informações para acompanhar suas finanças pessoais.
          </p>
        </header>

        <div className="grid items-start gap-8 xl:grid-cols-2">
          {activeAccounts.length > 0 ? (
            <Card className="border border-dashed border-border bg-surface/70 shadow-none ring-0">
              <CardHeader>
                <CardTitle>Novo lançamento</CardTitle>
                <CardDescription>
                  Receitas somam e despesas reduzem o saldo da conta escolhida.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EntryForm accounts={accounts} categories={categories} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Cadastre uma conta primeiro</CardTitle>
                <CardDescription>
                  Todo lançamento precisa pertencer a uma conta ativa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/contas">Ir para contas</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {activeAccounts.length >= 2 && (
            <Card className="bg-transfer/8 ring-transfer/20">
              <CardHeader>
                <CardTitle>Transferência entre contas</CardTitle>
                <CardDescription>
                  Registra uma saída e uma entrada equivalentes nos cálculos,
                  sem movimentar dinheiro de verdade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransferForm accounts={accounts} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid items-start gap-10 xl:grid-cols-2">
          <section aria-labelledby="entries-title">
            <div className="flex items-end justify-between gap-4">
              <h2
                id="entries-title"
                className="text-2xl font-semibold tracking-[-0.03em] text-foreground"
              >
                Receitas e despesas
              </h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
                {activeEntries.length}
              </span>
            </div>
            {activeEntries.length > 0 ? (
              <ul className="mt-5 space-y-4">
                {activeEntries.map((entry) => (
                  <EntryItem
                    key={entry.id}
                    accounts={accounts}
                    categories={categories}
                    entry={entry}
                  />
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhuma receita ou despesa registrada.
              </p>
            )}
          </section>

          <section aria-labelledby="transfers-title">
            <div className="flex items-end justify-between gap-4">
              <h2
                id="transfers-title"
                className="text-2xl font-semibold tracking-[-0.03em] text-foreground"
              >
                Transferências registradas
              </h2>
              <span className="rounded-full bg-transfer/10 px-3 py-1 text-xs font-semibold text-transfer-foreground ring-1 ring-transfer/20">
                {activeTransfers.length}
              </span>
            </div>
            {activeTransfers.length > 0 ? (
              <ul className="mt-5 space-y-4">
                {activeTransfers.map((transfer) => (
                  <TransferItem
                    key={transfer.id}
                    accounts={accounts}
                    transfer={transfer}
                  />
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhuma transferência registrada.
              </p>
            )}
          </section>
        </div>

        {(deletedEntries.length > 0 || deletedTransfers.length > 0) && (
          <section aria-labelledby="removed-title">
            <h2
              id="removed-title"
              className="text-2xl font-semibold tracking-[-0.03em] text-muted-foreground"
            >
              Registros removidos
            </h2>
            <ul className="mt-5 grid gap-4 opacity-80 xl:grid-cols-2">
              {deletedEntries.map((entry) => (
                <EntryItem
                  key={entry.id}
                  accounts={accounts}
                  categories={categories}
                  entry={entry}
                />
              ))}
              {deletedTransfers.map((transfer) => (
                <TransferItem
                  key={transfer.id}
                  accounts={accounts}
                  transfer={transfer}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </PrivateShell>
  );
}
