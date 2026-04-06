// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  findDuplicatePkPlaceholders,
  findAllWordRanges,
  upgradeErrorWithPreflight,
} from '../policy-preflight';
import type { FriendlyError } from '../types';

describe('findDuplicatePkPlaceholders', () => {
  it('detects repeated pk(Alice)', () => {
    expect(
      findDuplicatePkPlaceholders('thresh(3,pk(Alice),pk(Bob),pk(Alice))'),
    ).toEqual(['Alice']);
  });

  it('returns empty when names are unique', () => {
    expect(findDuplicatePkPlaceholders('thresh(2,pk(Alice),pk(Bob))')).toEqual([]);
  });

  it('ignores hex pubkeys inside pk', () => {
    const hex =
      '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
    expect(findDuplicatePkPlaceholders(`pk(${hex})`)).toEqual([]);
  });
});

describe('findAllWordRanges', () => {
  it('finds two Alice occurrences', () => {
    const policy = 'thresh(3,pk(Alice),pk(Bob),pk(Alice))';
    const ranges = findAllWordRanges(policy, 'Alice');
    expect(ranges).toHaveLength(2);
    expect(policy.slice(ranges[0]!.from, ranges[0]!.to)).toBe('Alice');
    expect(policy.slice(ranges[1]!.from, ranges[1]!.to)).toBe('Alice');
  });
});

describe('upgradeErrorWithPreflight', () => {
  const policy = 'thresh(3,pk(Alice),pk(Bob),pk(Alice))';

  it('upgrades generic syntax failure to duplicate_key and preserves raw', () => {
    const err: FriendlyError = {
      raw: '[compile error]',
      category: 'syntax',
      friendly: { zh: 'old', en: 'old' },
    };
    const out = upgradeErrorWithPreflight(policy, err);
    expect(out.category).toBe('duplicate_key');
    expect(out.raw).toBe('[compile error]');
    expect(out.duplicateNames).toEqual(['Alice']);
    expect(out.friendly.zh).toContain('Alice');
  });

  it('does not override unknown_fragment', () => {
    const err: FriendlyError = {
      raw: `unknown 'x'`,
      category: 'unknown_fragment',
      friendly: { zh: 'x', en: 'x' },
    };
    expect(upgradeErrorWithPreflight(policy, err)).toBe(err);
  });
});
