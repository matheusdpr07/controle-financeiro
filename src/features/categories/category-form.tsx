"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createCategoryAction,
  updateCategoryAction,
  type CategoryFormState,
} from "@/features/categories/actions";
import type { CategoryDTO } from "@/features/categories/data";
import {
  categoryKindLabels,
  categoryKinds,
} from "@/features/categories/schemas";

const initialState: CategoryFormState = { status: "idle", message: "" };

export function CategoryForm({ category }: { category?: CategoryDTO }) {
  const action = category
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const prefix = category ? `category-${category.id}` : "new-category";

  useEffect(() => {
    if (!category && state.status === "success") formRef.current?.reset();
  }, [category, state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-name`}>Nome</Label>
        <Input
          id={`${prefix}-name`}
          name="name"
          defaultValue={category?.name}
          required
          minLength={2}
          maxLength={100}
          aria-invalid={Boolean(state.errors?.name)}
          aria-describedby={
            state.errors?.name ? `${prefix}-name-error` : undefined
          }
        />
        {state.errors?.name && (
          <p id={`${prefix}-name-error`} className="text-sm text-destructive">
            {state.errors.name[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-kind`}>Natureza</Label>
        <Select
          id={`${prefix}-kind`}
          name="kind"
          defaultValue={category?.kind ?? "EXPENSE"}
          aria-invalid={Boolean(state.errors?.kind)}
        >
          {categoryKinds.map((kind) => (
            <option key={kind} value={kind}>
              {categoryKindLabels[kind]}
            </option>
          ))}
        </Select>
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
        label={category ? "Salvar alterações" : "Criar categoria"}
        pendingLabel="Salvando…"
        className="w-full sm:w-auto"
      />
    </form>
  );
}
