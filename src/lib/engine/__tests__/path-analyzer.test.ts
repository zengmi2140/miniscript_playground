import { describe, it, expect } from 'vitest';
import { analyzeSpendingPaths } from '../path-analyzer';

describe('path-analyzer', () => {
  it('maps duplicate publicKey to the first key variable name', () => {
    const pub = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
    const keyVariables = [
      { name: 'Alice', policyName: 'Alice', publicKey: pub },
      { name: 'Bob', policyName: 'Bob', publicKey: pub },
    ];
    const paths = analyzeSpendingPaths(
      [{ asm: `<sig(${pub})>` }],
      [],
      keyVariables,
      new Set(['Alice']),
      new Set(),
      0,
    );
    expect(paths).toHaveLength(1);
    expect(paths[0].labelVariant).toEqual({ kind: 'signatures', names: ['Alice'] });
    const sig = paths[0].conditions.find((c) => c.type === 'signature');
    expect(sig?.type).toBe('signature');
    if (sig?.type === 'signature') {
      expect(sig.keyName).toBe('Alice');
    }
  });
});
