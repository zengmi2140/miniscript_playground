// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  attachErrorHighlight,
  clampHighlightToDoc,
  computeErrorHighlight,
  computeErrorHighlights,
  findParenHighlight,
  isParenRelatedRaw,
} from '../policy-error-highlight';
import type { FriendlyError } from '../types';

function fe(
  partial: Pick<FriendlyError, 'raw' | 'category'> & Partial<FriendlyError>,
): FriendlyError {
  return {
    friendly: { zh: 'x', en: 'x' },
    ...partial,
  };
}

describe('isParenRelatedRaw', () => {
  it('detects bracket messages', () => {
    expect(isParenRelatedRaw('Unmatched parenthesis')).toBe(true);
  });
  it('returns false for unrelated', () => {
    expect(isParenRelatedRaw('compile error')).toBe(false);
  });
});

describe('findParenHighlight', () => {
  it('highlights extra closing paren', () => {
    expect(findParenHighlight('pk(Alice))')).toEqual({ from: 9, to: 10 });
  });
  it('highlights last unclosed open paren', () => {
    expect(findParenHighlight('pk(Alice')).toEqual({ from: 2, to: 3 });
  });
  it('returns null when balanced', () => {
    expect(findParenHighlight('pk(Alice)')).toBeNull();
  });
});

describe('clampHighlightToDoc', () => {
  it('clamps to doc length', () => {
    expect(clampHighlightToDoc({ from: 0, to: 100 }, 5)).toEqual({ from: 0, to: 5 });
  });
  it('returns null when empty after clamp', () => {
    expect(clampHighlightToDoc({ from: 10, to: 20 }, 5)).toBeNull();
  });
});

describe('computeErrorHighlight', () => {
  it('finds first token occurrence for unknown_fragment', () => {
    const err = fe({
      raw: `parse error: unknown fragment 'badfn'`,
      category: 'unknown_fragment',
    });
    const policy = 'and(badfn(),pk(A))';
    expect(computeErrorHighlight(policy, err)).toEqual({ from: 4, to: 9 });
  });

  it('returns null when token not in policy', () => {
    const err = fe({
      raw: `unknown fragment 'x'`,
      category: 'unknown_fragment',
    });
    expect(computeErrorHighlight('pk(Alice)', err)).toBeNull();
  });

  it('uses paren heuristic for syntax + paren raw', () => {
    const err = fe({
      raw: 'Unmatched parenthesis',
      category: 'syntax',
    });
    expect(computeErrorHighlight('pk(A', err)).toEqual({ from: 2, to: 3 });
  });
});

describe('attachErrorHighlight', () => {
  it('merges highlight when computable', () => {
    const err = fe({
      raw: `unknown fragment 'foo'`,
      category: 'unknown_fragment',
    });
    const out = attachErrorHighlight('or(foo(),pk(A))', err);
    expect(out.highlight).toEqual({ from: 3, to: 6 });
    expect(out.highlights).toEqual([{ from: 3, to: 6 }]);
  });

  it('marks every duplicate_key name occurrence', () => {
    const policy = 'thresh(3,pk(Alice),pk(Bob),pk(Alice))';
    const err = fe({
      raw: '[compile error]',
      category: 'duplicate_key',
      duplicateNames: ['Alice'],
    });
    const hl = computeErrorHighlights(policy, err);
    expect(hl).toHaveLength(2);
    const out = attachErrorHighlight(policy, err);
    expect(out.highlights).toHaveLength(2);
    expect(out.highlight).toEqual(out.highlights![0]);
  });
});
