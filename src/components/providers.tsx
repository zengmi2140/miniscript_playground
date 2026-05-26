'use client';

import { ThemeProvider } from '@/lib/theme/context';
import { I18nProvider } from '@/lib/i18n/context';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
