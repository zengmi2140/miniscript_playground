'use client';

import { FileCode2, AlertTriangle } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { PathMap } from '@/components/flow/PathMap';
import { ConditionToggles } from './ConditionToggles';
import { TimeSlider } from './TimeSlider';
import { StatusBanner } from './StatusBanner';

export function CenterPanel() {
  const { t } = useI18n();
  const policy = usePlaygroundStore((s) => s.policy);
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);
  const compilationError = usePlaygroundStore((s) => s.compilationError);
  const semanticTree = usePlaygroundStore((s) => s.semanticTree);

  if (!policy && !compilationResult) {
    return <EmptyState />;
  }

  if (!compilationResult && !semanticTree) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="rounded-card border border-dashed border-border-default bg-surface-card p-8 text-center">
          <p className="text-body text-text-secondary">
            {compilationError
              ? t('playground.center.hasError')
              : t('playground.center.compilePlaceholder')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {compilationError && compilationResult && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-button bg-btc-600/10 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-btc-500" />
          <p className="text-[12px] text-btc-400">
            {t('playground.center.staleWarning')}
          </p>
        </div>
      )}

      <div className="px-4 pt-3">
        <StatusBanner />
      </div>

      <div className="relative min-h-0 flex-1">
        <PathMap />
      </div>

      <div className="flex flex-col gap-3 border-t border-border-subtle bg-surface-card px-4 py-3">
        <ConditionToggles />
        <TimeSlider />
      </div>
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="flex max-w-sm flex-col items-center rounded-card border border-dashed border-border-default bg-surface-card p-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-btc-500/10">
          <FileCode2 className="h-6 w-6 text-btc-500" />
        </div>
        <p className="mb-1.5 text-section-title text-text-secondary">
          {t('playground.empty.title')}
        </p>
        <p className="text-body text-text-muted">
          {t('playground.empty.subtitle')}
        </p>
      </div>
    </div>
  );
}
