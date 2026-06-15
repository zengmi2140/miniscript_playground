export const MIN_REASONABLE_BLOCK_HEIGHT = 700_000;
export const MAX_REASONABLE_BLOCK_HEIGHT = 2_000_000;
export const MAX_REFERENCE_DRIFT_BLOCKS = 10_080;
export const CONSENSUS_TOLERANCE_BLOCKS = 2;

export function parseBlockHeightResponse(text, referenceHeight) {
  const normalized = text.trim();
  if (!/^\d+$/u.test(normalized)) return null;
  const height = Number(normalized);
  if (
    !Number.isSafeInteger(height) ||
    height < MIN_REASONABLE_BLOCK_HEIGHT ||
    height > MAX_REASONABLE_BLOCK_HEIGHT
  ) {
    return null;
  }
  if (
    Number.isSafeInteger(referenceHeight) &&
    Math.abs(height - referenceHeight) > MAX_REFERENCE_DRIFT_BLOCKS
  ) {
    return null;
  }
  return height;
}

export function selectConsensusHeight(
  heights,
  tolerance = CONSENSUS_TOLERANCE_BLOCKS,
) {
  const sorted = heights
    .filter((height) => Number.isSafeInteger(height))
    .sort((a, b) => a - b);
  let best = [];

  for (let start = 0; start < sorted.length; start++) {
    const cluster = [];
    for (let end = start; end < sorted.length; end++) {
      if (sorted[end] - sorted[start] > tolerance) break;
      cluster.push(sorted[end]);
    }
    if (cluster.length > best.length) best = cluster;
  }

  if (best.length < 2) return null;
  return best[Math.floor((best.length - 1) / 2)];
}

export const BLOCK_TIP_FETCH_OPTIONS = Object.freeze({
  method: 'GET',
  credentials: 'omit',
  referrerPolicy: 'no-referrer',
  cache: 'no-store',
});

