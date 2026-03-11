'use client';

import Link from 'next/link';
import { ArrowRight, Bitcoin } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { ScenarioGallery } from '@/components/scenarios/ScenarioGallery';

export default function ScenariosPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-btc-500/10">
            <Bitcoin className="h-8 w-8 text-btc-500" />
          </div>
        </div>
        <h1 className="mb-3 text-page-title text-text-primary">
          {t('scenarios.title')}
        </h1>
        <p className="text-body text-text-secondary">
          {t('scenarios.subtitle')}
        </p>
      </div>

      <ScenarioGallery />

      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-border-default" />
          <span className="text-small text-text-muted">
            {t('scenarios.orWrite')}
          </span>
          <div className="h-px w-16 bg-border-default" />
        </div>

        <Link
          href="/playground"
          className="group inline-flex items-center gap-2 rounded-button border border-border-default bg-surface-elevated px-5 py-2.5 text-body font-medium text-text-primary transition-all hover:border-border-hover hover:bg-surface-overlay"
        >
          {t('scenarios.openBlank')}
          <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary" />
        </Link>
      </div>

      <footer className="mt-20 border-t border-border-subtle pt-8 text-center">
        <p className="text-small text-text-muted">
          {t('footer.description')}
        </p>
        <p className="mt-2 text-small text-text-muted">
          {t('footer.rights')}
        </p>
      </footer>
    </div>
  );
}
