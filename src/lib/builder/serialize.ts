/**
 * Builder Serializer
 *
 * Serializes a StrategyNode tree to a canonical Policy string.
 */

import type { StrategyNode } from './types';

/**
 * Serialize a StrategyNode tree to a Policy string.
 *
 * Rules:
 * - group(all) -> and(...) or nested canonical and(...)
 * - group(any) -> canonical or(...)
 * - group(threshold) -> thresh(k,...)
 * - signature -> pk(RoleName)
 * - timelock(relative) -> older(n)
 * - timelock(absolute) -> after(n)
 * - hashlock -> hash type specific (sha256, hash256, ripemd160, hash160)
 *
 * Note: We always use thresh(k,pk(),...) for thresholds in Policy language.
 * multi() is a Miniscript-level construct that the compiler handles internally.
 */
export function serializeStrategyTree(node: StrategyNode): string {
  switch (node.kind) {
    case 'placeholder':
      // Placeholder nodes don't serialize - they represent incomplete state
      return '';

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
      // Filter out placeholder children before serializing
      const childPolicies = node.children
        .filter((child) => child.kind !== 'placeholder')
        .map((child) => serializeStrategyTree(child))
        .filter((p) => p !== '');

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
          // Policy language uses thresh(k,pk(),...) for all thresholds
          // multi() is a Miniscript-level construct, not Policy-level
          if (childPolicies.length === 0) return '';
          return `thresh(${k},${childPolicies.join(',')})`;
        }

        default:
          return '';
      }
    }

    default:
      return '';
  }
}
