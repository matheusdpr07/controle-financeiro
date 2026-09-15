"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";
import {
  createFinancialAccountAction,
  updateFinancialAccountAction,
  type FinancialAccountFormState,
} from "@/features/accounts/actions";
import type { FinancialAccountDTO } from "@/features/accounts/data";
import {
  financialAccountTypeLabels,
  financialAccountTypes,
  type FinancialAccountType,
} from "@/features/accounts/schemas";

const initialState: FinancialAccountFormState = {
  status: "idle",
  message: "",
};

export function AccountForm({ account }: { account?: FinancialAccountDTO }) {
  const action = account
    ? updateFinancialAccountAction.bind(null, account.id)
    : createFinancialAccountAction;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const prefix = account ? `account-${account.id}` : "new-account";
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<FinancialAccountType>(
    account?.type ?? "CHECKING",
  );
  const [openingBalance, setOpeningBalance] = useState(
    account?.openingBalance ?? "0.00",
  );
  const [openingBalanceDate, setOpeningBalanceDate] = useState(
    account?.openingBalanceDate ?? "",
  );

  useEffect(() => {
    if (!account && state.status === "success") {
      formRef.current?.reset();
    }
  }, [account, state.status]);

  function continueToOpeningBalance() {
    const nameInput = formRef.current?.elements.namedItem("name");
    if (nameInput instanceof HTMLInputElement && !nameInput.reportValidity()) {
      return;
    }
    setStep(2);
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5"
      onReset={() => {
        if (!account) {
          setName("");
          setType("CHECKING");
          setOpeningBalance("0.00");
          setOpeningBalanceDate("");
          setStep(1);
        }
      }}
    >
      {!account && (
        <p className="text-sm font-semibold text-primary">Etapa {step} de 2</p>
      )}
      {(account || step === 1) && (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-name`}>Nome</Label>
            <Input
              id={`${prefix}-name`}
              name="name"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              required
              minLength={2}
              maxLength={100}
              aria-invalid={Boolean(state.errors?.name)}
              aria-describedby={
                state.errors?.name ? `${prefix}-name-error` : undefined
              }
            />
            {state.errors?.name && (
              <p
                id={`${prefix}-name-error`}
                className="text-sm text-destructive"
              >
                {state.errors.name[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-type`}>Tipo</Label>
            <Select
              id={`${prefix}-type`}
              name="type"
              value={type}
              onChange={(event) =>
                setType(event.currentTarget.value as FinancialAccountType)
              }
              aria-invalid={Boolean(state.errors?.type)}
            >
              {financialAccountTypes.map((accountType) => (
                <option key={accountType} value={accountType}>
                  {financialAccountTypeLabels[accountType]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}
      {!account && step === 2 && (
        <>
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="type" value={type} />
        </>
      )}
      {(account || step === 2) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-balance`}>Saldo inicial</Label>
            <CurrencyInput
              id={`${prefix}-balance`}
              name="openingBalance"
              value={openingBalance}
              onValueChange={setOpeningBalance}
              allowNegative
              required
              aria-invalid={Boolean(state.errors?.openingBalance)}
              aria-describedby={
                state.errors?.openingBalance
                  ? `${prefix}-balance-error`
                  : undefined
              }
            />
            {state.errors?.openingBalance && (
              <p
                id={`${prefix}-balance-error`}
                className="text-sm text-destructive"
              >
                {state.errors.openingBalance[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-date`}>Data do saldo inicial</Label>
            <Input
              id={`${prefix}-date`}
              name="openingBalanceDate"
              type="date"
              value={openingBalanceDate}
              onChange={(event) =>
                setOpeningBalanceDate(event.currentTarget.value)
              }
              required
              aria-invalid={Boolean(state.errors?.openingBalanceDate)}
              aria-describedby={
                state.errors?.openingBalanceDate
                  ? `${prefix}-date-error`
                  : undefined
              }
            />
            {state.errors?.openingBalanceDate && (
              <p
                id={`${prefix}-date-error`}
                className="text-sm text-destructive"
              >
                {state.errors.openingBalanceDate[0]}
              </p>
            )}
          </div>
        </div>
      )}
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
      {!account && step === 1 ? (
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={continueToOpeningBalance}
        >
          Continuar para saldo inicial
        </Button>
      ) : (
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {!account && (
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Voltar
            </Button>
          )}
          <SubmitButton
            label={account ? "Salvar alterações" : "Criar conta"}
            pendingLabel="Salvando…"
            className="w-full sm:w-auto"
          />
        </div>
      )}
    </form>
  );
}
