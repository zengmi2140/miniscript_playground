const MEMPOOL_API = 'https://mempool.space/api/blocks/tip/height';
/** Public API block tip cache duration (used by UI copy and tests). */
export const CACHE_TTL_MS = 5 * 60 * 1000;
export const CACHE_TTL_MINUTES = 5;
const DEFAULT_HEIGHT = 840000;

let cachedHeight: number | null = null;
let cachedAt = 0;

/** Clears in-memory cache (for unit tests). */
export function resetBlockTipCacheForTests(): void {
  cachedHeight = null;
  cachedAt = 0;
}

/**
 * Fetch the current Bitcoin block tip height from mempool.space.
 * Caches for 5 minutes; returns a fallback default on failure.
 */
export async function fetchBlockTipHeight(): Promise<number> {
  const now = Date.now();
  if (cachedHeight !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedHeight;
  }

  try {
    const res = await fetch(MEMPOOL_API, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const height = parseInt(text, 10);
    if (isNaN(height)) throw new Error('Invalid response');
    cachedHeight = height;
    cachedAt = now;
    return height;
  } catch {
    return cachedHeight ?? DEFAULT_HEIGHT;
  }
}

export const FALLBACK_BLOCK_HEIGHT = DEFAULT_HEIGHT;
