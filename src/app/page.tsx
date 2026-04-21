'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { HomepageHero } from '@/components/home/HomepageHero';
import { HookSection } from '@/components/home/HookSection';
import { TransitionSection } from '@/components/home/TransitionSection';
import { ScriptComplexitySection } from '@/components/home/ScriptComplexitySection';
import { MeetMiniscriptSection } from '@/components/home/MeetMiniscriptSection';
import { IntroApplicationsSection } from '@/components/intro/IntroApplicationsSection';
import { HistorySection } from '@/components/home/HistorySection';
import { HomepageWallets } from '@/components/home/HomepageWallets';
import { FAQSection } from '@/components/home/FAQSection';
import { ScrollReveal } from '@/components/home/ScrollReveal';

export default function HomePage() {
  const { t } = useI18n();

  useEffect(() => {
    const prefetch = () => {
      import('@/components/flow/PathMap');
      import('@/components/builder/BuilderCanvas');
      import('@/components/builder/BuilderNodes');
      import('@/components/playground/ThreeColumnLayout');
      import('@/components/playground/LeftPanel');
      import('@/components/playground/RightPanel');
      import('@/components/playground/CenterPanel');
      import('@/lib/hooks/useCompiler');
    };

    const id =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(prefetch)
        : window.setTimeout(prefetch, 2000);

    return () => {
      if (typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(id as number);
      } else {
        clearTimeout(id as number);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <HomepageHero />

      <ScrollReveal>
        <HookSection />
      </ScrollReveal>

      <ScrollReveal>
        <TransitionSection />
      </ScrollReveal>

      <ScrollReveal>
        <ScriptComplexitySection />
      </ScrollReveal>

      <ScrollReveal>
        <MeetMiniscriptSection />
      </ScrollReveal>

      <ScrollReveal>
        <IntroApplicationsSection />
      </ScrollReveal>

      <ScrollReveal>
        <HistorySection />
      </ScrollReveal>

      <ScrollReveal>
        <HomepageWallets />
      </ScrollReveal>

      <ScrollReveal>
        <FAQSection />
      </ScrollReveal>

      <ScrollReveal>
        <section className="border-t border-border-subtle bg-surface-card py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t('home.cta.title')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary md:text-base">
              {t('home.cta.subtitle')}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/playground"
                className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                {t('home.cta.primary')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-md border border-border-subtle px-6 py-2.5 text-sm font-medium transition-colors hover:bg-surface-hover"
              >
                {t('home.cta.secondary')}
              </Link>
            </div>
            <p className="mt-4 text-xs text-text-muted md:hidden">
              {t('home.cta.desktopHint')}
            </p>
          </div>
        </section>
      </ScrollReveal>

      <footer className="border-t border-border-subtle py-8">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-xs text-text-muted">{t('home.footer.description')}</p>
          <p className="mt-1 text-xs text-text-muted">{t('home.footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
}
