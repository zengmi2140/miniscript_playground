import { describe, it, expect } from 'vitest';
import { blocksToHuman, afterToHuman, isOlderSatisfied, isAfterSatisfied } from '../time-utils';

describe('blocksToHuman', () => {
  it('returns block count for small values', () => {
    expect(blocksToHuman(10)).toBe('10 区块 (≈100 分钟)');
  });

  it('returns days for medium values', () => {
    expect(blocksToHuman(144)).toBe('≈1 天');
    expect(blocksToHuman(288)).toBe('≈2 天');
  });

  it('returns weeks for weekly values', () => {
    expect(blocksToHuman(1008)).toBe('≈1 周');
    expect(blocksToHuman(2016)).toBe('≈2 周');
  });

  it('returns ≈30 天 for 4320 blocks', () => {
    expect(blocksToHuman(4320)).toBe('≈30 天');
  });

  it('returns years for very large values', () => {
    expect(blocksToHuman(52560)).toBe('≈1.0 年');
    expect(blocksToHuman(105120)).toBe('≈2.0 年');
  });
});

describe('afterToHuman', () => {
  it('returns block height for values < 500000000', () => {
    expect(afterToHuman(800000)).toBe('区块高度 #800,000');
  });

  it('returns date for unix timestamp values', () => {
    const result = afterToHuman(1700000000);
    expect(result).toMatch(/\d{4}/);
  });
});

describe('isOlderSatisfied', () => {
  it('returns true when current >= older', () => {
    expect(isOlderSatisfied(4320, 4320)).toBe(true);
    expect(isOlderSatisfied(4320, 5000)).toBe(true);
  });

  it('returns false when current < older', () => {
    expect(isOlderSatisfied(4320, 4319)).toBe(false);
  });
});

describe('isAfterSatisfied', () => {
  it('handles block height mode', () => {
    expect(isAfterSatisfied(800000, 100, 800000)).toBe(true);
    expect(isAfterSatisfied(800000, 0, 799999)).toBe(false);
  });
});
