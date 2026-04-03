'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Key, Users, ShieldCheck, Heart, Vault, Lock, Code2, GitBranch, Layers, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { ScenarioGallery } from '@/components/scenarios/ScenarioGallery';
import { HomepageHero } from '@/components/home/HomepageHero';
import { HomepageMiniscriptExplainer } from '@/components/home/HomepageMiniscriptExplainer';
import { HomepageMission } from '@/components/home/HomepageMission';
import { HomepageFeatures } from '@/components/home/HomepageFeatures';
import { HomepageHowItWorks } from '@/components/home/HomepageHowItWorks';

export default function ScenariosPage() {
  const { t } = useI18n();

  // Prefetch all Playground modules while the user browses the homepage.
  // Using requestIdleCallback so this never competes with homepage rendering.
  // After the first download, the browser caches every chunk — subsequent
  // visits to /playground are instant even after a normal refresh (HTTP cache).
  useEffect(() => {
    const prefetch = () => {
      // Core canvas components (heavy — ReactFlow, lucide icons)
      import('@/components/flow/PathMap');
      import('@/components/builder/BuilderCanvas');
      import('@/components/builder/BuilderNodes');
      // Three-column shell and panels (lightweight but must hydrate fast)
      import('@/components/playground/ThreeColumnLayout');
      import('@/components/playground/LeftPanel');
      import('@/components/playground/RightPanel');
      import('@/components/playground/CenterPanel');
      // Compiler hook (initialises WASM)
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
      <HomepageMiniscriptExplainer />
      <HomepageMission />
      <HomepageHowItWorks />
      <HomepageFeatures />

      {/* Scenario Gallery */}
      <section id="scenarios" className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
        <div className="mb-8 text-center md:mb-10">
          <span className="mb-3 inline-block rounded-full border border-btc-500/20 bg-btc-500/10 px-3 py-1 text-xs font-medium text-btc-500">
            {t('home.scenarios.label')}
          </span>
          <h2 className="mb-3 text-2xl font-bold text-text-primary md:text-3xl">
            {t('home.scenarios.title')}
          </h2>
          <p className="text-sm text-text-secondary md:text-base">
            {t('home.scenarios.subtitle')}
          </p>
        </div>
        <ScenarioGallery />
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border-subtle bg-surface-card py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="mb-3 text-xl font-bold text-text-primary md:text-2xl">
            {t('home.cta.title')}
          </h2>
          <p className="mb-8 text-sm text-text-secondary md:text-base">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/playground"
              className="group inline-flex items-center gap-2 rounded-button bg-btc-500 px-6 py-3 text-sm font-semibold text-text-inverse transition-all hover:bg-btc-400"
            >
              {t('home.cta.playground')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/playground?mode=build"
              className="group inline-flex items-center gap-2 rounded-button border border-border-default bg-surface-elevated px-6 py-3 text-sm font-medium text-text-primary transition-all hover:border-border-hover hover:bg-surface-overlay"
            >
              {t('home.cta.build')}
              <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-xs text-text-muted">{t('footer.description')}</p>
          <p className="mt-1 text-xs text-text-muted">{t('footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
}
