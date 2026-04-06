// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { mapError, extractTokenFromRaw } from '../policy-errors';

describe('extractTokenFromRaw', () => {
  it('extracts word in single quotes', () => {
    expect(extractTokenFromRaw(`parse error: unknown fragment 'foo'`)).toBe('foo');
  });

  it('returns null for empty quoted fragment when pattern is only empty quotes', () => {
    expect(extractTokenFromRaw(`[compile error]`)).toBeNull();
  });
});

describe('mapError', () => {
  it('never puts empty token in unrecognized summary (zh/en)', () => {
    const err = mapError('[compile error]');
    expect(err.friendly.zh).not.toMatch(/无法识别[「']''[」']/);
    expect(err.friendly.zh).not.toMatch(/无法识别 ''/);
    expect(err.friendly.en.toLowerCase()).not.toContain("unrecognized ''");
    expect(err.category).toBe('syntax');
    expect(err.hints?.zh?.length).toBeGreaterThan(0);
  });

  it('uses token when present in parse error', () => {
    const err = mapError(`parse error: unknown fragment 'badfn'`);
    expect(err.friendly.zh).toContain('badfn');
    expect(err.category).toBe('unknown_fragment');
  });

  it('maps engine init', () => {
    const err = mapError('not ready yet');
    expect(err.category).toBe('engine_init');
  });

  it('maps bracket errors with hints', () => {
    const err = mapError('Unmatched parenthesis');
    expect(err.category).toBe('syntax');
    expect(err.hints?.en?.length).toBeGreaterThan(0);
  });

  it('maps library duplicate key phrasing to duplicate_key', () => {
    const err = mapError('duplicate key in policy: pk');
    expect(err.category).toBe('duplicate_key');
    expect(err.friendly.zh).toContain('重复');
  });

  it('maps generic fallback without embedding full raw in summary', () => {
    const long = 'X'.repeat(200);
    const err = mapError(long);
    expect(err.friendly.zh.length).toBeLessThan(400);
    expect(err.raw).toBe(long);
    expect(err.category).toBe('unknown');
  });
});
