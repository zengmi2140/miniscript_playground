/**
 * Semantic Tree Importer
 *
 * Converts a MiniscriptNode (semantic tree) into a StrategyNode (builder tree).
 * Returns an explicit result indicating whether the structure is supported.
 */

import type { MiniscriptNode } from '@/lib/engine/types';
import type { StrategyNode, BuilderImportResult } from './types';

let importNodeIdCounter = 0;

function generateImportNodeId(): string {
  return `import_${++importNodeIdCounter}`;
}

/**
 * Reset the import node ID counter (useful for tests)
 */
export function resetImportNodeIdCounter(): void {
  importNodeIdCounter = 0;
}

/**
 * Import a MiniscriptNode (semantic tree) into a StrategyNode (builder tree).
 *
 * Supported fragments:
 * - key -> signature
 * - older -> timelock(relative)
 * - and / or -> group(all) / group(any)
 * - threshold / multi -> group(threshold)
 *
 * Unsupported fragments (returns explicit reason):
 * - after -> absolute-timelock
 * - hash (sha256, hash256, ripemd160, hash160) -> hashlock
 * - just_0 / just_1 -> constant-branch
 */
export function importFromSemanticTree(node: MiniscriptNode): BuilderImportResult {
  try {
    const tree = convertNode(node);
    return { status: 'supported', tree };
  } catch (error) {
    if (error instanceof UnsupportedError) {
      return {
        status: 'unsupported',
        reason: error.reason,
        message: error.message,
      };
    }
    return {
      status: 'unsupported',
      reason: 'unknown-fragment',
      message: error instanceof Error ? error.message : 'Unknown error during import',
    };
  }
}

class UnsupportedError extends Error {
  constructor(
    public reason: 'absolute-timelock' | 'hashlock' | 'unknown-fragment' | 'constant-branch',
    message: string
  ) {
    super(message);
    this.name = 'UnsupportedError';
  }
}

/**
 * Builder canvas allows at most two direct children per AND/OR group.
 * Fold N converted children into a right-deep binary tree of groups.
 */
function foldBinaryGroupChildren(children: StrategyNode[], op: 'all' | 'any'): StrategyNode {
  if (children.length === 0) {
    return { id: generateImportNodeId(), kind: 'group', op, children: [] };
  }
  if (children.length === 1) {
    return {
      id: generateImportNodeId(),
      kind: 'group',
      op,
      children: [children[0]],
    };
  }
  if (children.length === 2) {
    return {
      id: generateImportNodeId(),
      kind: 'group',
      op,
      children,
    };
  }
  const [first, ...rest] = children;
  const right = foldBinaryGroupChildren(rest, op);
  return {
    id: generateImportNodeId(),
    kind: 'group',
    op,
    children: [first, right],
  };
}

function convertNode(node: MiniscriptNode): StrategyNode {
  switch (node.type) {
    case 'key':
      return {
        id: generateImportNodeId(),
        kind: 'signature',
        roleId: node.name,
      };

    case 'older':
      return {
        id: generateImportNodeId(),
        kind: 'timelock',
        mode: 'relative',
        value: node.blocks,
        unit: 'blocks',
      };

    case 'after':
      throw new UnsupportedError(
        'absolute-timelock',
        `Absolute timelock (after(${node.value})) is not supported in the visual builder MVP`
      );

    case 'hash':
      throw new UnsupportedError(
        'hashlock',
        `Hashlock (${node.hashType}) is not supported in the visual builder MVP`
      );

    case 'just_0':
    case 'just_1':
      throw new UnsupportedError(
        'constant-branch',
        `Constant branch (${node.type}) is not supported in the visual builder`
      );

    case 'and':
      return foldBinaryGroupChildren(
        node.children.map(convertNode),
        'all',
      );

    case 'or':
      return foldBinaryGroupChildren(
        node.children.map(convertNode),
        'any',
      );

    case 'threshold':
      return {
        id: generateImportNodeId(),
        kind: 'group',
        op: 'threshold',
        threshold: node.k,
        children: node.children.map(convertNode),
      };

    case 'multi':
      // Convert multi(k, keys...) to threshold group with signature children
      return {
        id: generateImportNodeId(),
        kind: 'group',
        op: 'threshold',
        threshold: node.k,
        children: node.keys.map((keyName) => ({
          id: generateImportNodeId(),
          kind: 'signature' as const,
          roleId: keyName,
        })),
      };

    default:
      throw new UnsupportedError(
        'unknown-fragment',
        `Unknown miniscript fragment type: ${(node as { type: string }).type}`
      );
  }
}
