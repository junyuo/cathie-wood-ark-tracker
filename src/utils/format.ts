import type { Locale } from "../i18n/locale";

function localeName(locale: Locale) {
  return locale === "zh-TW" ? "zh-TW" : "en-US";
}

function notAvailable(locale: Locale) {
  return locale === "zh-TW" ? "不適用" : "n/a";
}

export function formatCurrency(value: number | null | undefined, locale: Locale = "en") {
  if (value === null || value === undefined || Number.isNaN(value)) return notAvailable(locale);
  return new Intl.NumberFormat(localeName(locale), { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number | null | undefined, locale: Locale = "en") {
  if (value === null || value === undefined || Number.isNaN(value)) return notAvailable(locale);
  return new Intl.NumberFormat(localeName(locale), { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number | null | undefined, locale: Locale = "en") {
  if (value === null || value === undefined || Number.isNaN(value)) return notAvailable(locale);
  return new Intl.NumberFormat(localeName(locale), { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
}

export function formatSignedNumber(value: number, locale: Locale = "en") {
  const formatted = formatNumber(Math.abs(value), locale);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}
