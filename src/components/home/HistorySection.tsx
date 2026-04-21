'use client';

import { useI18n } from '@/lib/i18n/context';

const MILESTONE_KEYS = ['m1', 'm2', 'm3'] as const;

const DESIGNERS = [
  {
    key: 'd1',
    initial: 'P',
    color: 'bg-btc-500/15 text-btc-500',
  },
  {
    key: 'd2',
    initial: 'A',
    color: 'bg-blue-500/15 text-blue-500',
  },
  {
    key: 'd3',
    initial: 'S',
    color: 'bg-emerald-500/15 text-emerald-500',
  },
] as const;

export function HistorySection() {
  const { t } = useI18n();

  return (
    <section className="border-t border-border-subtle bg-surface-card py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {t('home.history.title')}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-text-secondary">
          {t('home.history.subtitle')}
        </p>

        {/* Timeline */}
        <div className="grid gap-6 md:grid-cols-3">
          {MILESTONE_KEYS.map((key) => (
            <div
              key={key}
              className="rounded-xl border border-border-default bg-surface-elevated p-6"
            >
              <p className="mb-2 font-mono text-sm font-semibold text-btc-500">
                {t(`home.history.milestones.${key}.year` as const)}
              </p>
              <p className="mb-2 font-semibold text-text-primary">
                {t(`home.history.milestones.${key}.title` as const)}
              </p>
              <p className="text-sm text-text-secondary">
                {t(`home.history.milestones.${key}.desc` as const)}
              </p>
            </div>
          ))}
        </div>

        {/* Designers */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {DESIGNERS.map((d) => (
            <div
              key={d.key}
              className="rounded-xl border border-border-default bg-surface-elevated p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${d.color}`}
                >
                  {d.initial}
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  {t(`home.history.designers.${d.key}.name` as const)}
                </p>
              </div>
              <p className="text-sm text-text-secondary">
                {t(`home.history.designers.${d.key}.desc` as const)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
