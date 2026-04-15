import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  CACHE_TTL_MS,
  FALLBACK_BLOCK_HEIGHT,
  fetchBlockTipHeight,
  resetBlockTipCacheForTests,
} from '../block-height';

describe('fetchBlockTipHeight', () => {
  beforeEach(() => {
    resetBlockTipCacheForTests();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '900000',
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetBlockTipCacheForTests();
  });

  it('returns parsed height on success', async () => {
    await expect(fetchBlockTipHeight()).resolves.toBe(900000);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('uses cache within TTL and does not refetch', async () => {
    await fetchBlockTipHeight();
    await fetchBlockTipHeight();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('refetches after cache TTL', async () => {
    await fetchBlockTipHeight();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '900001',
      }),
    );
    const then = Date.now() + CACHE_TTL_MS + 1;
    vi.spyOn(Date, 'now').mockReturnValueOnce(then);
    await expect(fetchBlockTipHeight()).resolves.toBe(900001);
    expect(fetch).toHaveBeenCalled();
  });

  it('returns fallback on HTTP error when no cache', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => '',
      }),
    );
    await expect(fetchBlockTipHeight()).resolves.toBe(FALLBACK_BLOCK_HEIGHT);
  });

  it('returns fallback on invalid body when no cache', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => 'not-a-number',
      }),
    );
    await expect(fetchBlockTipHeight()).resolves.toBe(FALLBACK_BLOCK_HEIGHT);
  });

  it('returns last successful height on error when cache exists', async () => {
    await fetchBlockTipHeight();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network')),
    );
    await expect(fetchBlockTipHeight()).resolves.toBe(900000);
  });
});
