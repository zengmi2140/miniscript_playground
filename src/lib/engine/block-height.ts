/** Ordered list; not exported (order is implementation detail). */
const BLOCK_TIP_ENDPOINTS = [
  'https://mempool.space/api/blocks/tip/height',
  'https://blockstream.info/api/blocks/tip/height',
  'https://blockchain.info/q/getblockcount',
] as const;

const FETCH_TIMEOUT_MS = 5000;

/** Public API block tip cache duration (used by UI copy and tests). */
export const CACHE_TTL_MS = 5 * 60 * 1000;
export const CACHE_TTL_MINUTES = 5;
/** Used when all endpoints fail and there is no cached successful value. Manually maintained. */
export const FALLBACK_BLOCK_HEIGHT = 940000;

let cachedHeight: number | null = null;
let cachedAt = 0;

/** Clears in-memory cache (for unit tests). */
export function resetBlockTipCacheForTests(): void {
  cachedHeight = null;
  cachedAt = 0;
}

async function fetchHeightFromEndpoint(url: string): Promise<number> {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const height = parseInt(text.trim(), 10);
  if (Number.isNaN(height) || height <= 0) throw new Error('Invalid response');
  return height;
}

/**
 * Fetch the current Bitcoin mainnet block tip height from public APIs (sequential fallback).
 * Caches for 5 minutes; returns {@link FALLBACK_BLOCK_HEIGHT} when all sources fail and there is no cache.
 */
export async function fetchBlockTipHeight(): Promise<number> {
  const now = Date.now();
  if (cachedHeight !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedHeight;
  }

  for (const url of BLOCK_TIP_ENDPOINTS) {
    try {
      const height = await fetchHeightFromEndpoint(url);
      cachedHeight = height;
      cachedAt = now;
      return height;
    } catch {
      // try next endpoint
    }
  }

  return cachedHeight ?? FALLBACK_BLOCK_HEIGHT;
}
