import { extractTokenFromRaw } from './policy-errors';
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

export function attachErrorHighlight(
  policy: string,
  error: FriendlyError,
): FriendlyError {
  const highlight = computeErrorHighlight(policy, error);
  if (!highlight) return error;
  return { ...error, highlight };
}
