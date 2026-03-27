import { describe, it, expect } from 'vitest';
import { createNextKeyVariable } from '../add-next-key-variable';
import type { KeyVariable } from '@/lib/engine/types';

describe('createNextKeyVariable', () => {
  it('picks Alice first when empty', () => {
    const kv = createNextKeyVariable([]);
    expect(kv.name).toBe('Alice');
    expect(kv.policyName).toBe('Alice');
    expect(kv.publicKey).toHaveLength(66);
  });

  it('picks first unused preferred name', () => {
    const existing: KeyVariable[] = [
      { name: 'Alice', policyName: 'Alice', publicKey: '02aa' },
      { name: 'Bob', policyName: 'Bob', publicKey: '02bb' },
    ];
    const kv = createNextKeyVariable(existing);
    expect(kv.name).toBe('Charlie');
  });

  it('uses Key{n} when preferred names are exhausted', () => {
    const existing: KeyVariable[] = [
      { name: 'Alice', policyName: 'Alice', publicKey: '02a1' },
      { name: 'Bob', policyName: 'Bob', publicKey: '02a2' },
      { name: 'Charlie', policyName: 'Charlie', publicKey: '02a3' },
      { name: 'Dave', policyName: 'Dave', publicKey: '02a4' },
      { name: 'Eve', policyName: 'Eve', publicKey: '02a5' },
      { name: 'Frank', policyName: 'Frank', publicKey: '02a6' },
    ];
    const kv = createNextKeyVariable(existing);
    expect(kv.name).toBe('Key7');
  });
});
