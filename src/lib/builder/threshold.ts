import type { StrategyGroupNode, StrategyNode } from './types';

/**
 * Real (non-placeholder) child count of a group. Returns 0 for non-group nodes.
 */
function realChildCount(node: StrategyNode): number {
  if (node.kind !== 'group') return 0;
  return node.children.filter((child) => child.kind !== 'placeholder').length;
}

/**
 * Internal clamp shared by `effectiveThresholdK` (read-time) and
 * `clampStoredThresholdK` (write-time). The result is always in
 * `[1, max(1, n)]`, so callers that pass `n = 0` get a sensible storage
 * default of 1.
 */
function clampToBounds(k: number, n: number): number {
  const upper = Math.max(1, n);
  return Math.min(Math.max(1, k), upper);
}

/**
 * Effective threshold k for a group node at **read time**, used by serialize /
 * status / path-highlighting / labels.
 *
 * - Returns 0 for non-group nodes and for empty groups (n === 0); this lets
 *   the serializer emit an empty string and lets status / highlighting
 *   short-circuit on no children.
 * - Otherwise clamps the stored `threshold` (or n if undefined) to `[1, n]`.
 */
export function effectiveThresholdK(node: StrategyGroupNode | StrategyNode): number {
  if (node.kind !== 'group') return 0;
  const n = realChildCount(node);
  if (n === 0) return 0;
  return clampToBounds(node.threshold ?? n, n);
}

/**
 * Stored threshold k for a group at **write time** (constructing or mutating
 * a group), used by `wrapNodeInGroup` / `changeGroupOp` / `convertChildPlaceholder`.
 *
 * Always returns a value in `[1, max(1, realChildCount)]` so that:
 * - newly created groups whose children will be filled in later store a
 *   sensible default of 1 instead of 0;
 * - existing groups whose child count drops below k get re-clamped to n.
 *
 * Read-time consumers should still go through `effectiveThresholdK` — this
 * helper exists to keep stored values internally consistent for tests and
 * for any path that inspects `node.threshold` directly.
 */
export function clampStoredThresholdK(k: number, realChildCount: number): number {
  return clampToBounds(k, realChildCount);
}
