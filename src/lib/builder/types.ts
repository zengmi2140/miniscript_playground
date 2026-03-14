/**
 * Builder Domain Types
 *
 * This module defines the type system for the visual builder feature.
 * The StrategyNode type is designed to be future-compatible with `after()` and hashlocks,
 * even though the MVP UI only supports `older()` relative timelocks.
 */

export type BuilderSyncState = 'synced' | 'text-led' | 'compile-error';

export type BuildStarterId = 'single-control' | 'shared-control' | 'recovery';

/**
 * StrategyNode represents a node in the visual builder tree.
 * This is the builder's own domain model, separate from MiniscriptNode.
 */
export type StrategyNode =
  | StrategyGroupNode
  | StrategySignatureNode
  | StrategyTimelockNode
  | StrategyHashlockNode;

export interface StrategyGroupNode {
  id: string;
  kind: 'group';
  op: 'all' | 'any' | 'threshold';
  threshold?: number;
  children: StrategyNode[];
}

export interface StrategySignatureNode {
  id: string;
  kind: 'signature';
  roleId: string;
}

export interface StrategyTimelockNode {
  id: string;
  kind: 'timelock';
  mode: 'relative' | 'absolute';
  value: number;
  unit: 'blocks' | 'date' | 'timestamp';
}

export interface StrategyHashlockNode {
  id: string;
  kind: 'hashlock';
  hashType: 'sha256' | 'hash256' | 'ripemd160' | 'hash160';
  digest: string;
}

/**
 * Common time period presets for the timelock dropdown (assuming ~10 min/block)
 */
export const TIMELOCK_PRESETS = {
  '7 days': 1008, // 7 * 24 * 6 = 1008 blocks
  '30 days': 4320, // 30 * 24 * 6 = 4320 blocks
  '90 days': 12960, // 90 * 24 * 6 = 12960 blocks
  '180 days': 25920, // 180 * 24 * 6 = 25920 blocks
  '1 year': 52560, // 365 * 24 * 6 = 52560 blocks
} as const;

export type TimelockPresetKey = keyof typeof TIMELOCK_PRESETS;

/**
 * Convert blocks to human-readable time string.
 * Assumes ~10 minutes per block.
 */
export function blocksToHumanTime(blocks: number): string {
  const minutes = blocks * 10;
  const hours = minutes / 60;
  const days = hours / 24;

  if (days >= 365) {
    const years = Math.round(days / 365 * 10) / 10;
    return `~${years} ${years === 1 ? 'year' : 'years'}`;
  }
  if (days >= 30) {
    const months = Math.round(days / 30 * 10) / 10;
    return `~${months} ${months === 1 ? 'month' : 'months'}`;
  }
  if (days >= 1) {
    const d = Math.round(days * 10) / 10;
    return `~${d} ${d === 1 ? 'day' : 'days'}`;
  }
  if (hours >= 1) {
    const h = Math.round(hours * 10) / 10;
    return `~${h} ${h === 1 ? 'hour' : 'hours'}`;
  }
  return `~${Math.round(minutes)} min`;
}

/**
 * Result type for semantic tree import
 */
export type BuilderImportResult =
  | { status: 'supported'; tree: StrategyNode }
  | {
      status: 'unsupported';
      reason: 'absolute-timelock' | 'hashlock' | 'unknown-fragment' | 'constant-branch';
      message: string;
    };

/**
 * Builder template result containing tree, policy, and key variables
 */
export interface BuilderTemplate {
  tree: StrategyNode;
  policy: string;
  keyVariables: { name: string; policyName: string; publicKey: string }[];
}
