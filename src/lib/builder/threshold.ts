import type { StrategyGroupNode, StrategyNode } from './types';

/**
 * Real (non-placeholder) child count of a group. Returns 0 for non-group nodes.
 */
function realChildCount(node: StrategyNode): number {
  if (node.kind !== 'group') return 0;
  return node.children.filter((child) => child.kind !== 'placeholder').length;
}

/**
 * Effective threshold k for a group node, clamped to [1, n] where n is the real
 * (non-placeholder) child count. Falls back to n when `threshold` is undefined.
 *
 * Empty groups (n === 0) collapse to 0 to mirror the serializer (which emits an
 * empty string) and the status/highlighting layers (which short-circuit on no
 * children).
 *
 * Accepts both `StrategyGroupNode` directly and any `StrategyNode`; non-group
 * nodes return 0.
 */
export function effectiveThresholdK(node: StrategyGroupNode | StrategyNode): number {
  if (node.kind !== 'group') return 0;
  const n = realChildCount(node);
  if (n === 0) return 0;
  const raw = node.threshold ?? n;
  return Math.min(Math.max(1, raw), n);
}
