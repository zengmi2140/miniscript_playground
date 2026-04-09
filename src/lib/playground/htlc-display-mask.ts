/**
 * 与 `htlc-atomic` 预设 Policy 中的 hash160 摘要一致；用于在 Policy 编辑器 / 路径图等 UI 上遮蔽为 `HEX`。
 * 编译与 store 中仍保存真实 hex。
 */
export const HTLC_TEACHING_HASH160_DIGEST =
  'b472a266d0bd89c13c8b29a9031a0acdae7a90e5' as const;

const HASH160_PREFIX = `hash160(${HTLC_TEACHING_HASH160_DIGEST})`;
const HASH160_DISPLAY = 'hash160(HEX)';

export function maskHash160DigestInPolicy(policy: string): string {
  return policy.replaceAll(HASH160_PREFIX, HASH160_DISPLAY);
}

export function unmaskHash160DigestInPolicy(displayPolicy: string): string {
  return displayPolicy.replaceAll(HASH160_DISPLAY, HASH160_PREFIX);
}

export function shouldMaskHtlcTeachingHash160(activeScenarioId: string | null): boolean {
  return activeScenarioId === 'htlc-atomic';
}
