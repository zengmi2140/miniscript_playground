/**
 * Lightweight policy scans before/after WASM compile — not a full parser.
 * Upgrade rules: see `upgradeErrorWithPreflight` — do not override `unknown_fragment` or `duplicate_key`.
 */

import type { FriendlyError, FriendlyErrorCategory } from './types';

/** Hex pubkey / x-only hex inside pk(...) — not a named placeholder. */
function isHexPubkeyInner(inner: string): boolean {
  const s = inner.trim();
  return /^[0-9a-fA-F]{40,66}$/.test(s);
}

/** Simple identifier used as pk(Ident) placeholder in the playground. */
function isPlaceholderName(inner: string): boolean {
  const s = inner.trim();
  return /^[A-Za-z_]\w*$/.test(s);
}

/**
 * Finds policy names that appear in more than one `pk(...)` as placeholders
 * (non-hex inner). Order is first-seen duplicate order.
 */
export function findDuplicatePkPlaceholders(policy: string): string[] {
  const re = /\bpk\s*\(\s*([^)]+?)\s*\)/g;
  const counts = new Map<string, number>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(policy)) !== null) {
    const inner = m[1] ?? '';
    if (isHexPubkeyInner(inner)) continue;
    if (!isPlaceholderName(inner)) continue;
    const name = inner.trim();
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const dups: string[] = [];
  for (const [name, n] of counts) {
    if (n >= 2) dups.push(name);
  }
  return dups;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** All half-open ranges for whole-word occurrences of `name` in `policy`. */
export function findAllWordRanges(
  policy: string,
  name: string,
): { from: number; to: number }[] {
  const re = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'g');
  const out: { from: number; to: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(policy)) !== null) {
    const from = m.index;
    const to = from + m[0].length;
    out.push({ from, to });
  }
  return out;
}

function friendlyDuplicate(names: string[]): { zh: string; en: string } {
  const list = names.join('、');
  const listEn = names.join(', ');
  return {
    zh: `同一占位密钥名在策略中重复出现：${list}。每个 pk(...) 应使用不同的角色名（或合并为同一条件）。`,
    en: `Duplicate placeholder key name(s) in the policy: ${listEn}. Use a distinct name for each pk(...) (or merge into one condition).`,
  };
}

function hintsDuplicate(): { zh: string[]; en: string[] } {
  return {
    zh: ['删除或合并重复的 pk(角色名)，确保每个占位名只对应一个公钥'],
    en: ['Remove or merge duplicate pk(role) entries so each placeholder name is unique'],
  };
}

/** Categories we must not overwrite with a duplicate-key upgrade. */
function isProtectedCategory(c: FriendlyErrorCategory): boolean {
  return (
    c === 'unknown_fragment' ||
    c === 'duplicate_key' ||
    c === 'engine_init'
  );
}

/**
 * After `mapError`, if the policy reuses the same pk placeholder name, upgrade the message.
 * Preserves `err.raw` (library string).
 */
export function upgradeErrorWithPreflight(
  policy: string,
  err: FriendlyError,
): FriendlyError {
  if (isProtectedCategory(err.category)) return err;

  const duplicateNames = findDuplicatePkPlaceholders(policy);
  if (duplicateNames.length === 0) return err;

  // Only upgrade low-confidence compiler failures (broad syntax/unknown), not semantic/timelock/etc.
  const upgradable: FriendlyErrorCategory[] = ['syntax', 'unknown'];
  if (!upgradable.includes(err.category)) return err;

  const friendly = friendlyDuplicate(duplicateNames);
  const hints = hintsDuplicate();
  return {
    ...err,
    category: 'duplicate_key',
    duplicateNames,
    friendly,
    hints,
  };
}
