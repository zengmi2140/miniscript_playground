/**
 * Builder node status computation
 * 
 * Computes the satisfaction status of each node in a StrategyNode tree
 * based on available keys and current time blocks.
 */

import type { StrategyNode } from './types';

export type BuilderNodeStatus = 'satisfied' | 'pending' | 'missing';

export interface BuilderStatusMap {
  [nodeId: string]: BuilderNodeStatus;
}

/**
 * Compute the status of each node in a builder strategy tree.
 * 
 * @param tree - The root StrategyNode
 * @param availableKeys - Set of role names that have been toggled on
 * @param currentTimeBlocks - Current simulated block height
 * @returns A map of node IDs to their status
 */
export function computeBuilderStatus(
  tree: StrategyNode,
  availableKeys: Set<string>,
  currentTimeBlocks: number
): BuilderStatusMap {
  const statusMap: BuilderStatusMap = {};

  function computeNodeStatus(node: StrategyNode): BuilderNodeStatus {
    let status: BuilderNodeStatus;

    switch (node.kind) {
      case 'signature': {
        // Signature is satisfied if the role is in availableKeys
        status = availableKeys.has(node.roleId) ? 'satisfied' : 'missing';
        break;
      }

      case 'timelock': {
        if (node.mode === 'relative') {
          // Relative timelock: satisfied if currentTimeBlocks >= required blocks
          status = currentTimeBlocks >= node.value ? 'satisfied' : 'pending';
        } else {
          // Absolute timelock (not editable in MVP, but we handle it)
          status = currentTimeBlocks >= node.value ? 'satisfied' : 'pending';
        }
        break;
      }

      case 'hashlock': {
        // Hashlocks are not user-creatable in MVP, default to missing
        status = 'missing';
        break;
      }

      case 'group': {
        // First, compute status for all children
        const childStatuses = node.children.map(child => computeNodeStatus(child));

        switch (node.op) {
          case 'all': {
            // AND: satisfied only if ALL children are satisfied
            const allSatisfied = childStatuses.every(s => s === 'satisfied');
            const anyPending = childStatuses.some(s => s === 'pending');
            
            if (allSatisfied) {
              status = 'satisfied';
            } else if (anyPending) {
              status = 'pending';
            } else {
              status = 'missing';
            }
            break;
          }

          case 'any': {
            // OR: satisfied if ANY child is satisfied
            const anySatisfied = childStatuses.some(s => s === 'satisfied');
            const anyPending = childStatuses.some(s => s === 'pending');
            
            if (anySatisfied) {
              status = 'satisfied';
            } else if (anyPending) {
              status = 'pending';
            } else {
              status = 'missing';
            }
            break;
          }

          case 'threshold': {
            // THRESHOLD: satisfied if at least k children are satisfied
            const k = node.threshold ?? 1;
            const satisfiedCount = childStatuses.filter(s => s === 'satisfied').length;
            const pendingCount = childStatuses.filter(s => s === 'pending').length;
            
            if (satisfiedCount >= k) {
              status = 'satisfied';
            } else if (satisfiedCount + pendingCount >= k) {
              status = 'pending';
            } else {
              status = 'missing';
            }
            break;
          }

          default:
            status = 'missing';
        }
        break;
      }

      default:
        status = 'missing';
    }

    statusMap[node.id] = status;
    return status;
  }

  computeNodeStatus(tree);
  return statusMap;
}

/**
 * Get a human-readable description of node status
 */
export function getStatusLabel(status: BuilderNodeStatus, locale: 'zh' | 'en'): string {
  const labels = {
    satisfied: { zh: '已满足', en: 'Satisfied' },
    pending: { zh: '待满足', en: 'Pending' },
    missing: { zh: '未满足', en: 'Missing' },
  };
  return labels[status][locale];
}
