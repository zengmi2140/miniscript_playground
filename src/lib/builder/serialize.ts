/**
 * Builder Serializer
 *
 * Serializes a StrategyNode tree to a canonical Policy string.
 */

import type { StrategyNode } from './types';

/**
 * Policy `and` / `or` are binary only. Fold N sub-policies into right-nested form:
 * [a,b,c] -> and(a,and(b,c)); [a,b] -> and(a,b).
 */
function foldBinaryAnd(childPolicies: string[]): string {
  if (childPolicies.length === 0) return '';
  if (childPolicies.length === 1) return childPolicies[0];
  const [first, ...rest] = childPolicies;
  return `and(${first},${foldBinaryAnd(rest)})`;
}

function foldBinaryOr(childPolicies: string[]): string {
  if (childPolicies.length === 0) return '';
  if (childPolicies.length === 1) return childPolicies[0];
  const [first, ...rest] = childPolicies;
  return `or(${first},${foldBinaryOr(rest)})`;
}

/**
 * Serialize a StrategyNode tree to a Policy string.
 *
 * Rules:
 * - group(all) -> nested binary and(...) (Policy requires binary and)
 * - group(any) -> nested binary or(...)
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
          return foldBinaryAnd(childPolicies);

        case 'any':
          if (childPolicies.length === 0) return '';
          if (childPolicies.length === 1) return childPolicies[0];
          return foldBinaryOr(childPolicies);

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
