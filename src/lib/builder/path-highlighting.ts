/**
 * Path highlighting utilities for the visual builder
 * 
 * Maps spending path conditions back to builder tree node IDs
 * for highlighting the relevant branch when a path card is selected.
 */

import type { StrategyNode } from './types';
import type { SpendingPath } from '@/lib/engine/types';

/**
 * Collect all node IDs that should be highlighted for a given spending path.
 * 
 * @param tree - The root StrategyNode
 * @param path - The selected spending path
 * @returns A set of node IDs to highlight
 */
export function collectHighlightedNodeIds(
  tree: StrategyNode,
  path: SpendingPath
): Set<string> {
  const highlightedIds = new Set<string>();

  // Extract conditions from the path
  const pathKeys = new Set<string>();
  const pathTimelocks = new Set<number>();

  for (const cond of path.conditions) {
    if (cond.type === 'signature') {
      pathKeys.add(cond.keyName);
    } else if (cond.type === 'timelock_relative') {
      pathTimelocks.add(cond.blocks);
    }
    // Note: absolute timelocks and hashlocks are not editable in MVP
  }

  /**
   * Recursively find nodes that match the path conditions.
   * Returns true if this node (or any descendant) matches the path.
   */
  function findMatchingNodes(node: StrategyNode): boolean {
    switch (node.kind) {
      case 'placeholder': {
        // Placeholders never match
        return false;
      }

      case 'signature': {
        if (pathKeys.has(node.roleId)) {
          highlightedIds.add(node.id);
          return true;
        }
        return false;
      }

      case 'timelock': {
        if (node.mode === 'relative' && pathTimelocks.has(node.value)) {
          highlightedIds.add(node.id);
          return true;
        }
        return false;
      }

      case 'hashlock': {
        // Hashlocks are not user-creatable in MVP
        return false;
      }

      case 'group': {
        // For groups, we need to determine which children are on the path
        // Filter out placeholders
        const realChildren = node.children.filter(c => c.kind !== 'placeholder');
        
        switch (node.op) {
          case 'all': {
            // AND: all children must be on the path
            const childMatches = realChildren.map(child => findMatchingNodes(child));
            const allMatch = childMatches.every(m => m);
            if (allMatch) {
              highlightedIds.add(node.id);
              return true;
            }
            // If some children match, still highlight them but not the parent
            return childMatches.some(m => m);
          }

          case 'any': {
            // OR: only highlight the branch(es) that satisfy the path
            let anyMatch = false;
            for (const child of realChildren) {
              if (findMatchingNodes(child)) {
                anyMatch = true;
                // Don't break - check all children to collect all matching nodes
              }
            }
            if (anyMatch) {
              highlightedIds.add(node.id);
            }
            return anyMatch;
          }

          case 'threshold': {
            // THRESHOLD: highlight matched participant leaves plus the parent
            const matchedCount = realChildren.filter(child => 
              findMatchingNodes(child)
            ).length;
            
            if (matchedCount >= (node.threshold ?? 1)) {
              highlightedIds.add(node.id);
              return true;
            }
            return matchedCount > 0;
          }

          default:
            return false;
        }
      }

      default:
        return false;
    }
  }

  findMatchingNodes(tree);
  return highlightedIds;
}

/**
 * Check if a node ID is in the highlighted set
 */
export function isNodeHighlighted(
  nodeId: string,
  highlightedIds: Set<string>
): boolean {
  return highlightedIds.has(nodeId);
}
