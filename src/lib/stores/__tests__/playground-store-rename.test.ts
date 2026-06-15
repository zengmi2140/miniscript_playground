/**
 * P1-02: keyVariable rename atomicity.
 *
 * Renaming Alice → Guardian must rewrite the policy text using token-aware
 * replacement so `pk(Alice)` becomes `pk(Guardian)` and never corrupts
 * unrelated identifiers.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { usePlaygroundStore } from '../playground-store';

const PUB_A = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
const PUB_B = '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5';

describe('renameKeyVariable (P1-02)', () => {
  beforeEach(() => {
    usePlaygroundStore.getState().reset();
  });

  it('renames Alice → Guardian and rewrites the current policy text', () => {
    usePlaygroundStore.setState({
      policy: 'and(pk(Alice),older(144))',
      keyVariables: [{ name: 'Alice', policyName: 'Alice', publicKey: PUB_A }],
    });

    usePlaygroundStore.getState().renameKeyVariable('Alice', 'Guardian');

    const { policy, keyVariables } = usePlaygroundStore.getState();
    expect(policy).toBe('and(pk(Guardian),older(144))');
    expect(keyVariables).toHaveLength(1);
    expect(keyVariables[0]).toEqual({
      name: 'Guardian',
      policyName: 'Guardian',
      publicKey: PUB_A,
    });
  });

  it('does not corrupt longer-key substrings when renaming a shorter key (Alic vs Alice)', () => {
    // Word-boundary rewrite: renaming `Alic` must NOT touch `Alice`.
    usePlaygroundStore.setState({
      policy: 'or(pk(Alic),pk(Alice))',
      keyVariables: [
        { name: 'Alic', policyName: 'Alic', publicKey: PUB_A },
        { name: 'Alice', policyName: 'Alice', publicKey: PUB_B },
      ],
    });

    usePlaygroundStore.getState().renameKeyVariable('Alic', 'Allie');

    const { policy } = usePlaygroundStore.getState();
    expect(policy).toBe('or(pk(Allie),pk(Alice))');
  });

  it('does not corrupt a longer key when renaming a shorter prefix (A vs Alice)', () => {
    usePlaygroundStore.setState({
      policy: 'or(pk(A),pk(Alice))',
      keyVariables: [
        { name: 'A', policyName: 'A', publicKey: PUB_A },
        { name: 'Alice', policyName: 'Alice', publicKey: PUB_B },
      ],
    });

    usePlaygroundStore.getState().renameKeyVariable('A', 'Anchor');

    const { policy, keyVariables } = usePlaygroundStore.getState();
    expect(policy).toBe('or(pk(Anchor),pk(Alice))');
    expect(keyVariables.find((k) => k.policyName === 'Anchor')).toBeTruthy();
    expect(keyVariables.find((k) => k.policyName === 'Alice')).toBeTruthy();
  });

  it('rejects an invalid identifier (no-op)', () => {
    usePlaygroundStore.setState({
      policy: 'pk(Alice)',
      keyVariables: [{ name: 'Alice', policyName: 'Alice', publicKey: PUB_A }],
    });

    usePlaygroundStore.getState().renameKeyVariable('Alice', 'has spaces');

    const { policy, keyVariables } = usePlaygroundStore.getState();
    expect(policy).toBe('pk(Alice)');
    expect(keyVariables[0].policyName).toBe('Alice');
  });

  it('rejects rename that collides with an existing policyName (no-op)', () => {
    usePlaygroundStore.setState({
      policy: 'or(pk(Alice),pk(Bob))',
      keyVariables: [
        { name: 'Alice', policyName: 'Alice', publicKey: PUB_A },
        { name: 'Bob', policyName: 'Bob', publicKey: PUB_B },
      ],
    });

    usePlaygroundStore.getState().renameKeyVariable('Alice', 'Bob');

    const { policy, keyVariables } = usePlaygroundStore.getState();
    expect(policy).toBe('or(pk(Alice),pk(Bob))');
    expect(keyVariables.map((k) => k.policyName)).toEqual(['Alice', 'Bob']);
  });

  it('rename to same policyName updates display name + publicKey only', () => {
    usePlaygroundStore.setState({
      policy: 'pk(Alice)',
      keyVariables: [{ name: 'Alice', policyName: 'Alice', publicKey: PUB_A }],
    });

    usePlaygroundStore.getState().renameKeyVariable('Alice', 'Alice', PUB_B);

    const { policy, keyVariables } = usePlaygroundStore.getState();
    expect(policy).toBe('pk(Alice)');
    expect(keyVariables[0].publicKey).toBe(PUB_B);
  });
});

describe('share payload validation (P1-02)', () => {
  it('rejects payloads where policyName is not a valid identifier', async () => {
    const { encodeSharePayload } = await import('../../utils/share');
    expect(() =>
      encodeSharePayload({
        policy: 'pk(A)',
        keyVariables: [{ name: 'A', policyName: '1bad', publicKey: PUB_A }],
        context: 'wsh',
        network: 'testnet',
      }),
    ).toThrow();
  });

  it('rejects payloads with duplicate policyName', async () => {
    const { encodeSharePayload } = await import('../../utils/share');
    expect(() =>
      encodeSharePayload({
        policy: 'or(pk(Alice),pk(Alice))',
        keyVariables: [
          { name: 'Alice', policyName: 'Alice', publicKey: PUB_A },
          { name: 'Alice2', policyName: 'Alice', publicKey: PUB_B },
        ],
        context: 'wsh',
        network: 'testnet',
      }),
    ).toThrow();
  });

  it('accepts payloads with name !== policyName (display label may differ)', async () => {
    const { decodeSharePayload, encodeSharePayload } = await import('../../utils/share');
    const ok = encodeSharePayload({
      policy: 'pk(Alice)',
      keyVariables: [{ name: 'Display Label', policyName: 'Alice', publicKey: PUB_A }],
      context: 'wsh',
      network: 'testnet',
    });
    const decoded = decodeSharePayload(ok);
    expect(decoded).not.toBeNull();
    expect(decoded!.keyVariables[0].name).toBe('Display Label');
    expect(decoded!.keyVariables[0].policyName).toBe('Alice');
  });
});
