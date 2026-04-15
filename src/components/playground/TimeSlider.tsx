'use client';

import { useMemo, useCallback } from 'react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { blocksToHumanLocale } from '@/lib/engine/time-utils';
import { CACHE_TTL_MINUTES, FALLBACK_BLOCK_HEIGHT } from '@/lib/engine/block-height';
import type { MiniscriptNode } from '@/lib/engine/types';

/** Block-height based after() needs a real tip; timestamp after() is excluded. */
function semanticTreeHasBlockHeightAfter(node: MiniscriptNode | null): boolean {
  if (!node) return false;
  if (node.type === 'after' && node.value < 500000000) return true;
  if (node.type === 'and' || node.type === 'or' || node.type === 'threshold') {
    return node.children.some((c) => semanticTreeHasBlockHeightAfter(c));
  }
  return false;
}

/**
 * Collect all time-lock values as relative block counts.
 * `older()` values are used directly.
 * `after()` values (block-height based) are converted to relative offsets
 * from `blockTipHeight`; already-passed absolute locks are treated as 0.
 */
function collectTimelocks(node: MiniscriptNode, values: Set<number>, blockTipHeight?: number) {
  switch (node.type) {
    case 'older':
      values.add(node.blocks);
      break;
    case 'after':
      if (node.value < 500000000) {
        if (blockTipHeight !== undefined) {
          const relative = Math.max(0, node.value - blockTipHeight);
          if (relative > 0) values.add(relative);
        } else {
          values.add(node.value);
        }
      }
      break;
    case 'and':
    case 'or':
      for (const child of node.children) collectTimelocks(child, values, blockTipHeight);
      break;
    case 'threshold':
      for (const child of node.children) collectTimelocks(child, values, blockTipHeight);
      break;
  }
}

/** Slider internal range: 0 → SLIDER_MAX (integer for precision). */
const SLIDER_MAX = 1000;

/**
 * Build anchors array: [0, v1, v2, ..., max].
 * Each anchor maps to an equal segment on the slider.
 */
function buildAnchors(timelockValues: number[], maxBlocks: number): number[] {
  return [0, ...timelockValues, maxBlocks];
}

/**
 * Convert a block value to a slider position (0 → SLIDER_MAX).
 * Piecewise-linear: each segment between anchors occupies equal slider space.
 */
function blocksToSlider(blocks: number, anchors: number[]): number {
  if (anchors.length < 2) return 0;
  const segCount = anchors.length - 1;
  const segSize = SLIDER_MAX / segCount;

  for (let i = 0; i < segCount; i++) {
    const lo = anchors[i];
    const hi = anchors[i + 1];
    if (blocks <= hi || i === segCount - 1) {
      const range = hi - lo;
      const frac = range > 0 ? (blocks - lo) / range : 0;
      return Math.round(segSize * i + segSize * Math.max(0, Math.min(1, frac)));
    }
  }
  return SLIDER_MAX;
}

/**
 * Convert a slider position (0 → SLIDER_MAX) back to block value.
 */
function sliderToBlocks(pos: number, anchors: number[]): number {
  if (anchors.length < 2) return 0;
  const segCount = anchors.length - 1;
  const segSize = SLIDER_MAX / segCount;

  const segIndex = Math.min(Math.floor(pos / segSize), segCount - 1);
  const lo = anchors[segIndex];
  const hi = anchors[segIndex + 1];
  const localPos = pos - segSize * segIndex;
  const frac = segSize > 0 ? localPos / segSize : 0;

  return Math.round(lo + (hi - lo) * Math.max(0, Math.min(1, frac)));
}

export function TimeSlider() {
  const { t, locale } = useI18n();
  const semanticTree = usePlaygroundStore((s) => s.semanticTree);
  const currentTimeBlocks = usePlaygroundStore((s) => s.currentTimeBlocks);
  const setCurrentTimeBlocks = usePlaygroundStore((s) => s.setCurrentTimeBlocks);
  const blockTipHeight = usePlaygroundStore((s) => s.blockTipHeight);
  const blockTipHeightReady = usePlaygroundStore((s) => s.blockTipHeightReady);

  const { timelockValues, maxBlocks, anchors } = useMemo(() => {
    if (!semanticTree) return { timelockValues: [], maxBlocks: 0, anchors: [0, 0] };
    if (semanticTreeHasBlockHeightAfter(semanticTree) && !blockTipHeightReady) {
      return { timelockValues: [], maxBlocks: 0, anchors: [0, 0] };
    }
    const values = new Set<number>();
    collectTimelocks(semanticTree, values, blockTipHeight);
    const sorted = Array.from(values).sort((a, b) => a - b);
    const maxVal = sorted.length > 0 ? Math.ceil(sorted[sorted.length - 1] * 1.5) : 0;
    const capped = Math.max(maxVal, sorted.length > 0 ? 52560 : 0);
    return {
      timelockValues: sorted,
      maxBlocks: capped,
      anchors: buildAnchors(sorted, capped),
    };
  }, [semanticTree, blockTipHeight, blockTipHeightReady]);

  const sliderValue = useMemo(
    () => blocksToSlider(currentTimeBlocks, anchors),
    [currentTimeBlocks, anchors],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const pos = parseInt(e.target.value);
      setCurrentTimeBlocks(sliderToBlocks(pos, anchors));
    },
    [setCurrentTimeBlocks, anchors],
  );

  if (!semanticTree) return null;

  if (semanticTreeHasBlockHeightAfter(semanticTree) && !blockTipHeightReady) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium text-text-muted">
            {t('playground.timeslider.label')}
          </p>
          <p className="text-[11px] text-text-secondary">{t('playground.timeslider.tipLoading')}</p>
        </div>
      </div>
    );
  }

  if (timelockValues.length === 0) return null;

  const progress = SLIDER_MAX > 0 ? (sliderValue / SLIDER_MAX) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-text-muted">
          {t('playground.timeslider.label')}
        </p>
        <p className="text-[11px] text-text-secondary">
          {t('playground.timeslider.current', {
            blocks: currentTimeBlocks.toLocaleString(),
            human: blocksToHumanLocale(currentTimeBlocks, locale),
          })}
        </p>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          value={sliderValue}
          onChange={handleChange}
          className="slider-input w-full"
          style={{
            background: `linear-gradient(to right, #F7931A ${progress}%, #292524 ${progress}%)`,
          }}
        />

        <div className="relative mt-1 h-4">
          {timelockValues.map((val, idx) => {
            // Equal-spaced: condition i at position (i+1)/(n+1)
            const pct = ((idx + 1) / (timelockValues.length + 1)) * 100;
            return (
              <div
                key={val}
                className="absolute flex flex-col items-center"
                style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
              >
                <div className="h-1.5 w-px bg-btc-500/60" />
                <span className="mt-0.5 whitespace-nowrap text-[9px] text-text-muted">
                  {blocksToHumanLocale(val, locale)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-[10px] leading-snug text-text-muted">
        <p>{t('playground.timeslider.footerNote')}</p>
        <p>
          {t('playground.timeslider.footerSource', {
            cacheMinutes: CACHE_TTL_MINUTES,
            fallbackHeight: FALLBACK_BLOCK_HEIGHT.toLocaleString(),
          })}
        </p>
      </div>
    </div>
  );
}
