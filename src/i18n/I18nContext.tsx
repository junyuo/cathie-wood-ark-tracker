import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { TranslationKey } from "./messages";
import { LOCALE_STORAGE_KEY, resolveLocale, translate, type Locale } from "./locale";

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function storedLocale() {
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
    return resolveLocale(storedLocale(), browserLanguages);
  });
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>) => translate(locale, key, params), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, "document.title");
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Language selection remains active for this session when storage is unavailable.
    }
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
