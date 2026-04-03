'use client';

import { useI18n } from '@/lib/i18n/context';

export function HomepageMission() {
  const { t } = useI18n();

  return (
    <section className="border-b border-border-subtle bg-surface-base py-14 md:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <span className="mb-3 inline-block rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-muted">
          {t('home.explainer.mission.label')}
        </span>
        <h2 className="mb-4 text-2xl font-bold text-text-primary md:text-3xl">
          {t('home.explainer.mission.title')}
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
          {t('home.explainer.mission.desc')}
        </p>
      </div>
    </section>
  );
}
