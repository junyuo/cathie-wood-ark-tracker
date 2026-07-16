import { en, messages, type TranslationKey } from "./messages.ts";

export type Locale = "en" | "zh-TW";
export const LOCALE_STORAGE_KEY = "ark-tracker-locale";

const TRADITIONAL_CHINESE = /^(zh-TW|zh-Hant|zh-HK|zh-MO)(-|$)/i;

export function detectLocale(languages: readonly string[]): Locale {
  return languages.some((language) => TRADITIONAL_CHINESE.test(language)) ? "zh-TW" : "en";
}

export function resolveLocale(stored: string | null, languages: readonly string[]): Locale {
  if (stored === "en" || stored === "zh-TW") return stored;
  return detectLocale(languages);
}

export function translate(locale: Locale, key: TranslationKey, params: Record<string, string | number> = {}) {
  const template = messages[locale][key] ?? en[key];
  return template.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match));
}
