'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { zh } from './zh';
import { en } from './en';
import {
  DEFAULT_LOCALE,
  SCRIPTWISE_LOCALE_COOKIE,
  localeToHtmlLang,
  toPreferenceCookie,
  type LocalePreference,
} from '@/lib/preferences';

export type Locale = LocalePreference;

type DotPaths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : DotPaths<T[K], `${P}${K}.`>;
}[keyof T & string];

export type I18nKey = DotPaths<typeof zh>;

/** Recursive type that maps every leaf string literal to `string` (structure-only check). */
type DeepStringMap<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringMap<T[K]>;
};

type TranslationShape = DeepStringMap<typeof zh>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: I18nKey, params?: Record<string, string | number>) => string;
}

/** Safely walks a nested object via a dot-separated path, returning the string at that leaf or undefined. */
function resolvePath(obj: unknown, path: string): string | undefined {
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

const translations: Record<Locale, TranslationShape> = { zh, en };

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  /** For tests or SSR; default is zh. */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      document.cookie = toPreferenceCookie(SCRIPTWISE_LOCALE_COOKIE, newLocale);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = localeToHtmlLang(locale);
  }, [locale]);

  const t = useCallback(
    (key: I18nKey, params?: Record<string, string | number>) => {
      let text =
        resolvePath(translations[locale], key) ??
        resolvePath(translations['zh'], key) ??
        key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.split(`{${k}}`).join(String(v));
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
