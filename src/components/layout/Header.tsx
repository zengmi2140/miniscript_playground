'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Bitcoin, Menu, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useTheme } from '@/lib/theme/context';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { key: 'nav.scenarios', path: '/' },
  { key: 'nav.playground', path: '/playground' },
  { key: 'nav.compare', path: '/compare' },
] as const;

export function Header() {
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-button bg-btc-500">
              <Bitcoin className="h-5 w-5 text-text-inverse" />
            </div>
            <span className="text-[15px] font-semibold text-text-primary">
              Miniscript Lab
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.path);
              const isComingSoon = item.path === '/compare';

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    'relative rounded-button px-3 py-1.5 text-body transition-colors',
                    isActive
                      ? 'text-btc-500'
                      : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  {t(item.key)}
                  {isComingSoon && (
                    <span className="ml-1.5 text-[10px] italic text-text-muted">
                      Soon
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-btc-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
            className="rounded-button px-3 py-1.5 text-small text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
          >
            {locale === 'zh' ? '中/EN' : 'EN/中'}
          </button>

          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-button text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label={theme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-button text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border-subtle bg-surface-base md:hidden">
          <nav className="flex flex-col px-4 py-2">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.path);
              const isComingSoon = item.path === '/compare';

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-button px-3 py-3 text-body transition-colors',
                    isActive
                      ? 'text-btc-500'
                      : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  {t(item.key)}
                  {isComingSoon && (
                    <span className="text-[10px] italic text-text-muted">Soon</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
