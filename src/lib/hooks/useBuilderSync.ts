'use client';

import { useEffect, useRef } from 'react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { importFromSemanticTree } from '@/lib/builder/from-semantic-tree';
import { createRootPlaceholderTree } from '@/lib/builder/root-placeholder';

/**
 * useBuilderSync
 *
 * Synchronizes the builder tree with the policy editor:
 * - When in build mode and policy changes externally (text edit), tries to import back to builder
 * - If import succeeds, updates strategyTree
 * - If import fails (unsupported constructs), sets text-led mode
 * - If compilation fails: sets compile-error mode (read-only canvas). Keeps the last strategyTree when
 *   one exists; if strategyTree is still null (e.g. restored session never compiled), seeds the root
 *   placeholder so the canvas does not stay stuck on “waiting for tree”.
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

    // Builder-driven updates set policy === lastBuilderPolicySnapshot (including both '' when the
    // tree is an empty and/or group — serializeStrategyTree returns ''). Must run before the empty
    // policy reset below, otherwise we'd clobber the tree back to the root placeholder.
    if (policy === lastBuilderPolicySnapshot) {
      // P1-04: if the user typed garbage (compile-error / text-led) and
      // edited the policy back to the last snapshot, recover to 'synced'
      // so the canvas becomes editable again. Skip when there's a real
      // compilation error — that case is reconciled below.
      if (!compilationError && builderSyncState !== 'synced') {
        setBuilderSyncState('synced');
      }
      return;
    }

    // Empty policy: reset to root placeholder (same as enterBuildMode scratch), not a stale tree
    if (!policy.trim()) {
      setStrategyTree(createRootPlaceholderTree());
      setLastBuilderPolicySnapshot(null);
      if (builderSyncState !== 'synced') {
        setBuilderSyncState('synced');
      }
      return;
    }

    // Policy was edited externally - try to import from semantic tree
    if (compilationError) {
      setBuilderSyncState('compile-error');
      const existingTree = usePlaygroundStore.getState().strategyTree;
      if (!existingTree) {
        setStrategyTree(createRootPlaceholderTree());
      }
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
