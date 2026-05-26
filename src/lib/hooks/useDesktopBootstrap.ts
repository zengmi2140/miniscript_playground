'use client';

import { useEffect } from 'react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { clearSession } from '@/lib/utils/storage';
import { fetchBlockTipHeight } from '@/lib/engine/block-height';

export type ViewportMode = 'loading' | 'desktop' | 'mobile';

export function useDesktopBootstrap(mode: ViewportMode) {
  const setBlockTipHeight = usePlaygroundStore((s) => s.setBlockTipHeight);
  const setBlockTipHeightReady = usePlaygroundStore((s) => s.setBlockTipHeightReady);

  useEffect(() => {
    if (mode !== 'desktop') return;

    let cancelled = false;
    clearSession();
    fetchBlockTipHeight().then((height) => {
      if (cancelled) return;
      setBlockTipHeight(height);
      setBlockTipHeightReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [mode, setBlockTipHeight, setBlockTipHeightReady]);
}
