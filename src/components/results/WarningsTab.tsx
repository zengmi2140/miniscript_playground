'use client';

import { AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import type { SpendingPath } from '@/lib/engine/types';

interface Warning {
  level: 'error' | 'warning' | 'info';
  message: string;
}

function generateWarnings(
  paths: SpendingPath[],
  t: (key: string, params?: Record<string, string | number>) => string,
): Warning[] {
  const warnings: Warning[] = [];

  const hasNoSigPath = paths.some(
    (p) => p.conditions.filter((c) => c.type === 'signature').length === 0,
  );
  if (hasNoSigPath) {
    warnings.push({
      level: 'error',
      message: t('warnings.noSigPath'),
    });
  }

  const malleablePaths = paths.filter((p) => p.isMalleable);
  if (malleablePaths.length > 0) {
    warnings.push({
      level: 'warning',
      message: t('warnings.malleable', { count: malleablePaths.length }),
    });
  }

  const maxWitness = Math.max(...paths.map((p) => p.witnessSize), 0);
  if (maxWitness > 500) {
    warnings.push({
      level: 'info',
      message: t('warnings.largeWitness', { size: maxWitness }),
    });
  }

  return warnings;
}

const LEVEL_CONFIG = {
  error: {
    icon: ShieldAlert,
    bg: 'bg-semantic-warning/10',
    border: 'border-l-semantic-warning',
    iconColor: 'text-semantic-warning',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-semantic-timelock/10',
    border: 'border-l-semantic-timelock',
    iconColor: 'text-semantic-timelock',
  },
  info: {
    icon: Info,
    bg: 'bg-surface-elevated',
    border: 'border-l-text-muted',
    iconColor: 'text-text-muted',
  },
};

export function WarningsTab() {
  const spendingPaths = usePlaygroundStore((s) => s.spendingPaths);
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);
  const { t } = useI18n();

  if (!compilationResult) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-text-muted">{t('playground.right.waiting')}</p>
      </div>
    );
  }

  const warnings = generateWarnings(spendingPaths, t);

  if (warnings.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-text-muted">
          {t('playground.warnings.none')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {warnings.map((w, i) => {
        const config = LEVEL_CONFIG[w.level];
        const Icon = config.icon;
        return (
          <div
            key={i}
            className={cn(
              'flex items-start gap-2.5 rounded-card border-l-[3px] p-3',
              config.bg,
              config.border,
            )}
          >
            <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', config.iconColor)} />
            <p className="text-[13px] leading-relaxed text-text-primary">{w.message}</p>
          </div>
        );
      })}
    </div>
  );
}
