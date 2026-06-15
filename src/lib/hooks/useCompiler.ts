'use client';

import { useEffect, useRef } from 'react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { CompilerWorkerClient } from '@/lib/engine/compiler-worker';

const DEBOUNCE_MS = 500;

export function useCompiler() {
  const policy = usePlaygroundStore((s) => s.policy);
  const keyVariables = usePlaygroundStore((s) => s.keyVariables);
  const context = usePlaygroundStore((s) => s.context);
  const network = usePlaygroundStore((s) => s.network);
  const availableKeys = usePlaygroundStore((s) => s.availableKeys);
  const availableHashes = usePlaygroundStore((s) => s.availableHashes);
  const currentTimeBlocks = usePlaygroundStore((s) => s.currentTimeBlocks);
  const blockTipHeight = usePlaygroundStore((s) => s.blockTipHeight);
  const blockTipHeightReady = usePlaygroundStore((s) => s.blockTipHeightReady);

  const setCompilationResult = usePlaygroundStore((s) => s.setCompilationResult);
  const setCompilationError = usePlaygroundStore((s) => s.setCompilationError);
  const setSemanticTree = usePlaygroundStore((s) => s.setSemanticTree);
  const setSpendingPaths = usePlaygroundStore((s) => s.setSpendingPaths);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(0);
  const workerClientRef = useRef<CompilerWorkerClient | null>(null);

  useEffect(
    () => () => {
      workerClientRef.current?.dispose();
      workerClientRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!policy.trim()) {
      setCompilationError(null);
      setCompilationResult(null);
      setSemanticTree(null);
      setSpendingPaths([]);
      return;
    }

    const generation = ++abortRef.current;

    timerRef.current = setTimeout(async () => {
      try {
        workerClientRef.current ??= new CompilerWorkerClient();
        const { output, semanticTree } = await workerClientRef.current.compile({
          policy,
          keyVariables,
          context,
          network,
          availableKeys: [...availableKeys],
          availableHashes: [...availableHashes],
          currentTimeBlocks,
          ...(blockTipHeightReady ? { blockTipHeight } : {}),
        });

        if (abortRef.current !== generation) return;

        if (output.error) {
          setCompilationError(output.error);
        } else {
          setCompilationError(null);
        }

        if (output.result) {
          setCompilationResult(output.result);
          setSpendingPaths(output.paths);
          setSemanticTree(semanticTree);
        } else {
          // Avoid stale semantic tree / paths / results when compile fails (matches no successful output).
          setCompilationResult(null);
          setSemanticTree(null);
          setSpendingPaths([]);
        }
      } catch {
        if (abortRef.current !== generation) return;
        setCompilationResult(null);
        setSemanticTree(null);
        setSpendingPaths([]);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    policy,
    keyVariables,
    context,
    network,
    availableKeys,
    availableHashes,
    currentTimeBlocks,
    blockTipHeight,
    blockTipHeightReady,
    setCompilationResult,
    setCompilationError,
    setSemanticTree,
    setSpendingPaths,
  ]);
}
