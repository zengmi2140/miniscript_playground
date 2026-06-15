import type { FriendlyError, KeyVariable } from './types';
import { isValidPolicyIdentifier } from '@/lib/utils/policy-identifiers';

export const MAX_POLICY_LENGTH = 4 * 1024;
export const MAX_POLICY_NODES = 64;
export const MAX_POLICY_DEPTH = 32;
export const MAX_POLICY_THRESHOLD_BRANCHES = 8;
export const MAX_POLICY_KEY_VARIABLES = 32;
export const MAX_POLICY_KEY_NAME_LENGTH = 64;
export const MAX_POLICY_PUBLIC_KEY_LENGTH = 66;

const PUBLIC_KEY_RE = /^(?:[0-9a-fA-F]{64}|(?:02|03)[0-9a-fA-F]{64})$/u;

export function isSupportedPublicKey(value: string): boolean {
  return PUBLIC_KEY_RE.test(value);
}

interface PolicyBudgetStats {
  nodes: number;
  depth: number;
  maxThresholdBranches: number;
}

function limitError(raw: string, zh: string, en: string): FriendlyError {
  return {
    raw,
    category: 'limit',
    friendly: { zh, en },
    hints: {
      zh: ['简化策略、减少嵌套或拆分门限分支后再试'],
      en: ['Simplify the policy, reduce nesting, or split threshold branches before retrying'],
    },
  };
}

export function inspectPolicyBudget(policy: string): PolicyBudgetStats {
  const stack: Array<{ functionName: string | null; commas: number }> = [];
  let nodes = 0;
  let depth = 0;
  let maxThresholdBranches = 0;

  for (let i = 0; i < policy.length; i++) {
    const ch = policy[i];
    if (ch === '(') {
      let end = i;
      let start = i - 1;
      while (start >= 0 && /\s/u.test(policy[start] ?? '')) start--;
      end = start + 1;
      while (start >= 0 && /[A-Za-z0-9_]/u.test(policy[start] ?? '')) start--;
      const functionName = policy.slice(start + 1, end) || null;
      if (functionName) nodes++;
      stack.push({ functionName, commas: 0 });
      depth = Math.max(depth, stack.length);
      continue;
    }

    if (ch === ',' && stack.length > 0) {
      stack[stack.length - 1]!.commas++;
      continue;
    }

    if (ch === ')' && stack.length > 0) {
      const frame = stack.pop()!;
      if (frame.functionName === 'thresh' || frame.functionName === 'multi') {
        maxThresholdBranches = Math.max(maxThresholdBranches, frame.commas);
      }
    }
  }

  return { nodes, depth, maxThresholdBranches };
}

export function validateKeyVariablesForCompile(
  keyVariables: KeyVariable[],
): FriendlyError | null {
  if (keyVariables.length > MAX_POLICY_KEY_VARIABLES) {
    return limitError(
      'Policy key variable count limit exceeded',
      `角色变量不能超过 ${MAX_POLICY_KEY_VARIABLES} 个。`,
      `A policy may use at most ${MAX_POLICY_KEY_VARIABLES} key variables.`,
    );
  }

  const seen = new Set<string>();
  for (const key of keyVariables) {
    if (
      key.name.length === 0 ||
      key.name.length > MAX_POLICY_KEY_NAME_LENGTH ||
      key.policyName.length === 0 ||
      key.policyName.length > MAX_POLICY_KEY_NAME_LENGTH ||
      !isValidPolicyIdentifier(key.policyName) ||
      seen.has(key.policyName)
    ) {
      return limitError(
        'Policy key identifier limit exceeded',
        `角色名称必须唯一、格式合法，且不超过 ${MAX_POLICY_KEY_NAME_LENGTH} 个字符。`,
        `Key names must be unique valid identifiers no longer than ${MAX_POLICY_KEY_NAME_LENGTH} characters.`,
      );
    }
    seen.add(key.policyName);

    if (
      key.publicKey.length > MAX_POLICY_PUBLIC_KEY_LENGTH ||
      !isSupportedPublicKey(key.publicKey)
    ) {
      return limitError(
        'Policy public key format limit exceeded',
        '公钥必须是 64 字符 x-only 或 66 字符压缩十六进制格式。',
        'Public keys must be 64-character x-only or 66-character compressed hexadecimal values.',
      );
    }
  }

  return null;
}

export function validatePolicyCompileInput(
  policy: string,
  keyVariables: KeyVariable[],
): FriendlyError | null {
  if (policy.length > MAX_POLICY_LENGTH) {
    return limitError(
      'Policy text length limit exceeded',
      `Policy 不能超过 ${MAX_POLICY_LENGTH} 个字符。`,
      `Policy text may not exceed ${MAX_POLICY_LENGTH} characters.`,
    );
  }

  const keyError = validateKeyVariablesForCompile(keyVariables);
  if (keyError) return keyError;

  const stats = inspectPolicyBudget(policy);
  if (stats.nodes > MAX_POLICY_NODES) {
    return limitError(
      'Policy node budget exceeded',
      `Policy 语法节点不能超过 ${MAX_POLICY_NODES} 个。`,
      `A policy may contain at most ${MAX_POLICY_NODES} syntax nodes.`,
    );
  }
  if (stats.depth > MAX_POLICY_DEPTH) {
    return limitError(
      'Policy nesting depth budget exceeded',
      `Policy 嵌套深度不能超过 ${MAX_POLICY_DEPTH} 层。`,
      `Policy nesting may not exceed ${MAX_POLICY_DEPTH} levels.`,
    );
  }
  if (stats.maxThresholdBranches > MAX_POLICY_THRESHOLD_BRANCHES) {
    return limitError(
      'Policy threshold branch budget exceeded',
      `单个 thresh() 或 multi() 不能超过 ${MAX_POLICY_THRESHOLD_BRANCHES} 个分支。`,
      `A single thresh() or multi() may contain at most ${MAX_POLICY_THRESHOLD_BRANCHES} branches.`,
    );
  }

  return null;
}

export function isFatalCompilerFailure(raw: string): boolean {
  return /\b(?:abort(?:ed)?|out of memory|oom|assertion)\b/iu.test(raw);
}
