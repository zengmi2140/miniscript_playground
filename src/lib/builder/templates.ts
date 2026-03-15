/**
 * Builder Templates
 *
 * Provides starter templates for the visual builder.
 * Each template returns a tree, policy string, and key variables.
 */

import type { BuildStarterId, BuilderTemplate, StrategyNode } from './types';

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
 * Shared control template: multi(2,Alice,Bob,Charlie)
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
 * Recovery template: and(pk(User),or(pk(Service),older(4320)))
 */
export function recoveryTemplate(): BuilderTemplate {
  const tree: StrategyNode = {
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

  return {
    tree,
    policy: 'and(pk(User),or(pk(Service),older(4320)))',
    keyVariables: [
      { name: 'User', policyName: 'User', publicKey: getTestPublicKey() },
      { name: 'Service', policyName: 'Service', publicKey: getTestPublicKey() },
    ],
  };
}

/**
 * Get a template by its starter ID
 */
export function getTemplate(starterId: BuildStarterId): BuilderTemplate {
  switch (starterId) {
    case 'single-control':
      return singleSigTemplate();
    case 'shared-control':
      return sharedControlTemplate();
    case 'recovery':
      return recoveryTemplate();
    default:
      throw new Error(`Unknown starter ID: ${starterId}`);
  }
}

/**
 * Create a new signature node with a given role
 */
export function createSignatureNode(roleId: string): StrategyNode {
  return {
    id: generateNodeId(),
    kind: 'signature',
    roleId,
  };
}

/**
 * Create a new relative timelock node
 */
export function createRelativeTimelockNode(blocks: number): StrategyNode {
  return {
    id: generateNodeId(),
    kind: 'timelock',
    mode: 'relative',
    value: blocks,
    unit: 'blocks',
  };
}

/**
 * Create a new group node
 */
export function createGroupNode(
  op: 'all' | 'any' | 'threshold',
  children: StrategyNode[],
  threshold?: number
): StrategyNode {
  return {
    id: generateNodeId(),
    kind: 'group',
    op,
    threshold: op === 'threshold' ? threshold : undefined,
    children,
  };
}
