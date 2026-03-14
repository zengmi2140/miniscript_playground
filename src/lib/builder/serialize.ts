/**
 * Builder Serializer
 *
 * Serializes a StrategyNode tree to a canonical Policy string.
 */

import type { StrategyNode } from './types';

/**
 * Check if a threshold group contains only signature children (pure multisig)
 */
function isPureMultisig(node: StrategyNode): boolean {
  if (node.kind !== 'group' || node.op !== 'threshold') return false;
  return node.children.every((child) => child.kind === 'signature');
}

/**
 * Serialize a StrategyNode tree to a Policy string.
 *
 * Rules:
 * - group(all) -> and(...) or nested canonical and(...)
 * - group(any) -> canonical or(...)
 * - group(threshold) with all signature children -> multi(k,RoleName1,RoleName2,...)
 * - group(threshold) with mixed children -> thresh(k,...)
 * - signature -> pk(RoleName)
 * - timelock(relative) -> older(n)
 * - timelock(absolute) -> after(n)
 * - hashlock -> hash type specific (sha256, hash256, ripemd160, hash160)
 */
export function serializeStrategyTree(node: StrategyNode): string {
  switch (node.kind) {
    case 'signature':
      return `pk(${node.roleId})`;

    case 'timelock':
      if (node.mode === 'relative') {
        return `older(${node.value})`;
      } else {
        return `after(${node.value})`;
      }

    case 'hashlock':
      return `${node.hashType}(${node.digest})`;

    case 'group': {
      const childPolicies = node.children.map((child) =>
        serializeStrategyTree(child)
      );

      switch (node.op) {
        case 'all':
          if (childPolicies.length === 0) return '';
          if (childPolicies.length === 1) return childPolicies[0];
          return `and(${childPolicies.join(',')})`;

        case 'any':
          if (childPolicies.length === 0) return '';
          if (childPolicies.length === 1) return childPolicies[0];
          return `or(${childPolicies.join(',')})`;

        case 'threshold': {
          const k = node.threshold ?? 1;
          if (isPureMultisig(node)) {
            // Pure multisig: multi(k,Key1,Key2,...)
            const keys = node.children
              .filter((c): c is Extract<StrategyNode, { kind: 'signature' }> => c.kind === 'signature')
              .map((c) => c.roleId);
            return `multi(${k},${keys.join(',')})`;
          } else {
            // Mixed threshold: thresh(k,...)
            return `thresh(${k},${childPolicies.join(',')})`;
          }
        }

        default:
          return '';
      }
    }

    default:
      return '';
  }
}
