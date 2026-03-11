'use client';

import { useMemo, useCallback } from 'react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { blocksToHuman } from '@/lib/engine/time-utils';
import type { MiniscriptNode } from '@/lib/engine/types';

function collectTimelocks(node: MiniscriptNode, values: Set<number>) {
  switch (node.type) {
    case 'older':
      values.add(node.blocks);
      break;
    case 'after':
      if (node.value < 500000000) values.add(node.value);
      break;
    case 'and':
    case 'or':
      for (const child of node.children) collectTimelocks(child, values);
      break;
    case 'threshold':
      for (const child of node.children) collectTimelocks(child, values);
      break;
  }
}

export function TimeSlider() {
  const { t } = useI18n();
  const semanticTree = usePlaygroundStore((s) => s.semanticTree);
  const currentTimeBlocks = usePlaygroundStore((s) => s.currentTimeBlocks);
  const setCurrentTimeBlocks = usePlaygroundStore((s) => s.setCurrentTimeBlocks);

  const { timelockValues, maxBlocks } = useMemo(() => {
    if (!semanticTree) return { timelockValues: [], maxBlocks: 0 };
    const values = new Set<number>();
    collectTimelocks(semanticTree, values);
    const sorted = Array.from(values).sort((a, b) => a - b);
    const maxVal = sorted.length > 0 ? Math.ceil(sorted[sorted.length - 1] * 1.5) : 0;
    const capped = Math.max(maxVal, sorted.length > 0 ? 52560 : 0);
    return { timelockValues: sorted, maxBlocks: capped };
  }, [semanticTree]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentTimeBlocks(parseInt(e.target.value));
    },
    [setCurrentTimeBlocks],
  );

  if (timelockValues.length === 0) return null;

  const progress = maxBlocks > 0 ? (currentTimeBlocks / maxBlocks) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-text-muted">
          {t('playground.timeslider.label')}
        </p>
        <p className="text-[11px] text-text-secondary">
          {t('playground.timeslider.current', {
            blocks: currentTimeBlocks.toLocaleString(),
            human: blocksToHuman(currentTimeBlocks),
          })}
        </p>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={maxBlocks}
          value={currentTimeBlocks}
          onChange={handleChange}
          className="slider-input w-full"
          style={{
            background: `linear-gradient(to right, #F7931A ${progress}%, #292524 ${progress}%)`,
          }}
        />

        <div className="relative mt-1 h-4">
          {timelockValues.map((val) => {
            const pct = maxBlocks > 0 ? (val / maxBlocks) * 100 : 0;
            return (
              <div
                key={val}
                className="absolute flex flex-col items-center"
                style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
              >
                <div className="h-1.5 w-px bg-btc-500/60" />
                <span className="mt-0.5 whitespace-nowrap text-[9px] text-text-muted">
                  {blocksToHuman(val)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
