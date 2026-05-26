import { describe, it, expect } from 'vitest';
import { effectiveThresholdK, clampStoredThresholdK } from '../threshold';
import { serializeStrategyTree } from '../serialize';
import { removeNode, wrapNodeInGroup, changeGroupOp } from '../node-ops';
import type { StrategyGroupNode, StrategyNode } from '../types';

function makeGroup(
  threshold: number | undefined,
  children: StrategyNode[],
): StrategyGroupNode {
  return {
    id: 'g1',
    kind: 'group',
    op: 'threshold',
    threshold,
    children,
  };
}

const sigA: StrategyNode = { id: 's1', kind: 'signature', roleId: 'A' };
const sigB: StrategyNode = { id: 's2', kind: 'signature', roleId: 'B' };
const sigC: StrategyNode = { id: 's3', kind: 'signature', roleId: 'C' };

describe('effectiveThresholdK', () => {
  it('clamps k > n down to n when serializing', () => {
    const group = makeGroup(99, [sigA, sigB, sigC]);
    expect(effectiveThresholdK(group)).toBe(3);
    expect(serializeStrategyTree(group)).toBe('thresh(3,pk(A),pk(B),pk(C))');
  });

  it('falls back to actual k after removing a child via removeNode', () => {
    const group = makeGroup(3, [sigA, sigB, sigC]);
    const next = removeNode(group, sigC.id) as StrategyGroupNode;
    expect(next.kind).toBe('group');
    expect(effectiveThresholdK(next)).toBe(2);
    expect(next.threshold).toBe(2);
  });

  it('falls back to n when threshold is undefined', () => {
    const group = makeGroup(undefined, [sigA, sigB]);
    expect(effectiveThresholdK(group)).toBe(2);
  });

  it('clamps non-positive thresholds up to 1 when there is at least one real child', () => {
    expect(effectiveThresholdK(makeGroup(0, [sigA, sigB]))).toBe(1);
    expect(effectiveThresholdK(makeGroup(-5, [sigA, sigB]))).toBe(1);
  });

  it('returns 0 for an empty group (no real children) so callers can short-circuit', () => {
    expect(effectiveThresholdK(makeGroup(2, []))).toBe(0);
    const onlyPlaceholders: StrategyGroupNode = {
      id: 'g2',
      kind: 'group',
      op: 'threshold',
      threshold: 2,
      children: [{ id: 'p1', kind: 'placeholder', placeholderType: 'child' }],
    };
    expect(effectiveThresholdK(onlyPlaceholders)).toBe(0);
  });

  it('returns 0 for non-group nodes', () => {
    expect(effectiveThresholdK(sigA)).toBe(0);
  });
});

describe('clampStoredThresholdK', () => {
  it('clamps k into [1, n] for non-empty groups', () => {
    expect(clampStoredThresholdK(99, 3)).toBe(3);
    expect(clampStoredThresholdK(2, 3)).toBe(2);
    expect(clampStoredThresholdK(0, 3)).toBe(1);
    expect(clampStoredThresholdK(-5, 3)).toBe(1);
  });

  it('returns 1 for empty groups so newly constructed groups have a sensible default', () => {
    expect(clampStoredThresholdK(0, 0)).toBe(1);
    expect(clampStoredThresholdK(99, 0)).toBe(1);
  });
});

describe('node-ops write paths use the shared clamp', () => {
  it('wrapNodeInGroup stores threshold = 1 (single wrapped child)', () => {
    const wrapped = wrapNodeInGroup(sigA, sigA.id, 'threshold', 99) as StrategyGroupNode;
    expect(wrapped.kind).toBe('group');
    expect(wrapped.op).toBe('threshold');
    expect(wrapped.threshold).toBe(1);
  });

  it('changeGroupOp clamps stored k to real child count when switching to threshold', () => {
    const initial: StrategyGroupNode = {
      id: 'g1',
      kind: 'group',
      op: 'all',
      children: [sigA, sigB],
    };
    const next = changeGroupOp(initial, initial.id, 'threshold', 99) as StrategyGroupNode;
    expect(next.threshold).toBe(2);
  });
});
