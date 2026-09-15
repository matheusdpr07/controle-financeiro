"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  saveBalanceCorrectionAction,
  type BalanceCorrectionFormState,
} from "@/features/dashboard/actions";

const initialState: BalanceCorrectionFormState = {
  status: "idle",
  message: "",
};

export function BalanceCorrectionForm({
  accountId,
  accountName,
  month,
  defaultValue,
}: {
  accountId: string;
  accountName: string;
  month: string;
  defaultValue: string;
}) {
  const [state, formAction] = useActionState(
    saveBalanceCorrectionAction,
    initialState,
  );
  const inputId = `balance-correction-${accountId}`;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="financialAccountId" value={accountId} />
      <input type="hidden" name="month" value={month} />
      <div className="space-y-2">
        <Label htmlFor={inputId}>Saldo real de {accountName}</Label>
        <CurrencyInput
          id={inputId}
          name="actualBalance"
          defaultValue={defaultValue}
          allowNegative
          required
          aria-invalid={Boolean(state.errors?.actualBalance)}
          aria-describedby={
            state.errors?.actualBalance ? `${inputId}-error` : undefined
          }
        />
        {state.errors?.actualBalance && (
          <p id={`${inputId}-error`} className="text-sm text-destructive">
            {state.errors.actualBalance[0]}
          </p>
        )}
      </div>
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm font-medium text-income-foreground"
          }
        >
          {state.message}
        </p>
      )}
      <SubmitButton
        label="Registrar ajuste"
        pendingLabel="Registrando…"
        className="w-full sm:w-auto"
      />
    </form>
  );
}
