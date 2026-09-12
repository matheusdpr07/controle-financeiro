import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";

test("formata centavos em reais e envia o decimal normalizado", () => {
  const { container } = render(
    <div>
      <Label htmlFor="amount">Valor</Label>
      <CurrencyInput id="amount" name="amount" />
    </div>,
  );

  const input = screen.getByLabelText("Valor");
  const hidden = container.querySelector<HTMLInputElement>(
    'input[type="hidden"][name="amount"]',
  );
  expect(input).toHaveValue("R$ 0,00");
  expect(hidden).toHaveValue("0.00");

  fireEvent.change(input, { target: { value: "123456" } });

  expect(input).toHaveValue("R$ 1.234,56");
  expect(hidden).toHaveValue("1234.56");
});

test("permite saldo negativo quando o campo autoriza", () => {
  const { container } = render(
    <CurrencyInput
      aria-label="Saldo real"
      id="balance"
      name="balance"
      allowNegative
    />,
  );

  const input = screen.getByLabelText("Saldo real");
  const hidden = container.querySelector<HTMLInputElement>(
    'input[type="hidden"][name="balance"]',
  );
  fireEvent.change(input, { target: { value: "-1234" } });

  expect(input).toHaveValue("-R$ 12,34");
  expect(hidden).toHaveValue("-12.34");
});
