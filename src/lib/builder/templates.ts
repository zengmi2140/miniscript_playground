/**
 * Builder Templates
 *
 * Provides starter templates for the visual builder.
 * Each template returns a tree, policy string, and key variables.
 */

import type { BuildStarterId, BuilderTemplate, StrategyNode } from './types';

let nodeIdCounter = 0;

function generateNodeId(): string {
  return `node_${++nodeIdCounter}`;
}

/**
 * Reset the node ID counter (useful for tests)
 */
export function resetNodeIdCounter(): void {
  nodeIdCounter = 0;
}

/**
 * Generate a random compressed public key for testing (66 hex chars)
 */
function generateTestPublicKey(): string {
  const prefix = Math.random() > 0.5 ? '02' : '03';
  const bytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
  ).join('');
  return prefix + bytes;
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
      { name: 'Alice', policyName: 'Alice', publicKey: generateTestPublicKey() },
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
    policy: 'multi(2,Alice,Bob,Charlie)',
    keyVariables: [
      { name: 'Alice', policyName: 'Alice', publicKey: generateTestPublicKey() },
      { name: 'Bob', policyName: 'Bob', publicKey: generateTestPublicKey() },
      { name: 'Charlie', policyName: 'Charlie', publicKey: generateTestPublicKey() },
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
      { name: 'User', policyName: 'User', publicKey: generateTestPublicKey() },
      { name: 'Service', policyName: 'Service', publicKey: generateTestPublicKey() },
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
