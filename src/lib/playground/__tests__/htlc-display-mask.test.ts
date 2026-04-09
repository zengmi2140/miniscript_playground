import { describe, expect, it } from 'vitest';
import {
  HTLC_TEACHING_HASH160_DIGEST,
  maskHash160DigestInPolicy,
  shouldMaskHtlcTeachingHash160,
  unmaskHash160DigestInPolicy,
} from '../htlc-display-mask';

describe('htlc-display-mask', () => {
  const samplePolicy = `or(and(pk(Alice),hash160(${HTLC_TEACHING_HASH160_DIGEST})),and(pk(Bob),older(2016)))`;

  it('round-trips mask / unmask', () => {
    const masked = maskHash160DigestInPolicy(samplePolicy);
    expect(masked).toContain('hash160(HEX)');
    expect(masked).not.toContain(HTLC_TEACHING_HASH160_DIGEST);
    expect(unmaskHash160DigestInPolicy(masked)).toBe(samplePolicy);
  });

  it('shouldMaskHtlcTeachingHash160 only for htlc-atomic', () => {
    expect(shouldMaskHtlcTeachingHash160('htlc-atomic')).toBe(true);
    expect(shouldMaskHtlcTeachingHash160('multisig-2of3')).toBe(false);
    expect(shouldMaskHtlcTeachingHash160(null)).toBe(false);
  });
});
