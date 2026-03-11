'use client';

import { GitCompareArrows } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function ComparePage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated">
          <GitCompareArrows className="h-8 w-8 text-text-muted" />
        </div>
        <h2 className="mb-2 text-section-title text-text-primary">
          {t('compare.comingSoon')}
        </h2>
        <p className="text-body text-text-secondary">
          {t('compare.description')}
        </p>
      </div>
    </div>
  );
}
