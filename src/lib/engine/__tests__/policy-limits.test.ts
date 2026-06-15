import { describe, expect, it } from 'vitest';
import {
  MAX_POLICY_DEPTH,
  MAX_POLICY_NODES,
  MAX_POLICY_THRESHOLD_BRANCHES,
  inspectPolicyBudget,
  isFatalCompilerFailure,
  validatePolicyCompileInput,
} from '../policy-limits';

const PUBKEY = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';

describe('policy compile budgets', () => {
  it('counts nodes, nesting, and threshold branches without invoking WASM', () => {
    expect(inspectPolicyBudget('and(pk(A),thresh(2,pk(B),pk(C),older(10)))')).toEqual({
      nodes: 6,
      depth: 3,
      maxThresholdBranches: 3,
    });
  });

  it('rejects excessive node count', () => {
    const policy = `and(${Array.from({ length: MAX_POLICY_NODES + 1 }, (_, i) => `pk(K${i})`).join(',')})`;
    expect(validatePolicyCompileInput(policy, [])?.raw).toContain('node budget');
  });

  it('rejects excessive nesting depth', () => {
    const policy = `${'and('.repeat(MAX_POLICY_DEPTH + 1)}pk(A)${')'.repeat(MAX_POLICY_DEPTH + 1)}`;
    expect(validatePolicyCompileInput(policy, [])?.raw).toContain('nesting depth');
  });

  it('rejects excessive thresh branches', () => {
    const branches = Array.from(
      { length: MAX_POLICY_THRESHOLD_BRANCHES + 1 },
      (_, i) => `pk(K${i})`,
    );
    const policy = `thresh(1,${branches.join(',')})`;
    expect(validatePolicyCompileInput(policy, [])?.raw).toContain('threshold branch');
  });

  it('rejects malformed or oversized key fields', () => {
    expect(
      validatePolicyCompileInput('pk(A)', [
        { name: 'A', policyName: 'A', publicKey: 'not-a-public-key' },
      ])?.raw,
    ).toContain('public key');
  });

  it('recognizes fatal WASM failure signatures', () => {
    expect(isFatalCompilerFailure('Aborted(OOM)')).toBe(true);
    expect(isFatalCompilerFailure('runtime assertion failed')).toBe(true);
    expect(isFatalCompilerFailure('[compile error]')).toBe(false);
  });
});
