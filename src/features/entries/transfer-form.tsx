"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createFinancialTransferAction,
  updateFinancialTransferAction,
  type FinancialRecordFormState,
} from "@/features/entries/actions";
import type {
  EntryAccountOptionDTO,
  FinancialTransferDTO,
} from "@/features/entries/data";

const initialState: FinancialRecordFormState = {
  status: "idle",
  message: "",
};

export function TransferForm({
  accounts,
  transfer,
}: {
  accounts: EntryAccountOptionDTO[];
  transfer?: FinancialTransferDTO;
}) {
  const action = transfer
    ? updateFinancialTransferAction.bind(null, transfer.id)
    : createFinancialTransferAction;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const activeAccounts = accounts.filter((account) => !account.archived);
  const prefix = transfer ? `transfer-${transfer.id}` : "new-transfer";

  useEffect(() => {
    if (!transfer && state.status === "success") formRef.current?.reset();
  }, [state.status, transfer]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-description`}>Descrição</Label>
        <Input
          id={`${prefix}-description`}
          name="description"
          defaultValue={transfer?.description}
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
          <Label htmlFor={`${prefix}-source`}>Conta de origem</Label>
          <Select
            id={`${prefix}-source`}
            name="sourceAccountId"
            defaultValue={transfer?.sourceAccount.id ?? activeAccounts[0]?.id}
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
          <Label htmlFor={`${prefix}-destination`}>Conta de destino</Label>
          <Select
            id={`${prefix}-destination`}
            name="destinationAccountId"
            defaultValue={
              transfer?.destinationAccount.id ?? activeAccounts[1]?.id
            }
            required
          >
            {activeAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
          {state.errors?.destinationAccountId && (
            <p className="text-sm text-destructive">
              {state.errors.destinationAccountId[0]}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-amount`}>Valor</Label>
          <CurrencyInput
            id={`${prefix}-amount`}
            name="amount"
            defaultValue={transfer?.amount}
            required
            aria-invalid={Boolean(state.errors?.amount)}
          />
          {state.errors?.amount && (
            <p className="text-sm text-destructive">{state.errors.amount[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-date`}>Data</Label>
          <Input
            id={`${prefix}-date`}
            name="occurredOn"
            type="date"
            defaultValue={transfer?.occurredOn}
            required
            aria-invalid={Boolean(state.errors?.occurredOn)}
          />
          {state.errors?.occurredOn && (
            <p className="text-sm text-destructive">
              {state.errors.occurredOn[0]}
            </p>
          )}
        </div>
      </div>
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "rounded-xl bg-red-50 px-4 py-3 text-sm text-destructive"
              : "rounded-xl bg-[#e7efe9] px-4 py-3 text-sm text-[#315e4e]"
          }
        >
          {state.message}
        </p>
      )}
      <SubmitButton
        label={transfer ? "Salvar transferência" : "Registrar transferência"}
        pendingLabel="Salvando…"
        className="w-full sm:w-auto"
      />
    </form>
  );
}
