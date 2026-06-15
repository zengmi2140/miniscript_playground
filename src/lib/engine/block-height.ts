import { FALLBACK_BLOCK_HEIGHT } from './block-height-fallback.generated';
import {
  BLOCK_TIP_FETCH_OPTIONS,
  parseBlockHeightResponse,
  selectConsensusHeight,
} from './block-height-consensus.mjs';

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

/** Re-export: value lives in `block-height-fallback.generated.ts` (refreshed on each `next build`). */
export { FALLBACK_BLOCK_HEIGHT };

let cachedHeight: number | null = null;
let cachedAt = 0;

/** Clears in-memory cache (for unit tests). */
export function resetBlockTipCacheForTests(): void {
  cachedHeight = null;
  cachedAt = 0;
}

async function fetchHeightFromEndpoint(url: string): Promise<number> {
  const res = await fetch(url, {
    ...BLOCK_TIP_FETCH_OPTIONS,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const height = parseBlockHeightResponse(
    text,
    cachedHeight ?? FALLBACK_BLOCK_HEIGHT,
  );
  if (height === null) throw new Error('Invalid response');
  return height;
}

/**
 * Fetch the current Bitcoin mainnet block tip height from public APIs in parallel.
 * Accepts only a 2-source consensus, caches it for 5 minutes, and returns the
 * previous trusted cache or build-time fallback when no consensus is available.
 */
export async function fetchBlockTipHeight(): Promise<number> {
  const now = Date.now();
  if (cachedHeight !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedHeight;
  }

  const settled = await Promise.allSettled(
    BLOCK_TIP_ENDPOINTS.map((url) => fetchHeightFromEndpoint(url)),
  );
  const heights = settled.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  );
  const consensusHeight = selectConsensusHeight(heights);
  if (consensusHeight !== null) {
    cachedHeight = consensusHeight;
    cachedAt = now;
    return consensusHeight;
  }

  return cachedHeight ?? FALLBACK_BLOCK_HEIGHT;
}
