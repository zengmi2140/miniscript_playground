/**
 * Cross-module regression: `after(<height>)` simulated elapsed semantics
 * must match across tree-to-flow / path-analyzer / StatusBanner.
 *
 * Covers P1-01 of CODE_REVIEW_REPORT.md.
 */
import { describe, it, expect } from 'vitest';
import {
  isPathTimelockSatisfied,
  getPathTimelockRemainingBlocks,
  isAfterSatisfied,
  getAfterRemainingBlocks,
} from '../time-utils';
import { analyzeSpendingPaths } from '../path-analyzer';
import { treeToFlow } from '@/lib/flow/tree-to-flow';
import type { MiniscriptNode } from '../types';

const TIP = 800_000;

describe('isPathTimelockSatisfied (shared helper)', () => {
  it('absolute after(tip + N): unsatisfied initially, satisfied once currentTimeBlocks >= N', () => {
    const cond = { type: 'timelock_absolute' as const, value: TIP + 100 };

    expect(isPathTimelockSatisfied(cond, 0, TIP)).toBe(false);
    expect(isPathTimelockSatisfied(cond, 99, TIP)).toBe(false);
    expect(isPathTimelockSatisfied(cond, 100, TIP)).toBe(true);
    expect(isPathTimelockSatisfied(cond, 500, TIP)).toBe(true);
  });

  it('absolute after(tip - N): already satisfied at currentTimeBlocks=0', () => {
    const cond = { type: 'timelock_absolute' as const, value: TIP - 100 };
    expect(isPathTimelockSatisfied(cond, 0, TIP)).toBe(true);
  });

  it('absolute after(<height>) without tip stays unsatisfied', () => {
    const cond = { type: 'timelock_absolute' as const, value: TIP + 100 };
    expect(isPathTimelockSatisfied(cond, 9999, undefined)).toBe(false);
  });

  it('relative older() works without tip', () => {
    const cond = { type: 'timelock_relative' as const, blocks: 144 };
    expect(isPathTimelockSatisfied(cond, 0, undefined)).toBe(false);
    expect(isPathTimelockSatisfied(cond, 144, undefined)).toBe(true);
  });

  it('isAfterSatisfied + getAfterRemainingBlocks agree on tip+N', () => {
    expect(isAfterSatisfied(TIP + 50, 49, TIP)).toBe(false);
    expect(isAfterSatisfied(TIP + 50, 50, TIP)).toBe(true);
    expect(getAfterRemainingBlocks(TIP + 50, 0, TIP)).toBe(50);
    expect(getAfterRemainingBlocks(TIP + 50, 50, TIP)).toBe(0);
  });
});

describe('getPathTimelockRemainingBlocks', () => {
  it('counts down for tip+N as currentTimeBlocks advances', () => {
    const cond = { type: 'timelock_absolute' as const, value: TIP + 200 };
    expect(getPathTimelockRemainingBlocks(cond, 0, TIP)).toBe(200);
    expect(getPathTimelockRemainingBlocks(cond, 50, TIP)).toBe(150);
    expect(getPathTimelockRemainingBlocks(cond, 200, TIP)).toBe(0);
    expect(getPathTimelockRemainingBlocks(cond, 999, TIP)).toBe(0);
  });

  it('relative older(): remaining = blocks - currentTimeBlocks (clamped)', () => {
    const cond = { type: 'timelock_relative' as const, blocks: 144 };
    expect(getPathTimelockRemainingBlocks(cond, 0, undefined)).toBe(144);
    expect(getPathTimelockRemainingBlocks(cond, 144, undefined)).toBe(0);
    expect(getPathTimelockRemainingBlocks(cond, 200, undefined)).toBe(0);
  });
});

describe('treeToFlow: after(<height>) status with simulated elapsed blocks', () => {
  it('after(tip + 100): pending at currentTimeBlocks=0; satisfied at currentTimeBlocks=100', () => {
    const tree: MiniscriptNode = {
      type: 'after',
      value: TIP + 100,
      humanReadable: '',
    };
    const initial = treeToFlow(
      tree,
      new Set(),
      new Set(),
      0,
      'zh',
      { blockTipHeight: TIP },
    );
    expect(initial.nodes[0].data.status).toBe('pending');

    const advanced = treeToFlow(
      tree,
      new Set(),
      new Set(),
      100,
      'zh',
      { blockTipHeight: TIP },
    );
    expect(advanced.nodes[0].data.status).toBe('satisfied');
  });

  it('after(tip - 50): satisfied initially', () => {
    const tree: MiniscriptNode = {
      type: 'after',
      value: TIP - 50,
      humanReadable: '',
    };
    const { nodes } = treeToFlow(
      tree,
      new Set(),
      new Set(),
      0,
      'zh',
      { blockTipHeight: TIP },
    );
    expect(nodes[0].data.status).toBe('satisfied');
  });

  it('and(pk(Alice), after(tip+100)): root flips to satisfied when key + time both ready', () => {
    const tree: MiniscriptNode = {
      type: 'and',
      children: [
        { type: 'key', name: 'Alice' },
        { type: 'after', value: TIP + 100, humanReadable: '' },
      ],
    };

    const noTime = treeToFlow(
      tree,
      new Set(['Alice']),
      new Set(),
      0,
      'zh',
      { blockTipHeight: TIP },
    );
    const root = noTime.nodes.find((n) => n.type === 'root');
    expect(root?.data.status).toBe('pending');

    const ready = treeToFlow(
      tree,
      new Set(['Alice']),
      new Set(),
      150,
      'zh',
      { blockTipHeight: TIP },
    );
    const root2 = ready.nodes.find((n) => n.type === 'root');
    expect(root2?.data.status).toBe('satisfied');
  });

  it('after(<height>) without tip stays pending regardless of currentTimeBlocks', () => {
    const tree: MiniscriptNode = {
      type: 'after',
      value: TIP + 100,
      humanReadable: '',
    };
    const { nodes } = treeToFlow(
      tree,
      new Set(),
      new Set(),
      9999,
      'zh',
      {},
    );
    expect(nodes[0].data.status).toBe('pending');
  });
});

describe('analyzeSpendingPaths: nLockTime-based after() satisfaction', () => {
  it('after(tip + 100): not satisfiable until currentTimeBlocks >= 100', () => {
    const sat = { asm: '', nLockTime: TIP + 100 };
    const initial = analyzeSpendingPaths([sat], [], [], new Set(), new Set(), 0, TIP);
    expect(initial[0].satisfiable).toBe(false);
    expect(initial[0].missingConditions[0].type).toBe('timelock_absolute');

    const advanced = analyzeSpendingPaths([sat], [], [], new Set(), new Set(), 100, TIP);
    expect(advanced[0].satisfiable).toBe(true);
    expect(advanced[0].missingConditions).toHaveLength(0);
  });

  it('after(tip - 50): already satisfiable at currentTimeBlocks=0', () => {
    const sat = { asm: '', nLockTime: TIP - 50 };
    const paths = analyzeSpendingPaths([sat], [], [], new Set(), new Set(), 0, TIP);
    expect(paths[0].satisfiable).toBe(true);
  });

  it('without blockTipHeight, block-height after() stays unsatisfiable', () => {
    const sat = { asm: '', nLockTime: TIP + 100 };
    const paths = analyzeSpendingPaths([sat], [], [], new Set(), new Set(), 9999);
    expect(paths[0].satisfiable).toBe(false);
  });
});
