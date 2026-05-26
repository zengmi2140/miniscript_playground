/**
 * Token-aware identifier rewriting for Policy / Miniscript text.
 *
 * Why this exists (P1-03 in CODE_REVIEW_REPORT.md):
 * Naive `replaceAll(name, replacement)` corrupts overlapping identifiers
 * (e.g. `A` vs `Alice`, `Key1` vs `Key10`) and reserved fragment names
 * (e.g. a key named `or` would damage `or_b` / `or_i`). All policy /
 * miniscript identifiers are word-character runs, so rewriting at word
 * boundaries (`\b`) is safe.
 */

/** Escape regex meta characters in an identifier so we can build a RegExp from it. */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace every occurrence of `name` (as a whole identifier token) in `input`
 * with `replacement`. `\b` matches between word and non-word chars where
 * word chars are `[A-Za-z0-9_]`, so this never splits identifiers like
 * `or_b` or `Key10`.
 */
export function replaceIdentifierToken(
  input: string,
  name: string,
  replacement: string,
): string {
  if (!name) return input;
  const re = new RegExp(`\\b${escapeRegex(name)}\\b`, 'g');
  return input.replace(re, replacement);
}

/**
 * Replace many identifier tokens at once. Sorted by source-name length desc
 * so a longer name wins over a shorter prefix when both could match the
 * same span (defensive — `\b` already prevents prefix collisions).
 */
export function replaceManyIdentifierTokens(
  input: string,
  pairs: Array<{ from: string; to: string }>,
): string {
  if (pairs.length === 0) return input;
  const sorted = [...pairs].sort((a, b) => b.from.length - a.from.length);
  let out = input;
  for (const p of sorted) {
    out = replaceIdentifierToken(out, p.from, p.to);
  }
  return out;
}

/**
 * Policy / miniscript role identifiers must be ASCII identifiers.
 * Used by share / session validation and (in future) the rename UX.
 */
const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function isValidPolicyIdentifier(s: string): boolean {
  return typeof s === 'string' && IDENTIFIER_RE.test(s);
}
