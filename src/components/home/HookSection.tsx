'use client';

import { useI18n } from '@/lib/i18n/context';

export function HookSection() {
  const { t } = useI18n();

  return (
    <section className="bg-surface-base py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <p className="mb-8 text-sm font-medium text-btc-500">
          {t('home.hook.eyebrow')}
        </p>

        <div className="space-y-3 text-lg text-text-primary md:text-xl">
          <p>{t('home.hook.q1')}</p>
          <p>{t('home.hook.q2')}</p>
          <p>{t('home.hook.q3')}</p>
        </div>

        <p className="mt-8 text-text-secondary">{t('home.hook.outro')}</p>
      </div>
    </section>
  );
}
