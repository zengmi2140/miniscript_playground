'use client';

import { useEffect, useRef } from 'react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { importFromSemanticTree } from '@/lib/builder/from-semantic-tree';

/**
 * useBuilderSync
 *
 * Synchronizes the builder tree with the policy editor:
 * - When in build mode and policy changes externally (text edit), tries to import back to builder
 * - If import succeeds, updates strategyTree
 * - If import fails (unsupported constructs), sets text-led mode
 * - If compilation fails, sets compile-error mode but keeps last tree
 */
export function useBuilderSync() {
  const playgroundMode = usePlaygroundStore((s) => s.playgroundMode);
  const policy = usePlaygroundStore((s) => s.policy);
  const semanticTree = usePlaygroundStore((s) => s.semanticTree);
  const compilationError = usePlaygroundStore((s) => s.compilationError);
  const lastBuilderPolicySnapshot = usePlaygroundStore((s) => s.lastBuilderPolicySnapshot);
  const builderSyncState = usePlaygroundStore((s) => s.builderSyncState);

  const setStrategyTree = usePlaygroundStore((s) => s.setStrategyTree);
  const updateStrategyTree = usePlaygroundStore((s) => s.updateStrategyTree);
  const setBuilderSyncState = usePlaygroundStore((s) => s.setBuilderSyncState);
  const setLastBuilderPolicySnapshot = usePlaygroundStore((s) => s.setLastBuilderPolicySnapshot);

  // Track if we've done initial sync
  const initialSyncDone = useRef(false);

  useEffect(() => {
    // Only sync in build mode
    if (playgroundMode !== 'build') {
      initialSyncDone.current = false;
      return;
    }

    // Empty policy: clear canvas and snapshot so we don't show a stale tree with empty editor
    if (!policy.trim()) {
      setStrategyTree(null);
      setLastBuilderPolicySnapshot(null);
      if (builderSyncState !== 'synced') {
        setBuilderSyncState('synced');
      }
      return;
    }

    // If policy matches our last snapshot, we're the source - no reverse sync needed
    if (policy === lastBuilderPolicySnapshot) {
      return;
    }

    // Policy was edited externally - try to import from semantic tree
    if (compilationError) {
      // Compilation failed - keep last tree, set compile-error state
      setBuilderSyncState('compile-error');
      return;
    }

    if (!semanticTree) {
      // No semantic tree yet (maybe still compiling)
      return;
    }

    // Try to import the semantic tree
    const result = importFromSemanticTree(semanticTree);

    if (result.status === 'supported') {
      // Canonical policy + tree + snapshot in one write (matches builder-driven edits)
      updateStrategyTree(result.tree);
      setBuilderSyncState('synced');
    } else {
      // Unsupported construct - enter text-led mode but keep last tree visible
      setBuilderSyncState('text-led');
    }
  }, [
    playgroundMode,
    policy,
    semanticTree,
    compilationError,
    lastBuilderPolicySnapshot,
    builderSyncState,
    setStrategyTree,
    updateStrategyTree,
    setBuilderSyncState,
    setLastBuilderPolicySnapshot,
  ]);
}
