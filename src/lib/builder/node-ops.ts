/**
 * Builder Node Operations
 *
 * Pure functions for manipulating the StrategyNode tree.
 * All operations return new trees without mutating the original.
 */

import type { StrategyNode, StrategyGroupNode } from './types';

let nodeIdCounter = 1000;

function generateNodeId(): string {
  return `op_${++nodeIdCounter}`;
}

/**
 * Reset the node ID counter (useful for tests)
 */
export function resetNodeOpsIdCounter(): void {
  nodeIdCounter = 1000;
}

/**
 * Find a node by ID in the tree
 */
export function findNode(tree: StrategyNode, nodeId: string): StrategyNode | null {
  if (tree.id === nodeId) return tree;

  if (tree.kind === 'group') {
    for (const child of tree.children) {
      const found = findNode(child, nodeId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Find the parent of a node by ID
 */
export function findParent(tree: StrategyNode, nodeId: string): StrategyGroupNode | null {
  if (tree.kind !== 'group') return null;

  for (const child of tree.children) {
    if (child.id === nodeId) return tree;
    const found = findParent(child, nodeId);
    if (found) return found;
  }

  return null;
}

/**
 * Update a node in the tree by ID
 */
export function updateNode(
  tree: StrategyNode,
  nodeId: string,
  updater: (node: StrategyNode) => StrategyNode
): StrategyNode {
  if (tree.id === nodeId) {
    return updater(tree);
  }

  if (tree.kind === 'group') {
    return {
      ...tree,
      children: tree.children.map((child) => updateNode(child, nodeId, updater)),
    };
  }

  return tree;
}

/**
 * Add a child node to a group
 */
export function addChildNode(
  tree: StrategyNode,
  parentId: string,
  child: StrategyNode
): StrategyNode {
  return updateNode(tree, parentId, (node) => {
    if (node.kind !== 'group') return node;
    return {
      ...node,
      children: [...node.children, child],
    };
  });
}

/**
 * Remove a node from the tree by ID
 * Returns null if the root node is being removed
 */
export function removeNode(tree: StrategyNode, nodeId: string): StrategyNode | null {
  if (tree.id === nodeId) {
    return null;
  }

  if (tree.kind === 'group') {
    const newChildren = tree.children
      .filter((child) => child.id !== nodeId)
      .map((child) => {
        const result = removeNode(child, nodeId);
        return result ?? child;
      })
      .filter((child): child is StrategyNode => child !== null);

    return {
      ...tree,
      children: newChildren,
    };
  }

  return tree;
}

/**
 * Wrap a node in a new group
 */
export function wrapNodeInGroup(
  tree: StrategyNode,
  nodeId: string,
  op: 'all' | 'any'
): StrategyNode {
  const node = findNode(tree, nodeId);
  if (!node) return tree;

  const newGroup: StrategyNode = {
    id: generateNodeId(),
    kind: 'group',
    op,
    children: [node],
  };

  // If wrapping the root node
  if (tree.id === nodeId) {
    return newGroup;
  }

  // Find parent and replace the node with the new group
  return updateNode(tree, nodeId, () => newGroup);
}

/**
 * Update a signature node's role
 */
export function updateSignatureRole(
  tree: StrategyNode,
  nodeId: string,
  newRoleId: string
): StrategyNode {
  return updateNode(tree, nodeId, (node) => {
    if (node.kind !== 'signature') return node;
    return { ...node, roleId: newRoleId };
  });
}

/**
 * Update a timelock node's value
 */
export function updateTimelockValue(
  tree: StrategyNode,
  nodeId: string,
  newValue: number
): StrategyNode {
  return updateNode(tree, nodeId, (node) => {
    if (node.kind !== 'timelock') return node;
    return { ...node, value: newValue };
  });
}

/**
 * Update a threshold group's k value
 */
export function updateThreshold(
  tree: StrategyNode,
  nodeId: string,
  newK: number
): StrategyNode {
  return updateNode(tree, nodeId, (node) => {
    if (node.kind !== 'group' || node.op !== 'threshold') return node;
    return { ...node, threshold: newK };
  });
}

/**
 * Convert a group to a different operation type
 */
export function convertGroupOp(
  tree: StrategyNode,
  nodeId: string,
  newOp: 'all' | 'any' | 'threshold',
  threshold?: number
): StrategyNode {
  return updateNode(tree, nodeId, (node) => {
    if (node.kind !== 'group') return node;
    return {
      ...node,
      op: newOp,
      threshold: newOp === 'threshold' ? (threshold ?? 1) : undefined,
    };
  });
}

/**
 * Create a new signature node
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
export function createTimelockNode(blocks: number): StrategyNode {
  return {
    id: generateNodeId(),
    kind: 'timelock',
    mode: 'relative',
    value: blocks,
    unit: 'blocks',
  };
}

/**
 * Add a signature child to a group
 */
export function addSignatureChild(
  tree: StrategyNode,
  parentId: string,
  roleId: string
): StrategyNode {
  return addChildNode(tree, parentId, createSignatureNode(roleId));
}

/**
 * Add a timelock child to a group
 */
export function addTimelockChild(
  tree: StrategyNode,
  parentId: string,
  blocks: number
): StrategyNode {
  return addChildNode(tree, parentId, createTimelockNode(blocks));
}

/**
 * Collect all role IDs used in the tree
 */
export function collectRoleIds(tree: StrategyNode): Set<string> {
  const roles = new Set<string>();

  function collect(node: StrategyNode) {
    if (node.kind === 'signature') {
      roles.add(node.roleId);
    } else if (node.kind === 'group') {
      node.children.forEach(collect);
    }
  }

  collect(tree);
  return roles;
}

/**
 * Convert a root placeholder node to a specific strategy type
 */
export function convertRootPlaceholder(
  tree: StrategyNode,
  targetType: 'signature' | 'group',
  options: {
    roleId?: string;
    groupOp?: 'all' | 'any' | 'threshold';
    threshold?: number;
    initialChildCount?: number;
  } = {}
): StrategyNode {
  if (tree.kind !== 'placeholder' || tree.placeholderType !== 'root') {
    return tree;
  }

  if (targetType === 'signature') {
    return {
      id: generateNodeId(),
      kind: 'signature',
      roleId: options.roleId || 'Signer1',
    };
  }

  // Group type
  const op = options.groupOp || 'all';
  const threshold = options.threshold ?? 2;
  const initialChildCount = options.initialChildCount ?? (op === 'threshold' ? 3 : 0);

  // Create initial children for threshold groups
  const children: StrategyNode[] = [];
  for (let i = 0; i < initialChildCount; i++) {
    children.push({
      id: generateNodeId(),
      kind: 'placeholder',
      placeholderType: 'child',
    });
  }

  return {
    id: generateNodeId(),
    kind: 'group',
    op,
    threshold: op === 'threshold' ? threshold : undefined,
    children,
  };
}

/**
 * Convert a child placeholder to a specific node type
 */
export function convertChildPlaceholder(
  tree: StrategyNode,
  placeholderId: string,
  targetType: 'signature' | 'timelock' | 'group',
  options: {
    roleId?: string;
    timelockBlocks?: number;
    groupOp?: 'all' | 'any' | 'threshold';
    threshold?: number;
  } = {}
): StrategyNode {
  return updateNode(tree, placeholderId, (node) => {
    if (node.kind !== 'placeholder') return node;

    if (targetType === 'signature') {
      return {
        id: generateNodeId(),
        kind: 'signature',
        roleId: options.roleId || 'Signer1',
      };
    }

    if (targetType === 'timelock') {
      return {
        id: generateNodeId(),
        kind: 'timelock',
        mode: 'relative',
        value: options.timelockBlocks || 4320,
        unit: 'blocks',
      };
    }

    // Nested group
    const op = options.groupOp || 'all';
    return {
      id: generateNodeId(),
      kind: 'group',
      op,
      threshold: op === 'threshold' ? (options.threshold ?? 2) : undefined,
      children: [],
    };
  });
}

/**
 * Create default key variables for a number of signers
 * Uses valid secp256k1 test public keys from DEFAULT_TEST_KEYS
 */
export function createDefaultKeyVariables(count: number): Array<{ name: string; policyName: string; publicKey: string }> {
  // Valid secp256k1 test public keys
  const testKeys = [
    '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
    '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
    '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
  ];

  const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Henry'];
  const result: Array<{ name: string; policyName: string; publicKey: string }> = [];

  for (let i = 0; i < count; i++) {
    const name = names[i] || `Signer${i + 1}`;
    const publicKey = testKeys[i % testKeys.length]; // Cycle through valid keys
    result.push({
      name,
      policyName: name,
      publicKey,
    });
  }

  return result;
}
