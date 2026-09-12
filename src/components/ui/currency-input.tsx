"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { formatBrlAmount, normalizeMoneyInput } from "@/lib/money";

type CurrencyInputProps = Omit<
  ComponentProps<typeof Input>,
  "defaultValue" | "name" | "onChange" | "type" | "value"
> & {
  name: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  allowNegative?: boolean;
};

function toNormalizedValue(value: string, allowNegative: boolean) {
  const negative = allowNegative && value.includes("-");
  const digits = value
    .replace(/\D/g, "")
    .slice(-19)
    .replace(/^0+(?=\d)/, "");
  const padded = (digits || "0").padStart(3, "0");
  const integer = padded.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
  const fraction = padded.slice(-2);
  const isZero = integer === "0" && fraction === "00";
  return `${negative && !isZero ? "-" : ""}${integer}.${fraction}`;
}

export function CurrencyInput({
  name,
  defaultValue = "0.00",
  value: controlledValue,
  onValueChange,
  allowNegative = false,
  onFocus,
  ...props
}: CurrencyInputProps) {
  const initialValue = normalizeMoneyInput(defaultValue) ?? "0.00";
  const [internalValue, setInternalValue] = useState(initialValue);
  const value = controlledValue ?? internalValue;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const reset = () => {
      if (controlledValue === undefined) setInternalValue(initialValue);
      onValueChange?.(initialValue);
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [initialValue, controlledValue, onValueChange]);

  return (
    <>
      <Input
        {...props}
        ref={inputRef}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={formatBrlAmount(value)}
        onChange={(event) => {
          const nextValue = toNormalizedValue(
            event.currentTarget.value,
            allowNegative,
          );
          if (controlledValue === undefined) setInternalValue(nextValue);
          onValueChange?.(nextValue);
        }}
        onFocus={(event) => {
          event.currentTarget.select();
          onFocus?.(event);
        }}
      />
      <input type="hidden" name={name} value={value} />
    </>
  );
}
