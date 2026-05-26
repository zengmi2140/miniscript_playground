'use client';

import { useCallback, useRef } from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { ConditionChip } from '@/components/shared/ConditionChip';
import { cn } from '@/lib/utils/cn';
import type { SpendingPath } from '@/lib/engine/types';
import { formatSpendingPathLabel } from '@/lib/engine/path-label';

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

function PathCard({
  path,
  isSelected,
  tabIndex,
  onSelect,
  onKeyDown,
  optionRef,
}: {
  path: SpendingPath;
  isSelected: boolean;
  tabIndex: number;
  onSelect: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  optionRef?: (el: HTMLButtonElement | null) => void;
}) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      tabIndex={tabIndex}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      ref={optionRef}
      className={cn(
        'w-full rounded-card border border-l-[3px] border-border-subtle bg-surface-base p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
        path.satisfiable
          ? 'border-l-semantic-satisfied'
          : 'border-l-semantic-locked opacity-60',
        isSelected && 'border-border-active ring-1 ring-border-active',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-medium text-text-primary">
          {formatSpendingPathLabel(path, t)}
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
        <span>{t('playground.paths.witness', { size: path.witnessSize })}</span>
        {path.isMalleable && (
          <span className="flex items-center gap-1 text-semantic-warning">
            <AlertTriangle className="h-3 w-3" />
            {t('playground.paths.malleable')}
          </span>
        )}
      </div>
    </button>
  );
}

export function PathsTab() {
  const spendingPaths = usePlaygroundStore((s) => s.spendingPaths);
  const selectedPathIndex = usePlaygroundStore((s) => s.selectedPathIndex);
  const setSelectedPathIndex = usePlaygroundStore((s) => s.setSelectedPathIndex);
  const { t } = useI18n();
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusableIndex =
    selectedPathIndex !== null && selectedPathIndex < spendingPaths.length
      ? selectedPathIndex
      : 0;

  const handleOptionKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (spendingPaths.length === 0) return;

      let nextIndex: number | null = null;
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          nextIndex = (index + 1) % spendingPaths.length;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          nextIndex = (index - 1 + spendingPaths.length) % spendingPaths.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = spendingPaths.length - 1;
          break;
        default:
          break;
      }

      if (nextIndex === null) return;
      event.preventDefault();
      setSelectedPathIndex(nextIndex);
      optionRefs.current[nextIndex]?.focus();
    },
    [spendingPaths, setSelectedPathIndex],
  );

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
    <div className="flex flex-col gap-2" role="listbox" aria-label={t('playground.results.paths')}>
      {spendingPaths.map((path, index) => (
        <PathCard
          key={path.index}
          path={path}
          isSelected={selectedPathIndex === index}
          tabIndex={focusableIndex === index ? 0 : -1}
          onSelect={() => setSelectedPathIndex(index)}
          onKeyDown={(e) => handleOptionKeyDown(e, index)}
          optionRef={(el) => {
            optionRefs.current[index] = el;
          }}
        />
      ))}
    </div>
  );
}
