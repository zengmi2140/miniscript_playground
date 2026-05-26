'use client';

import { ThemeProvider, type Theme } from '@/lib/theme/context';
import { I18nProvider, type Locale } from '@/lib/i18n/context';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({
  children,
  initialLocale,
  initialTheme,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialTheme: Theme;
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <I18nProvider initialLocale={initialLocale}>
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
