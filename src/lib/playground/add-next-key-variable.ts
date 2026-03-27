import type { KeyVariable } from '@/lib/engine/types';
import { DEFAULT_TEST_KEYS } from '@/lib/scenarios/data';
import * as ecc from '@bitcoinerlab/secp256k1';

/**
 * Generate a valid compressed secp256k1 public key (hex) for test UI.
 */
export function generateRandomPubkey(): string {
  let pubkey: Uint8Array | null = null;
  while (!pubkey) {
    const privateKey = new Uint8Array(32);
    crypto.getRandomValues(privateKey);
    pubkey = ecc.pointFromScalar(privateKey, true);
  }
  return Array.from(pubkey)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const PREFERRED_NAMES = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank'] as const;

/**
 * Next key variable to append, using the same rules as the left panel "添加" button:
 * prefer unused names from Alice…Frank, else Key{n}; pubkey from DEFAULT_TEST_KEYS or random.
 */
export function createNextKeyVariable(keyVariables: KeyVariable[]): KeyVariable {
  const existing = new Set(keyVariables.map((k) => k.name));
  const newName =
    PREFERRED_NAMES.find((n) => !existing.has(n)) ?? `Key${keyVariables.length + 1}`;
  const publicKey = DEFAULT_TEST_KEYS[newName] ?? generateRandomPubkey();
  return { name: newName, policyName: newName, publicKey };
}
