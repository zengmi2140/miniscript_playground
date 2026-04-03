// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { compile } from '../compiler';
import { SCENARIOS } from '@/lib/scenarios/data';

describe('compiler', () => {
  it('compiles pk(Alice) correctly', async () => {
    const { result, error } = await compile(
      'pk(Alice)',
      [{ name: 'Alice', policyName: 'Alice', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' }],
      'wsh',
    );

    expect(error).toBeNull();
    expect(result).not.toBeNull();
    expect(result!.policy).toBe('pk(Alice)');
    expect(result!.policyWithKeys).toBe(
      'pk(0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798)',
    );
    expect(result!.miniscript).toContain('Alice');
    expect(result!.miniscriptWithKeys).toContain(
      '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
    );
    expect(result!.asm).toBeTruthy();
    expect(result!.descriptor).toContain('wsh(');
    expect(result!.address).toBeTruthy();
    expect(result!.scriptHex).toBeTruthy();
  });

  it('compiles 2FA + recovery with at least 2 paths', async () => {
    const { result, paths, error } = await compile(
      'and(pk(User),or(99@pk(Service),older(4320)))',
      [
        { name: 'User', policyName: 'User', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' },
        { name: 'Service', policyName: 'Service', publicKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5' },
      ],
      'wsh',
    );

    expect(error).toBeNull();
    expect(result).not.toBeNull();
    expect(paths.length).toBeGreaterThanOrEqual(2);
  });

  it('compiles nested binary and from builder serialize (3-way all group)', async () => {
    const policy = 'and(pk(Alice),and(pk(Bob),pk(Charlie)))';
    const { result, error } = await compile(
      policy,
      [
        { name: 'Alice', policyName: 'Alice', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' },
        { name: 'Bob', policyName: 'Bob', publicKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5' },
        { name: 'Charlie', policyName: 'Charlie', publicKey: '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9' },
      ],
      'wsh',
    );

    expect(error).toBeNull();
    expect(result).not.toBeNull();
    expect(result!.policy).toBe(policy);
    expect(result!.address).toBeTruthy();
  });

  it('returns friendly error for invalid policy', async () => {
    const { result, error } = await compile(
      'invalid_garbage!!!()',
      [],
      'wsh',
    );

    expect(result).toBeNull();
    expect(error).not.toBeNull();
    expect(error!.friendly.zh).toBeTruthy();
  });

  it('compiles all 6 scenarios successfully', async () => {
    for (const scenario of SCENARIOS) {
      const { result, error } = await compile(
        scenario.policy,
        scenario.keyVariables,
        scenario.context,
      );

      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(result!.address).toBeTruthy();
    }
  }, 30000);
});
