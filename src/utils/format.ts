export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return `${value.toFixed(2)}%`;
}

export function formatSignedNumber(value: number) {
  const formatted = formatNumber(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}
