"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createFinancialEntryAction,
  updateFinancialEntryAction,
  type FinancialRecordFormState,
} from "@/features/entries/actions";
import type {
  EntryAccountOptionDTO,
  EntryCategoryOptionDTO,
  FinancialEntryDTO,
} from "@/features/entries/data";
import {
  financialEntryKindLabels,
  financialEntryKinds,
  type FinancialEntryKind,
} from "@/features/entries/schemas";

const initialState: FinancialRecordFormState = {
  status: "idle",
  message: "",
};

export function EntryForm({
  accounts,
  categories,
  entry,
}: {
  accounts: EntryAccountOptionDTO[];
  categories: EntryCategoryOptionDTO[];
  entry?: FinancialEntryDTO;
}) {
  const action = entry
    ? updateFinancialEntryAction.bind(null, entry.id)
    : createFinancialEntryAction;
  const [state, formAction] = useActionState(action, initialState);
  const [kind, setKind] = useState<FinancialEntryKind>(
    entry?.kind ?? "EXPENSE",
  );
  const formRef = useRef<HTMLFormElement>(null);
  const prefix = entry ? `entry-${entry.id}` : "new-entry";
  const activeAccounts = accounts.filter((account) => !account.archived);
  const activeCategories = categories.filter(
    (category) => !category.archived && category.kind === kind,
  );

  useEffect(() => {
    if (!entry && state.status === "success") formRef.current?.reset();
  }, [entry, state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-description`}>Descrição</Label>
        <Input
          id={`${prefix}-description`}
          name="description"
          defaultValue={entry?.description}
          required
          minLength={2}
          maxLength={120}
          aria-invalid={Boolean(state.errors?.description)}
        />
        {state.errors?.description && (
          <p className="text-sm text-destructive">
            {state.errors.description[0]}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-kind`}>Tipo</Label>
          <Select
            id={`${prefix}-kind`}
            name="kind"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as FinancialEntryKind)
            }
          >
            {financialEntryKinds.map((value) => (
              <option key={value} value={value}>
                {financialEntryKindLabels[value]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-amount`}>Valor</Label>
          <CurrencyInput
            id={`${prefix}-amount`}
            name="amount"
            defaultValue={entry?.amount}
            required
            aria-invalid={Boolean(state.errors?.amount)}
          />
          {state.errors?.amount && (
            <p className="text-sm text-destructive">{state.errors.amount[0]}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-account`}>Conta</Label>
          <Select
            id={`${prefix}-account`}
            name="financialAccountId"
            defaultValue={entry?.account.id ?? activeAccounts[0]?.id}
            required
          >
            {activeAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-category`}>Categoria</Label>
          <Select
            key={`${kind}-${entry?.category?.id ?? "none"}`}
            id={`${prefix}-category`}
            name="categoryId"
            defaultValue={
              entry?.category && entry.kind === kind ? entry.category.id : ""
            }
          >
            <option value="">Sem categoria</option>
            {activeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-date`}>Data</Label>
        <Input
          id={`${prefix}-date`}
          name="occurredOn"
          type="date"
          defaultValue={entry?.occurredOn}
          required
          aria-invalid={Boolean(state.errors?.occurredOn)}
        />
        {state.errors?.occurredOn && (
          <p className="text-sm text-destructive">
            {state.errors.occurredOn[0]}
          </p>
        )}
      </div>
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/15"
              : "rounded-xl bg-income/10 px-4 py-3 text-sm text-income-foreground ring-1 ring-income/20"
          }
        >
          {state.message}
        </p>
      )}
      <SubmitButton
        label={entry ? "Salvar lançamento" : "Criar lançamento"}
        pendingLabel="Salvando…"
        className="w-full sm:w-auto"
      />
    </form>
  );
}
