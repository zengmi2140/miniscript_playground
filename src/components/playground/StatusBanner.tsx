'use client';

import { useMemo } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { blocksToHumanLocale, getPathTimelockRemainingBlocks } from '@/lib/engine/time-utils';
import { formatSpendingPathLabel } from '@/lib/engine/path-label';
import type { PathCondition, SpendingPath } from '@/lib/engine/types';

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
  const blockTipHeight = usePlaygroundStore((s) => s.blockTipHeight);
  const blockTipHeightReady = usePlaygroundStore((s) => s.blockTipHeightReady);

  const banner = useMemo((): BannerInfo | null => {
    if (spendingPaths.length === 0) return null;

    const satisfiable = spendingPaths.find((p) => p.satisfiable);
    if (satisfiable) {
      return {
        status: 'canSpend',
        message: t('playground.status.canSpend', {
          path: formatSpendingPathLabel(satisfiable, t),
        }),
      };
    }

    const pendingPath = spendingPaths.find((p) => {
      const missingOnlyTime = p.missingConditions.every(
        (c) => c.type === 'timelock_relative' || c.type === 'timelock_absolute',
      );
      if (!missingOnlyTime || p.missingConditions.length === 0) return false;

      const hasAllSigs = p.conditions
        .filter((c) => c.type === 'signature')
        .every((c) => c.type === 'signature' && availableKeys.has(c.keyName));
      return hasAllSigs;
    });

    if (pendingPath) {
      const timeMissing = pendingPath.missingConditions.find(
        (c) => c.type === 'timelock_relative' || c.type === 'timelock_absolute',
      );
      if (
        timeMissing &&
        (timeMissing.type === 'timelock_relative' || timeMissing.type === 'timelock_absolute')
      ) {
        const tipForCalc = blockTipHeightReady ? blockTipHeight : undefined;
        const remaining = getPathTimelockRemainingBlocks(
          timeMissing,
          currentTimeBlocks,
          tipForCalc,
        );
        return {
          status: 'waiting',
          message: t('playground.status.waiting', {
            time: blocksToHumanLocale(remaining, locale),
            path: formatSpendingPathLabel(pendingPath, t),
          }),
        };
      }
    }

    const tipForCalc = blockTipHeightReady ? blockTipHeight : undefined;
    const missingList = formatClosestMissing(
      spendingPaths,
      currentTimeBlocks,
      tipForCalc,
      locale,
      t,
    );
    return {
      status: 'cannotSpend',
      message: t('playground.status.cannotSpend', {
        missing: missingList || t('playground.status.someConditions'),
      }),
    };
  }, [
    spendingPaths,
    availableKeys,
    currentTimeBlocks,
    blockTipHeight,
    blockTipHeightReady,
    t,
    locale,
  ]);

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

/**
 * Among non-satisfiable paths, find the "closest" ones — those with the
 * smallest number of unmet conditions — and present each as one actionable
 * alternative. A path's unmet conditions (signatures, hashlock, or timelock)
 * are joined with AND; multiple equally-close paths are joined with OR.
 *
 * Examples:
 *   - 2-of-3 multisig with Charlie on → "Alice or Bob"
 *     (instead of misleading union "Alice, Bob")
 *   - `or(and(A,B), and(C,older(1000)))` with nothing toggled →
 *     "(Alice and Bob) or (Charlie and 1000 more wait)"
 *   - HTLC with hash known but no key → "Alice"
 */
function formatClosestMissing(
  spendingPaths: SpendingPath[],
  currentTimeBlocks: number,
  blockTipHeight: number | undefined,
  locale: 'zh' | 'en',
  t: ReturnType<typeof useI18n>['t'],
): string {
  const candidates = spendingPaths.filter(
    (p) => !p.satisfiable && p.missingConditions.length > 0,
  );
  if (candidates.length === 0) return '';

  const minSize = Math.min(...candidates.map((p) => p.missingConditions.length));

  const seen = new Set<string>();
  const alternatives: { count: number; desc: string }[] = [];
  for (const p of candidates) {
    if (p.missingConditions.length !== minSize) continue;
    const parts = p.missingConditions
      .map((c) => describeCondition(c, currentTimeBlocks, blockTipHeight, locale, t))
      .filter((s): s is string => Boolean(s))
      .sort();
    if (parts.length === 0) continue;
    const desc = formatAndList(parts, locale);
    if (seen.has(desc)) continue;
    seen.add(desc);
    alternatives.push({ count: parts.length, desc });
  }

  if (alternatives.length === 0) return '';
  if (alternatives.length === 1) return alternatives[0].desc;

  // All alternatives are atomic (single condition) → use Intl disjunction
  // for nicer prose: "Alice, Bob, or Charlie" / "Alice 或 Bob 或 Charlie".
  if (alternatives.every((a) => a.count === 1)) {
    return formatOrList(alternatives.map((a) => a.desc), locale);
  }
  // Mixed lengths → wrap multi-part groups in parens for clarity.
  return alternatives
    .map((a) => (a.count > 1 ? `(${a.desc})` : a.desc))
    .join(locale === 'zh' ? ' 或 ' : ' or ');
}

function describeCondition(
  cond: PathCondition,
  currentTimeBlocks: number,
  blockTipHeight: number | undefined,
  locale: 'zh' | 'en',
  t: ReturnType<typeof useI18n>['t'],
): string | null {
  if (cond.type === 'signature') {
    return cond.displayName ?? cond.keyName;
  }
  if (cond.type === 'hashlock') {
    return t('playground.status.missingHashlock');
  }
  if (cond.type === 'timelock_relative' || cond.type === 'timelock_absolute') {
    const remaining = getPathTimelockRemainingBlocks(
      cond,
      currentTimeBlocks,
      blockTipHeight,
    );
    return t('playground.status.missingWaitBlocks', {
      time: blocksToHumanLocale(remaining, locale),
    });
  }
  return null;
}

function formatAndList(items: string[], locale: 'zh' | 'en'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  try {
    return new Intl.ListFormat(locale === 'zh' ? 'zh-CN' : 'en', {
      style: 'long',
      type: 'conjunction',
    }).format(items);
  } catch {
    return items.join(locale === 'zh' ? '、' : ', ');
  }
}

function formatOrList(items: string[], locale: 'zh' | 'en'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  try {
    return new Intl.ListFormat(locale === 'zh' ? 'zh-CN' : 'en', {
      style: 'long',
      type: 'disjunction',
    }).format(items);
  } catch {
    return items.join(locale === 'zh' ? ' 或 ' : ' or ');
  }
}
