export type LocalePreference = 'zh' | 'en';
export type ThemePreference = 'dark' | 'light';

export const SCRIPTWISE_LOCALE_COOKIE = 'scriptwise-locale';
export const SCRIPTWISE_THEME_COOKIE = 'scriptwise-theme';
export const SCRIPTWISE_PREFERENCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const DEFAULT_LOCALE: LocalePreference = 'zh';
export const DEFAULT_THEME: ThemePreference = 'dark';

export function resolveLocalePreference(value: string | null | undefined): LocalePreference {
  return value === 'en' ? 'en' : DEFAULT_LOCALE;
}

export function resolveThemePreference(value: string | null | undefined): ThemePreference {
  return value === 'light' ? 'light' : DEFAULT_THEME;
}

export function localeToHtmlLang(locale: LocalePreference): 'zh-CN' | 'en' {
  return locale === 'zh' ? 'zh-CN' : 'en';
}

export function toPreferenceCookie(name: string, value: string): string {
  return `${name}=${value}; Path=/; Max-Age=${SCRIPTWISE_PREFERENCE_COOKIE_MAX_AGE}; SameSite=Lax`;
}
