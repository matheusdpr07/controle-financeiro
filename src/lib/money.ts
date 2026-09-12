const moneyInputPattern = /^-?\d{1,17}(?:[.,]\d{1,2})?$/;

export function normalizeMoneyInput(value: string) {
  const trimmed = value.trim();
  if (!moneyInputPattern.test(trimmed)) return null;

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [rawInteger, rawFraction = ""] = unsigned.replace(",", ".").split(".");
  const integer = rawInteger.replace(/^0+(?=\d)/, "");
  const fraction = rawFraction.padEnd(2, "0");
  const isZero = /^0+$/.test(integer) && fraction === "00";

  return `${negative && !isZero ? "-" : ""}${integer}.${fraction}`;
}

export function formatBrlAmount(value: string) {
  const normalized = normalizeMoneyInput(value);
  if (!normalized) throw new Error("Valor monetário inválido.");

  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [integer, fraction] = unsigned.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${negative ? "-" : ""}R$ ${grouped},${fraction}`;
}

export function isPositiveMoney(value: string) {
  const normalized = normalizeMoneyInput(value);
  return (
    normalized !== null && !normalized.startsWith("-") && normalized !== "0.00"
  );
}
