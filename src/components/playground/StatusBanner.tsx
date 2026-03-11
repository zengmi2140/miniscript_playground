'use client';

import { useMemo } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { blocksToHumanLocale } from '@/lib/engine/time-utils';

type BannerStatus = 'canSpend' | 'waiting' | 'cannotSpend';

interface BannerInfo {
  status: BannerStatus;
  message: string;
}

export function StatusBanner() {
  const { t, locale } = useI18n();
  const spendingPaths = usePlaygroundStore((s) => s.spendingPaths);
  const availableKeys = usePlaygroundStore((s) => s.availableKeys);
  const currentTimeBlocks = usePlaygroundStore((s) => s.currentTimeBlocks);

  const banner = useMemo((): BannerInfo | null => {
    if (spendingPaths.length === 0) return null;

    const satisfiable = spendingPaths.find((p) => p.satisfiable);
    if (satisfiable) {
      return {
        status: 'canSpend',
        message: t('playground.status.canSpend', { path: satisfiable.label }),
      };
    }

    const pendingPath = spendingPaths.find((p) => {
      const missingOnlySig = p.missingConditions.every((c) => c.type === 'signature');
      const missingOnlyTime = p.missingConditions.every(
        (c) => c.type === 'timelock_relative' || c.type === 'timelock_absolute',
      );
      if (missingOnlySig) return false;
      if (!missingOnlyTime) return false;

      const hasAllSigs = p.conditions
        .filter((c) => c.type === 'signature')
        .every((c) => c.type === 'signature' && availableKeys.has(c.keyName));
      return hasAllSigs;
    });

    if (pendingPath) {
      const timeMissing = pendingPath.missingConditions.find(
        (c) => c.type === 'timelock_relative',
      );
      if (timeMissing && timeMissing.type === 'timelock_relative') {
        const remaining = timeMissing.blocks - currentTimeBlocks;
        return {
          status: 'waiting',
          message: t('playground.status.waiting', {
            time: blocksToHumanLocale(remaining, locale),
            path: pendingPath.label,
          }),
        };
      }
    }

    const allMissing = new Set<string>();
    for (const p of spendingPaths) {
      for (const mc of p.missingConditions) {
        if (mc.type === 'signature') allMissing.add(mc.keyName);
      }
    }

    const missingList = Array.from(allMissing).join(', ');
    return {
      status: 'cannotSpend',
      message: t('playground.status.cannotSpend', {
        missing: missingList || t('playground.status.someConditions'),
      }),
    };
  }, [spendingPaths, availableKeys, currentTimeBlocks, t, locale]);

  if (!banner) return null;

  const config: Record<BannerStatus, { icon: typeof CheckCircle2; bg: string; text: string }> = {
    canSpend: {
      icon: CheckCircle2,
      bg: 'bg-semantic-satisfied/10 border-semantic-satisfied/30',
      text: 'text-semantic-satisfied',
    },
    waiting: {
      icon: Clock,
      bg: 'bg-btc-500/10 border-btc-500/30',
      text: 'text-btc-400',
    },
    cannotSpend: {
      icon: XCircle,
      bg: 'bg-surface-elevated border-border-default',
      text: 'text-text-muted',
    },
  };

  const { icon: Icon, bg, text } = config[banner.status];

  return (
    <div className={cn('flex items-center gap-2.5 rounded-button border px-3 py-2.5', bg)}>
      <Icon className={cn('h-4 w-4 flex-shrink-0', text)} />
      <p className={cn('text-[13px] font-medium', text)}>{banner.message}</p>
    </div>
  );
}
