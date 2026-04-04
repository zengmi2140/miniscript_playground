/**
 * Builder test fixtures
 *
 * Factory helpers for unit tests (serialize, tree-to-flow, store tests).
 */

import type { BuilderTemplate, StrategyNode } from './types';

// Valid secp256k1 test public keys (from DEFAULT_TEST_KEYS)
const TEST_PUBLIC_KEYS = [
  '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
];

let nodeIdCounter = 0;
let keyIndex = 0;

function generateNodeId(): string {
  return `node_${++nodeIdCounter}`;
}

/**
 * Get a valid test public key (cycles through predefined valid keys)
 */
function getTestPublicKey(): string {
  const key = TEST_PUBLIC_KEYS[keyIndex % TEST_PUBLIC_KEYS.length];
  keyIndex++;
  return key;
}

/**
 * Reset the node ID counter (useful for tests)
 */
export function resetNodeIdCounter(): void {
  nodeIdCounter = 0;
  keyIndex = 0;
}

/**
 * Single signature template: pk(Alice)
 */
export function singleSigTemplate(): BuilderTemplate {
  const tree: StrategyNode = {
    id: generateNodeId(),
    kind: 'signature',
    roleId: 'Alice',
  };

  return {
    tree,
    policy: 'pk(Alice)',
    keyVariables: [
      { name: 'Alice', policyName: 'Alice', publicKey: getTestPublicKey() },
    ],
  };
}

/**
 * 2-of-3 threshold: thresh(2,pk(Alice),pk(Bob),pk(Charlie))
 */
export function sharedControlTemplate(): BuilderTemplate {
  const tree: StrategyNode = {
    id: generateNodeId(),
    kind: 'group',
    op: 'threshold',
    threshold: 2,
    children: [
      { id: generateNodeId(), kind: 'signature', roleId: 'Alice' },
      { id: generateNodeId(), kind: 'signature', roleId: 'Bob' },
      { id: generateNodeId(), kind: 'signature', roleId: 'Charlie' },
    ],
  };

  return {
    tree,
    policy: 'thresh(2,pk(Alice),pk(Bob),pk(Charlie))',
    keyVariables: [
      { name: 'Alice', policyName: 'Alice', publicKey: getTestPublicKey() },
      { name: 'Bob', policyName: 'Bob', publicKey: getTestPublicKey() },
      { name: 'Charlie', policyName: 'Charlie', publicKey: getTestPublicKey() },
    ],
  };
}

/**
 * Nested and/or/timelock tree for flow tests: and(pk(User),or(pk(Service),older(4320)))
 * (Stable ids for assertions — resetNodeIdCounter before use in tests.)
 */
export function nestedRecoveryLikeTree(): StrategyNode {
  return {
    id: generateNodeId(),
    kind: 'group',
    op: 'all',
    children: [
      { id: generateNodeId(), kind: 'signature', roleId: 'User' },
      {
        id: generateNodeId(),
        kind: 'group',
        op: 'any',
        children: [
          { id: generateNodeId(), kind: 'signature', roleId: 'Service' },
          {
            id: generateNodeId(),
            kind: 'timelock',
            mode: 'relative',
            value: 4320,
            unit: 'blocks',
          },
        ],
      },
    ],
  };
}
