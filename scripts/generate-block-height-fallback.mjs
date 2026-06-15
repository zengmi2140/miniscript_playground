#!/usr/bin/env node
/**
 * Fetches current Bitcoin mainnet tip height and writes
 * src/lib/engine/block-height-fallback.generated.ts for use when live APIs fail.
 * Runs on `prebuild` so each production deploy bundles a recent fallback without manual edits.
 *
 * Failure handling (P2-03 half-fix):
 *   - If every endpoint fails, try to preserve the height already stored in the
 *     existing generated file so we never regress to an older STUB_ON_FAILURE.
 *   - If no existing height can be parsed, fall back to STUB_ON_FAILURE so local
 *     builds still succeed offline. In CI (`process.env.CI` truthy) this is treated
 *     as fatal and exits non-zero, since CI builds must not silently downgrade.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BLOCK_TIP_FETCH_OPTIONS,
  parseBlockHeightResponse,
  selectConsensusHeight,
} from '../src/lib/engine/block-height-consensus.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../src/lib/engine/block-height-fallback.generated.ts');

const ENDPOINTS = [
  'https://mempool.space/api/blocks/tip/height',
  'https://blockstream.info/api/blocks/tip/height',
  'https://blockchain.info/q/getblockcount',
];

const FETCH_TIMEOUT_MS = 5000;
/** Used only when every endpoint fails AND no previous generated height can be reused. */
const STUB_ON_FAILURE = 940000;

async function fetchHeight(url, referenceHeight) {
  const res = await fetch(url, {
    ...BLOCK_TIP_FETCH_OPTIONS,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const height = parseBlockHeightResponse(text, referenceHeight);
  if (height === null) throw new Error('Invalid response body');
  return height;
}

/**
 * Try to read the existing generated file and parse the FALLBACK_BLOCK_HEIGHT.
 * Returns the parsed positive integer, or null if the file is missing/unparseable.
 */
export function readExistingHeight(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const match = raw.match(/FALLBACK_BLOCK_HEIGHT\s*=\s*(\d+)/);
    if (!match) return null;
    return parseBlockHeightResponse(match[1]);
  } catch {
    return null;
  }
}

/**
 * When all endpoints fail, decide which height to write back. We prefer keeping the
 * previously generated value so offline/flaky builds never downgrade to a fixed stub
 * older than what the repo already shipped.
 */
export function resolveFallbackOnFailure({ existingHeight, stub }) {
  if (typeof existingHeight === 'number' && existingHeight > stub) {
    return { height: existingHeight, source: 'existing' };
  }
  return { height: stub, source: 'stub' };
}

/** CI builds must not silently downgrade or write missing fallback. */
export function shouldFailOnMissingFallback(env = process.env) {
  return Boolean(env.CI);
}

export function renderFallbackContent(height) {
  return (
    `/**\n` +
    ` * Auto-generated at build time by scripts/generate-block-height-fallback.mjs\n` +
    ` * (npm run generate:block-height-fallback, or prebuild before next build).\n` +
    ` * Do not edit by hand.\n` +
    ` */\n` +
    `export const FALLBACK_BLOCK_HEIGHT = ${height};\n`
  );
}

function writeFallback(filePath, height) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, renderFallbackContent(height), 'utf8');
}

async function main() {
  const existingHeight = readExistingHeight(OUT);
  const referenceHeight = existingHeight ?? STUB_ON_FAILURE;
  const settled = await Promise.allSettled(
    ENDPOINTS.map((url) => fetchHeight(url, referenceHeight)),
  );
  const heights = [];
  settled.forEach((result, index) => {
    const url = ENDPOINTS[index];
    if (result.status === 'fulfilled') {
      heights.push(result.value);
      console.log(`[generate-block-height-fallback] ${url} → ${result.value}`);
    } else {
      console.warn(
        `[generate-block-height-fallback] ${url} failed:`,
        result.reason instanceof Error ? result.reason.message : result.reason,
      );
    }
  });
  const consensusHeight = selectConsensusHeight(heights);

  if (consensusHeight !== null) {
    writeFallback(OUT, consensusHeight);
    return;
  }

  const { height: resolved, source } = resolveFallbackOnFailure({
    existingHeight,
    stub: STUB_ON_FAILURE,
  });

  if (source === 'existing') {
    console.warn(
      `[generate-block-height-fallback] All endpoints failed; preserving existing height ${resolved}`,
    );
    writeFallback(OUT, resolved);
    return;
  }

  if (shouldFailOnMissingFallback()) {
    console.error(
      `[generate-block-height-fallback] All endpoints failed and no existing fallback could be parsed (CI build, refusing to downgrade to stub ${STUB_ON_FAILURE})`,
    );
    process.exit(1);
  }

  console.warn(
    `[generate-block-height-fallback] All endpoints failed and no existing fallback found; writing stub ${STUB_ON_FAILURE}`,
  );
  writeFallback(OUT, resolved);
}

const isDirectRun = (() => {
  try {
    return process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  main().catch((err) => {
    console.error('[generate-block-height-fallback] fatal:', err);
    process.exit(1);
  });
}
