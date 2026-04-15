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

  it('tries the next endpoint when the first fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('mempool.space')) {
          return Promise.resolve({
            ok: false,
            status: 503,
            text: async () => '',
          });
        }
        if (url.includes('blockstream.info')) {
          return Promise.resolve({
            ok: true,
            text: async () => '900002',
          });
        }
        return Promise.resolve({
          ok: false,
          status: 500,
          text: async () => '',
        });
      }),
    );
    await expect(fetchBlockTipHeight()).resolves.toBe(900002);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('mempool.space');
    expect(vi.mocked(fetch).mock.calls[1][0]).toContain('blockstream.info');
  });

  it('returns fallback when all endpoints fail and no cache', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => '',
      }),
    );
    await expect(fetchBlockTipHeight()).resolves.toBe(FALLBACK_BLOCK_HEIGHT);
    expect(fetch).toHaveBeenCalledTimes(3);
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
    expect(fetch).toHaveBeenCalledTimes(3);
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
