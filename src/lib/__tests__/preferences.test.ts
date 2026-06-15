import { afterEach, describe, expect, it } from 'vitest';
import {
  resolveLocalePreference,
  resolveThemePreference,
  toPreferenceCookie,
  SCRIPTWISE_LOCALE_COOKIE,
  SCRIPTWISE_THEME_COOKIE,
  SCRIPTWISE_PREFERENCE_COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  localeToHtmlLang,
} from '../preferences';

const ORIGINAL_PROTOCOL = window.location.protocol;

afterEach(() => {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, protocol: ORIGINAL_PROTOCOL },
    writable: true,
  });
});

function setProtocol(protocol: string): void {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, protocol },
    writable: true,
  });
}

describe('toPreferenceCookie', () => {
  it('appends Secure flag when protocol is https:', () => {
    setProtocol('https:');
    const cookie = toPreferenceCookie(SCRIPTWISE_THEME_COOKIE, 'dark');
    expect(cookie).toBe(
      `${SCRIPTWISE_THEME_COOKIE}=dark; Path=/; Max-Age=${SCRIPTWISE_PREFERENCE_COOKIE_MAX_AGE}; SameSite=Lax; Secure`,
    );
  });

  it('omits Secure flag when protocol is http:', () => {
    setProtocol('http:');
    const cookie = toPreferenceCookie(SCRIPTWISE_LOCALE_COOKIE, 'en');
    expect(cookie).toBe(
      `${SCRIPTWISE_LOCALE_COOKIE}=en; Path=/; Max-Age=${SCRIPTWISE_PREFERENCE_COOKIE_MAX_AGE}; SameSite=Lax`,
    );
    expect(cookie).not.toContain('Secure');
  });

  it('includes SameSite=Lax in both environments', () => {
    for (const protocol of ['http:', 'https:']) {
      setProtocol(protocol);
      expect(toPreferenceCookie('x', 'y')).toContain('SameSite=Lax');
    }
  });
});

describe('resolveLocalePreference', () => {
  it('returns en for "en"', () => {
    expect(resolveLocalePreference('en')).toBe('en');
  });

  it('returns default locale for non-en values', () => {
    expect(resolveLocalePreference('zh')).toBe(DEFAULT_LOCALE);
    expect(resolveLocalePreference(null)).toBe(DEFAULT_LOCALE);
    expect(resolveLocalePreference(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocalePreference('fr')).toBe(DEFAULT_LOCALE);
  });
});

describe('resolveThemePreference', () => {
  it('returns light for "light"', () => {
    expect(resolveThemePreference('light')).toBe('light');
  });

  it('returns default theme for non-light values', () => {
    expect(resolveThemePreference('dark')).toBe(DEFAULT_THEME);
    expect(resolveThemePreference(null)).toBe(DEFAULT_THEME);
    expect(resolveThemePreference(undefined)).toBe(DEFAULT_THEME);
  });
});

describe('localeToHtmlLang', () => {
  it('maps zh to zh-CN and en to en', () => {
    expect(localeToHtmlLang('zh')).toBe('zh-CN');
    expect(localeToHtmlLang('en')).toBe('en');
  });
});
