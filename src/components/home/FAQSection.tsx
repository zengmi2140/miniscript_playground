'use client';

import { useI18n } from '@/lib/i18n/context';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

export function FAQSection() {
  const { t } = useI18n();

  return (
    <section className="bg-surface-base py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {t('home.faq.title')}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          {t('home.faq.subtitle')}
        </p>

        <div className="mx-auto max-w-3xl divide-y divide-border-default rounded-xl border border-border-default">
          {FAQ_KEYS.map((key) => (
            <details key={key} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-text-primary transition-colors hover:bg-surface-elevated/50">
                <span className="pr-4 font-medium">
                  {t(`home.faq.items.${key}.q` as const)}
                </span>
                <span className="flex-shrink-0 text-text-tertiary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">
                {t(`home.faq.items.${key}.a` as const)}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
