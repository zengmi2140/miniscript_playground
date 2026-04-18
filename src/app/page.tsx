'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { HomepageHero } from '@/components/home/HomepageHero';
import { HomepageWallets } from '@/components/home/HomepageWallets';
import { TransitionSection } from '@/components/home/TransitionSection';
import { ScriptComplexitySection } from '@/components/home/ScriptComplexitySection';
import { MeetMiniscriptSection } from '@/components/home/MeetMiniscriptSection';
import { IntroApplicationsSection } from '@/components/intro/IntroApplicationsSection';

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
      <TransitionSection />
      <ScriptComplexitySection />
      <MeetMiniscriptSection />
      <IntroApplicationsSection />

      <HomepageWallets />

      <section className="border-t border-border-subtle bg-surface-card py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="mb-3 text-xl font-bold text-text-primary md:text-2xl">
            {t('home.cta.title')}
          </h2>
          <p className="mb-8 text-sm text-text-secondary md:text-base">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex justify-center">
            <Link
              href="/playground?mode=build"
              className="group inline-flex items-center gap-2 rounded-button bg-btc-500 px-6 py-3 text-sm font-semibold text-text-inverse transition-all hover:bg-btc-400"
            >
              {t('home.cta.build')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted md:hidden">
            {t('home.playground.desktopHint')}
          </p>
        </div>
      </section>

      <footer className="border-t border-border-subtle py-8">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-xs text-text-muted">{t('footer.description')}</p>
          <p className="mt-1 text-xs text-text-muted">{t('footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
}
