'use client';

import { GitCompareArrows, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

const FEATURE_KEYS = [
  'compare.feature.1',
  'compare.feature.2',
  'compare.feature.3',
  'compare.feature.4',
] as const;

export default function ComparePage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-btc-500/10">
          <GitCompareArrows className="h-8 w-8 text-btc-500" />
        </div>

        <h2 className="mb-3 text-[22px] font-semibold text-text-primary">
          {t('compare.comingSoon')}
        </h2>
        <p className="mb-8 text-body text-text-secondary">
          {t('compare.description')}
        </p>

        <div className="rounded-2xl border border-border-subtle bg-surface-elevated px-6 py-5 text-left">
          <p className="mb-4 text-small font-semibold uppercase tracking-wider text-text-muted">
            {t('compare.featureList.title')}
          </p>
          <ul className="space-y-3">
            {FEATURE_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-btc-500/50" />
                <span className="text-body text-text-secondary">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
