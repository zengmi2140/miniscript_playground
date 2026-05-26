import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  readExistingHeight,
  resolveFallbackOnFailure,
  shouldFailOnMissingFallback,
  renderFallbackContent,
} from '../generate-block-height-fallback.mjs';

const STUB = 940000;

describe('readExistingHeight', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'block-height-fallback-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('parses FALLBACK_BLOCK_HEIGHT from a generated file', () => {
    const file = path.join(tmpDir, 'block-height-fallback.generated.ts');
    fs.writeFileSync(file, 'export const FALLBACK_BLOCK_HEIGHT = 945597;\n', 'utf8');
    expect(readExistingHeight(file)).toBe(945597);
  });

  it('returns null when the file does not exist', () => {
    const file = path.join(tmpDir, 'missing.generated.ts');
    expect(readExistingHeight(file)).toBeNull();
  });

  it('returns null when the file cannot be parsed', () => {
    const file = path.join(tmpDir, 'block-height-fallback.generated.ts');
    fs.writeFileSync(file, 'export const SOMETHING_ELSE = 1;\n', 'utf8');
    expect(readExistingHeight(file)).toBeNull();
  });

  it('returns null when the parsed height is not positive', () => {
    const file = path.join(tmpDir, 'block-height-fallback.generated.ts');
    fs.writeFileSync(file, 'export const FALLBACK_BLOCK_HEIGHT = 0;\n', 'utf8');
    expect(readExistingHeight(file)).toBeNull();
  });
});

describe('resolveFallbackOnFailure', () => {
  it('preserves existing height when it is greater than the stub', () => {
    const result = resolveFallbackOnFailure({ existingHeight: 945597, stub: STUB });
    expect(result).toEqual({ height: 945597, source: 'existing' });
  });

  it('falls back to stub when no existing height is available', () => {
    const result = resolveFallbackOnFailure({ existingHeight: null, stub: STUB });
    expect(result).toEqual({ height: STUB, source: 'stub' });
  });

  it('falls back to stub when existing height is not greater than stub', () => {
    const result = resolveFallbackOnFailure({ existingHeight: STUB, stub: STUB });
    expect(result).toEqual({ height: STUB, source: 'stub' });
  });

  it('falls back to stub when existing height is older than stub', () => {
    const result = resolveFallbackOnFailure({ existingHeight: STUB - 1, stub: STUB });
    expect(result).toEqual({ height: STUB, source: 'stub' });
  });
});

describe('shouldFailOnMissingFallback', () => {
  it('returns true when CI is truthy', () => {
    expect(shouldFailOnMissingFallback({ CI: '1' })).toBe(true);
    expect(shouldFailOnMissingFallback({ CI: 'true' })).toBe(true);
  });

  it('returns false when CI is unset or empty', () => {
    expect(shouldFailOnMissingFallback({})).toBe(false);
    expect(shouldFailOnMissingFallback({ CI: '' })).toBe(false);
  });
});

describe('integration: failure resolution', () => {
  let tmpDir;
  let file;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'block-height-fallback-'));
    file = path.join(tmpDir, 'block-height-fallback.generated.ts');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('keeps the previously generated height when all fetches fail and existing height > stub', () => {
    fs.writeFileSync(file, renderFallbackContent(945597), 'utf8');
    const existingHeight = readExistingHeight(file);
    const { height, source } = resolveFallbackOnFailure({ existingHeight, stub: STUB });
    expect(height).toBe(945597);
    expect(source).toBe('existing');
  });

  it('flags missing fallback as fatal under CI', () => {
    const existingHeight = readExistingHeight(file);
    expect(existingHeight).toBeNull();
    expect(shouldFailOnMissingFallback({ CI: '1' })).toBe(true);
  });

  it('writes the stub when no existing fallback is found and CI is unset', () => {
    const existingHeight = readExistingHeight(file);
    expect(existingHeight).toBeNull();
    expect(shouldFailOnMissingFallback({})).toBe(false);
    const { height, source } = resolveFallbackOnFailure({ existingHeight, stub: STUB });
    expect(height).toBe(STUB);
    expect(source).toBe('stub');
  });
});
