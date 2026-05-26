import { describe, it, expect } from 'vitest';
import { effectiveThresholdK } from '../threshold';
import { serializeStrategyTree } from '../serialize';
import { removeNode } from '../node-ops';
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
