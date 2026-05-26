/**
 * Builder node status computation
 * 
 * Computes the satisfaction status of each node in a StrategyNode tree
 * based on available keys and current time blocks.
 */

import type { StrategyNode } from './types';
import { effectiveThresholdK } from './threshold';
import { isPathTimelockSatisfied } from '../engine/time-utils';

export type BuilderNodeStatus = 'satisfied' | 'pending' | 'missing';

export interface BuilderStatusMap {
  [nodeId: string]: BuilderNodeStatus;
}

/**
 * Compute the status of each node in a builder strategy tree.
 *
 * @param tree - The root StrategyNode
 * @param availableKeys - Set of role names that have been toggled on
 * @param currentTimeBlocks - Current simulated elapsed blocks (slider value)
 * @param blockTipHeight - Current mainnet chain tip; pass `undefined` to keep
 *   "tip not ready" behavior (block-height `after()` treated as not satisfied),
 *   matching the shared semantics used by path-analyzer / tree-to-flow / StatusBanner.
 * @returns A map of node IDs to their status
 */
export function computeBuilderStatus(
  tree: StrategyNode,
  availableKeys: Set<string>,
  currentTimeBlocks: number,
  blockTipHeight?: number,
): BuilderStatusMap {
  const statusMap: BuilderStatusMap = {};

  function computeNodeStatus(node: StrategyNode): BuilderNodeStatus {
    let status: BuilderNodeStatus;

    switch (node.kind) {
      case 'placeholder': {
        // Placeholder nodes are always pending (waiting for user input)
        status = 'pending';
        break;
      }

      case 'signature': {
        // Signature is satisfied if the role is in availableKeys
        status = availableKeys.has(node.roleId) ? 'satisfied' : 'missing';
        break;
      }

      case 'timelock': {
        // Reuse the shared time-utils predicate so build-mode node status,
        // scenario path-map, path-analyzer and StatusBanner agree on
        // `older()` and `after(<height>)` semantics. For absolute `after()`
        // we use `blockTipHeight + currentTimeBlocks >= value`; if
        // `blockTipHeight` is undefined the helper treats block-height locks
        // as not satisfied (consistent with "tip not ready").
        const cond =
          node.mode === 'relative'
            ? ({ type: 'timelock_relative', blocks: node.value } as const)
            : ({ type: 'timelock_absolute', value: node.value } as const);
        status = isPathTimelockSatisfied(cond, currentTimeBlocks, blockTipHeight)
          ? 'satisfied'
          : 'pending';
        break;
      }

      case 'hashlock': {
        // Hashlocks are not user-creatable in MVP, default to missing
        status = 'missing';
        break;
      }

      case 'group': {
        // First, compute status for all real children (exclude placeholders)
        const realChildren = node.children.filter(child => child.kind !== 'placeholder');
        const childStatuses = realChildren.map(child => computeNodeStatus(child));
        
        // Empty groups are pending
        if (childStatuses.length === 0) {
          status = 'pending';
          break;
        }

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
            const k = effectiveThresholdK(node);
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
