import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  CACHE_TTL_MS,
  FALLBACK_BLOCK_HEIGHT,
  fetchBlockTipHeight,
  resetBlockTipCacheForTests,
} from '../block-height';

describe('fetchBlockTipHeight', () => {
  const BASE_HEIGHT = FALLBACK_BLOCK_HEIGHT + 10;

  beforeEach(() => {
    resetBlockTipCacheForTests();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => String(BASE_HEIGHT),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetBlockTipCacheForTests();
  });

  it('returns a three-source consensus and uses privacy-minimizing options', async () => {
    await expect(fetchBlockTipHeight()).resolves.toBe(BASE_HEIGHT);
    expect(fetch).toHaveBeenCalledTimes(3);
    for (const [, options] of vi.mocked(fetch).mock.calls) {
      expect(options).toMatchObject({
        method: 'GET',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        cache: 'no-store',
      });
    }
  });

  it('uses cache within TTL and does not refetch', async () => {
    await fetchBlockTipHeight();
    await fetchBlockTipHeight();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('refetches after cache TTL', async () => {
    await fetchBlockTipHeight();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => String(BASE_HEIGHT + 1),
      }),
    );
    const then = Date.now() + CACHE_TTL_MS + 1;
    vi.spyOn(Date, 'now').mockReturnValueOnce(then);
    await expect(fetchBlockTipHeight()).resolves.toBe(BASE_HEIGHT + 1);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('uses two agreeing sources when one endpoint fails', async () => {
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
            text: async () => String(BASE_HEIGHT + 2),
          });
        }
        return Promise.resolve({
          ok: true,
          text: async () => String(BASE_HEIGHT + 1),
        });
      }),
    );
    await expect(fetchBlockTipHeight()).resolves.toBe(BASE_HEIGHT + 1);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('mempool.space');
    expect(vi.mocked(fetch).mock.calls[1][0]).toContain('blockstream.info');
  });

  it('ignores a single outlier and uses the agreeing pair', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) =>
        Promise.resolve({
          ok: true,
          text: async () =>
            url.includes('blockchain.info')
              ? String(BASE_HEIGHT + 5000)
              : String(BASE_HEIGHT),
        }),
      ),
    );
    await expect(fetchBlockTipHeight()).resolves.toBe(BASE_HEIGHT);
  });

  it('returns fallback when valid sources have no consensus', async () => {
    const heights = [BASE_HEIGHT, BASE_HEIGHT + 100, BASE_HEIGHT + 200];
    let index = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          text: async () => String(heights[index++]),
        }),
      ),
    );
    await expect(fetchBlockTipHeight()).resolves.toBe(FALLBACK_BLOCK_HEIGHT);
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
    const then = Date.now() + CACHE_TTL_MS + 1;
    vi.spyOn(Date, 'now').mockReturnValueOnce(then);
    await expect(fetchBlockTipHeight()).resolves.toBe(BASE_HEIGHT);
  });
});
