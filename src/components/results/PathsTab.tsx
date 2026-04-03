'use client';

import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { ConditionChip } from '@/components/shared/ConditionChip';
import { cn } from '@/lib/utils/cn';
import type { SpendingPath } from '@/lib/engine/types';

function PathStatusIcon({ path }: { path: SpendingPath }) {
  if (path.satisfiable) {
    return <CheckCircle2 className="h-4 w-4 text-semantic-satisfied" />;
  }
  const missing = path.missingConditions ?? [];
  const hasTimelockMissing = missing.some(
    (c) => c.type === 'timelock_relative' || c.type === 'timelock_absolute',
  );
  if (hasTimelockMissing && missing.length === 1) {
    return <Clock className="h-4 w-4 text-semantic-timelock" />;
  }
  return <XCircle className="h-4 w-4 text-semantic-locked" />;
}

function PathCard({ path }: { path: SpendingPath }) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'rounded-card border-l-[3px] border border-border-subtle bg-surface-base p-3 transition-all',
        path.satisfiable
          ? 'border-l-semantic-satisfied'
          : 'border-l-semantic-locked opacity-60',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-medium text-text-primary">
          {path.label}
        </span>
        <PathStatusIcon path={path} />
      </div>

      {path.conditions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {path.conditions.map((cond, i) => (
            <ConditionChip key={i} condition={cond} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[12px] text-text-muted">
        <span>Witness: ~{path.witnessSize} vB</span>
        {path.isMalleable && (
          <span className="flex items-center gap-1 text-semantic-warning">
            <AlertTriangle className="h-3 w-3" />
            {t('playground.paths.malleable')}
          </span>
        )}
      </div>
    </div>
  );
}

export function PathsTab() {
  const spendingPaths = usePlaygroundStore((s) => s.spendingPaths);
  const { t } = useI18n();

  if (spendingPaths.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-text-muted">
          {t('playground.paths.empty')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {spendingPaths.map((path) => (
        <PathCard key={path.index} path={path} />
      ))}
    </div>
  );
}
