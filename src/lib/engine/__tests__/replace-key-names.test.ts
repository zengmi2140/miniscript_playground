/**
 * P1-03: token-aware key replacement inside the compiler.
 */
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { replaceKeyNames, compile } from '../compiler';

const PUB_A = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
const PUB_B = '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5';

describe('replaceKeyNames', () => {
  it('does not split or_b / and_v fragments when a key is named "or"', () => {
    const out = replaceKeyNames('and_v(v:pk(or),or_b(pk(Bob),older(100)))', [
      { name: 'or', policyName: 'or', publicKey: PUB_A },
      { name: 'Bob', policyName: 'Bob', publicKey: PUB_B },
    ]);
    expect(out).toBe(
      `and_v(v:pk(${PUB_A}),or_b(pk(${PUB_B}),older(100)))`,
    );
  });

  it('does not replace A inside Alice when both keys are present', () => {
    const out = replaceKeyNames('pk(A),pk(Alice)', [
      { name: 'A', policyName: 'A', publicKey: PUB_A },
      { name: 'Alice', policyName: 'Alice', publicKey: PUB_B },
    ]);
    expect(out).toBe(`pk(${PUB_A}),pk(${PUB_B})`);
  });

  it('does not replace Key1 inside Key10', () => {
    const out = replaceKeyNames('pk(Key1),pk(Key10)', [
      { name: 'Key1', policyName: 'Key1', publicKey: PUB_A },
      { name: 'Key10', policyName: 'Key10', publicKey: PUB_B },
    ]);
    expect(out).toBe(`pk(${PUB_A}),pk(${PUB_B})`);
  });
});

describe('compile() integrates token-aware key replacement', () => {
  it('compiles with overlapping names A and Alice without leakage', async () => {
    const { result, error } = await compile(
      'or(pk(A),pk(Alice))',
      [
        { name: 'A', policyName: 'A', publicKey: PUB_A },
        { name: 'Alice', policyName: 'Alice', publicKey: PUB_B },
      ],
      'wsh',
    );
    expect(error).toBeNull();
    expect(result).not.toBeNull();
    expect(result!.miniscriptWithKeys).toContain(PUB_A);
    expect(result!.miniscriptWithKeys).toContain(PUB_B);
    // The display string `policyWithKeys` should also be untouched at A/Alice boundary.
    expect(result!.policyWithKeys).toBe(
      `or(pk(${PUB_A}),pk(${PUB_B}))`,
    );
  });
});
