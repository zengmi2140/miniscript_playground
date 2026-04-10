'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { zh } from './zh';
import { en } from './en';

export type Locale = 'zh' | 'en';

type DotPaths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : DotPaths<T[K], `${P}${K}.`>;
}[keyof T & string];

export type I18nKey = DotPaths<typeof zh>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: I18nKey, params?: Record<string, string | number>) => string;
}

function resolvePath(obj: Record<string, unknown>, path: string): string | undefined {
  const val = path
    .split('.')
    .reduce<unknown>(
      (cur, seg) =>
        cur != null && typeof cur === 'object'
          ? (cur as Record<string, unknown>)[seg]
          : undefined,
      obj,
    );
  return typeof val === 'string' ? val : undefined;
}

const translations: Record<Locale, typeof zh> = {
  zh,
  en: en as unknown as typeof zh,
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = 'zh',
}: {
  children: ReactNode;
  /** For tests or SSR; default is zh. */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('miniscript-lab-locale');
      if (stored === 'zh' || stored === 'en') {
        setLocaleState(stored);
      }
    } catch {}
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('miniscript-lab-locale', newLocale);
    } catch {}
  }, []);

  const t = useCallback(
    (key: I18nKey, params?: Record<string, string | number>) => {
      let text =
        resolvePath(translations[locale] as unknown as Record<string, unknown>, key) ??
        resolvePath(translations['zh'] as unknown as Record<string, unknown>, key) ??
        key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
