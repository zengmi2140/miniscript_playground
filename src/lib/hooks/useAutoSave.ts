'use client';

import { useEffect, useRef } from 'react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { saveSession } from '@/lib/utils/storage';

export function useAutoSave() {
  const policy = usePlaygroundStore((s) => s.policy);
  const keyVariables = usePlaygroundStore((s) => s.keyVariables);
  const context = usePlaygroundStore((s) => s.context);
  const network = usePlaygroundStore((s) => s.network);
  const playgroundMode = usePlaygroundStore((s) => s.playgroundMode);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!policy) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveSession({ policy, keyVariables, context, network, playgroundMode });
    }, 800);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [policy, keyVariables, context, network, playgroundMode]);
}
