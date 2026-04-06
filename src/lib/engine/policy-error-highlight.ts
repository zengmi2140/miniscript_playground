import { extractTokenFromRaw } from './policy-errors';
import {
  findAllWordRanges,
  findDuplicatePkPlaceholders,
} from './policy-preflight';
import type { FriendlyError } from './types';

/** Matches library messages that indicate parenthesis problems (aligned with mapError). */
export function isParenRelatedRaw(raw: string): boolean {
  const lower = raw.toLowerCase();
  return (
    lower.includes('bracket') ||
    lower.includes('parenthes') ||
    lower.includes('unmatched')
  );
}

/**
 * Simple `(` / `)` scan; does not skip parentheses inside strings (acceptable limitation).
 * Extra `)`: highlight that character. Unclosed `(`: highlight the last unmatched `(`.
 */
export function findParenHighlight(
  policy: string,
): { from: number; to: number } | null {
  const stack: number[] = [];
  for (let i = 0; i < policy.length; i++) {
    const ch = policy[i];
    if (ch === '(') {
      stack.push(i);
    } else if (ch === ')') {
      if (stack.length === 0) {
        return { from: i, to: i + 1 };
      }
      stack.pop();
    }
  }
  if (stack.length > 0) {
    const last = stack[stack.length - 1]!;
    return { from: last, to: last + 1 };
  }
  return null;
}

function clampRange(
  from: number,
  to: number,
  len: number,
): { from: number; to: number } | null {
  const f = Math.max(0, Math.min(from, len));
  const t = Math.max(0, Math.min(to, len));
  if (f >= t) return null;
  return { from: f, to: t };
}

/** Clamp a stored highlight to current document length (UTF-16). */
export function clampHighlightToDoc(
  hl: { from: number; to: number } | undefined,
  docLen: number,
): { from: number; to: number } | null {
  if (!hl) return null;
  return clampRange(hl.from, hl.to, docLen);
}

/** Clamp every range; drop invalid after clamp. */
export function clampHighlightsToDoc(
  ranges: { from: number; to: number }[] | undefined,
  docLen: number,
): { from: number; to: number }[] {
  if (!ranges?.length) return [];
  const out: { from: number; to: number }[] = [];
  for (const r of ranges) {
    const c = clampRange(r.from, r.to, docLen);
    if (c) out.push(c);
  }
  return out;
}

function sortRanges(ranges: { from: number; to: number }[]): { from: number; to: number }[] {
  return [...ranges].sort((a, b) => a.from - b.from);
}

/** Single-range heuristic (unknown_fragment, paren syntax). */
export function computeErrorHighlight(
  policy: string,
  error: FriendlyError,
): { from: number; to: number } | null {
  const len = policy.length;

  if (error.category === 'unknown_fragment') {
    const token = extractTokenFromRaw(error.raw);
    if (!token) return null;
    const idx = policy.indexOf(token);
    if (idx < 0) return null;
    return clampRange(idx, idx + token.length, len);
  }

  if (error.category === 'syntax' && isParenRelatedRaw(error.raw)) {
    const r = findParenHighlight(policy);
    return r ? clampRange(r.from, r.to, len) : null;
  }

  return null;
}

/**
 * All highlight ranges for the policy. `duplicate_key` marks every occurrence of duplicate placeholder names.
 */
export function computeErrorHighlights(
  policy: string,
  error: FriendlyError,
): { from: number; to: number }[] {
  const len = policy.length;

  if (error.category === 'duplicate_key') {
    const names =
      error.duplicateNames && error.duplicateNames.length > 0
        ? error.duplicateNames
        : findDuplicatePkPlaceholders(policy);
    const ranges: { from: number; to: number }[] = [];
    for (const name of names) {
      for (const r of findAllWordRanges(policy, name)) {
        const c = clampRange(r.from, r.to, len);
        if (c) ranges.push(c);
      }
    }
    return sortRanges(ranges);
  }

  const one = computeErrorHighlight(policy, error);
  return one ? [one] : [];
}

export function attachErrorHighlight(
  policy: string,
  error: FriendlyError,
): FriendlyError {
  const highlights = computeErrorHighlights(policy, error);
  if (!highlights.length) return error;
  return {
    ...error,
    highlights,
    highlight: highlights[0],
  };
}
