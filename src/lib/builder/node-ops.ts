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
 * Policy / canvas rule: `all` and `any` groups have at most 2 direct children (placeholders count).
 */
export function canAddChildToBinaryGroup(node: StrategyGroupNode): boolean {
  if (node.op === 'threshold') return true;
  return node.children.length < 2;
}

/**
 * Count direct children that are not placeholder slots (matches serialized sub-policies).
 */
export function countRealChildren(group: StrategyGroupNode): number {
  return group.children.filter((c) => c.kind !== 'placeholder').length;
}

/**
 * Default threshold k when switching to threshold or wrapping as threshold.
 * Must stay in sync with changeGroupOp's default k rule.
 */
export function defaultThresholdK(realChildCount: number): number {
  return Math.min(2, Math.max(1, realChildCount));
}

/** Clamp stored k so 1 <= k <= max(1, realChildCount). */
export function clampThresholdK(k: number, realChildCount: number): number {
  const n = Math.max(1, realChildCount);
  return Math.min(Math.max(1, k), n);
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
 * Append a new child under a group. Only valid when `parentId` refers to a group.
 * For filling an existing child placeholder slot, use `convertChildPlaceholder` instead.
 */
export function addChildNode(
  tree: StrategyNode,
  parentId: string,
  child: StrategyNode
): StrategyNode {
  return updateNode(tree, parentId, (node) => {
    if (node.kind !== 'group') return node;
    if (!canAddChildToBinaryGroup(node)) return node;
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
 * Wrap a node in a new group.
 * The original node becomes the first child of the new group.
 * A placeholder child is added as the second slot.
 * Supports all, any, and threshold ops.
 */
export function wrapNodeInGroup(
  tree: StrategyNode,
  nodeId: string,
  op: 'all' | 'any' | 'threshold',
  threshold?: number
): StrategyNode {
  const node = findNode(tree, nodeId);
  if (!node) return tree;

  const placeholder: StrategyNode = {
    id: generateNodeId(),
    kind: 'placeholder',
    placeholderType: 'child',
  };

  // New group always has exactly one real child (the wrapped node) plus optional placeholder.
  const realAfterWrap = 1;
  const rawK = threshold ?? defaultThresholdK(realAfterWrap);
  const thresholdClamped =
    op === 'threshold' ? clampThresholdK(rawK, realAfterWrap) : undefined;

  const newGroup: StrategyNode = {
    id: generateNodeId(),
    kind: 'group',
    op,
    threshold: thresholdClamped,
    children: [node, placeholder],
  };

  // If wrapping the root node, the new group becomes the new root
  if (tree.id === nodeId) {
    return newGroup;
  }

  // Replace the node in-place within its parent
  return updateNode(tree, nodeId, () => newGroup);
}

/**
 * Change the operator of a group node.
 * - When switching TO threshold: k = min(2, realChildCount), or use provided value
 * - When switching FROM threshold: threshold field is removed
 * - When switching TO all or any: at most two direct children are kept (binary groups)
 */
export function changeGroupOp(
  tree: StrategyNode,
  nodeId: string,
  newOp: 'all' | 'any' | 'threshold',
  newThreshold?: number
): StrategyNode {
  return updateNode(tree, nodeId, (node) => {
    if (node.kind !== 'group') return node;

    const realChildCount = countRealChildren(node);

    if (newOp === 'threshold') {
      const rawK = newThreshold ?? defaultThresholdK(realChildCount);
      const k = clampThresholdK(rawK, realChildCount);
      return { ...node, op: 'threshold', threshold: k };
    }

    // Switching to all or any — drop threshold field; keep at most 2 children (binary groups)
    const { threshold: _dropped, ...rest } = node as StrategyNode & { threshold?: number };
    let children = node.children;
    if ((newOp === 'all' || newOp === 'any') && children.length > 2) {
      children = children.slice(0, 2);
    }
    return { ...rest, op: newOp, children } as StrategyNode;
  });
}

/**
 * Compute the maximum nesting depth of a tree
 */
export function computeTreeDepth(tree: StrategyNode): number {
  if (tree.kind !== 'group') return 1;
  if (tree.children.length === 0) return 1;
  return 1 + Math.max(...tree.children.map(computeTreeDepth));
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
 * Replace a child placeholder node with a concrete condition. Does not append siblings;
 * for appending under a group, use `addChildNode`.
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
      threshold:
        op === 'threshold' ? clampThresholdK(options.threshold ?? defaultThresholdK(0), 0) : undefined,
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
