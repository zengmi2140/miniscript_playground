'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';

interface OperatorSwitchPopoverProps {
  /** e.g. canvas: `absolute right-4 top-4 z-50` */
  className?: string;
  currentOp: 'all' | 'any' | 'threshold';
  currentThreshold?: number;
  realChildCount: number;
  onSwitch: (newOp: 'all' | 'any' | 'threshold', newThreshold?: number) => void;
  onClose: () => void;
}

export function OperatorSwitchPopover({
  className,
  currentOp,
  currentThreshold,
  realChildCount,
  onSwitch,
  onClose,
}: OperatorSwitchPopoverProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  // k value state used only when switching to threshold
  const defaultK = Math.min(2, Math.max(1, realChildCount));
  const [pendingK, setPendingK] = useState<number>(currentThreshold ?? defaultK);
  const [pendingOp, setPendingOp] = useState<'all' | 'any' | 'threshold'>(currentOp);

  useEffect(() => {
    const dk = Math.min(2, Math.max(1, realChildCount));
    setPendingK(currentThreshold ?? dk);
    setPendingOp(currentOp);
  }, [currentOp, currentThreshold, realChildCount]);

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleSelectOp(op: 'all' | 'any' | 'threshold') {
    setPendingOp(op);
    if (op !== 'threshold') {
      // Immediately apply non-threshold ops
      onSwitch(op);
      onClose();
    }
    // For threshold, wait for user to confirm k value
  }

  function handleConfirmThreshold() {
    onSwitch('threshold', pendingK);
    onClose();
  }

  const ops: { key: 'all' | 'any' | 'threshold'; label: string; desc: string }[] = [
    {
      key: 'all',
      label: t('builder.op.all.label'),
      desc: t('builder.op.all.desc'),
    },
    {
      key: 'any',
      label: t('builder.op.any.label'),
      desc: t('builder.op.any.desc'),
    },
    {
      key: 'threshold',
      label: t('builder.op.threshold.label'),
      desc: t('builder.op.threshold.desc'),
    },
  ];

  return (
    <div
      ref={ref}
      className={cn(
        'w-56 rounded-xl border border-border-subtle bg-surface-card shadow-xl',
        className,
      )}
    >
      <div className="p-3">
        <p className="mb-2 text-xs font-medium text-text-muted">{t('builder.op.switch.title')}</p>

        <div className="flex flex-col gap-1">
          {ops.map((op) => (
            <button
              key={op.key}
              onClick={() => handleSelectOp(op.key)}
              className={cn(
                'flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors',
                pendingOp === op.key
                  ? 'bg-btc-500/15 text-btc-500'
                  : 'text-text-primary hover:bg-surface-elevated',
              )}
            >
              <span className="text-xs font-semibold">{op.label}</span>
              <span className="text-[11px] text-text-muted leading-tight">{op.desc}</span>
            </button>
          ))}
        </div>

        {/* k value input — shown only when threshold is selected */}
        {pendingOp === 'threshold' && (
          <div className="mt-3 border-t border-border-subtle pt-3">
            <p className="mb-2 text-xs text-text-muted">
              {t('builder.op.threshold.k.label')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPendingK((k) => Math.max(1, k - 1))}
                disabled={pendingK <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle text-text-primary hover:bg-surface-elevated disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-sm font-semibold text-text-primary">
                {pendingK}&#8202;/&#8202;{Math.max(realChildCount, pendingK)}
              </span>
              <button
                onClick={() => setPendingK((k) => k + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle text-text-primary hover:bg-surface-elevated"
              >
                +
              </button>
            </div>
            <button
              onClick={handleConfirmThreshold}
              className="mt-2 w-full rounded-lg bg-btc-500 py-1.5 text-xs font-semibold text-white hover:bg-btc-600 transition-colors"
            >
              {t('builder.op.threshold.confirm')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
