'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function HomepageMission() {
  const { t } = useI18n();

  return (
    <section className="border-b border-border-subtle bg-surface-card py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-10">
          {/* Left: label + title + desc */}
          <div className="flex-1">
            <span className="mb-3 inline-block rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-muted">
              {t('home.explainer.mission.label')}
            </span>
            <h2 className="mb-3 text-xl font-bold text-text-primary md:text-2xl">
              {t('home.explainer.mission.title')}
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              {t('home.explainer.mission.desc')}
            </p>
          </div>

          {/* Right: CTA */}
          <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
            <Link
              href="/playground"
              className="group inline-flex items-center gap-2 rounded-button bg-btc-500 px-5 py-2.5 text-sm font-semibold text-text-inverse transition-all hover:bg-btc-400"
            >
              {t('home.cta.playground')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/playground?mode=build"
              className="group inline-flex items-center gap-2 rounded-button border border-border-default bg-surface-elevated px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-border-hover"
            >
              {t('home.cta.build')}
              <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
