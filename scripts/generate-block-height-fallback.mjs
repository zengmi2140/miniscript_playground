#!/usr/bin/env node
/**
 * Fetches current Bitcoin mainnet tip height and writes
 * src/lib/engine/block-height-fallback.generated.ts for use when live APIs fail.
 * Runs on `prebuild` so each production deploy bundles a recent fallback without manual edits.
 * On total failure, writes STUB_ON_FAILURE so the build still completes (e.g. offline CI).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../src/lib/engine/block-height-fallback.generated.ts');

const ENDPOINTS = [
  'https://mempool.space/api/blocks/tip/height',
  'https://blockstream.info/api/blocks/tip/height',
  'https://blockchain.info/q/getblockcount',
];

const FETCH_TIMEOUT_MS = 5000;
/** Used only when every endpoint fails (offline build, outage, etc.). */
const STUB_ON_FAILURE = 940000;

async function fetchHeight(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const height = parseInt(text.trim(), 10);
  if (Number.isNaN(height) || height <= 0) throw new Error('Invalid response body');
  return height;
}

async function main() {
  let height = STUB_ON_FAILURE;
  let ok = false;
  for (const url of ENDPOINTS) {
    try {
      height = await fetchHeight(url);
      console.log(`[generate-block-height-fallback] ${url} → ${height}`);
      ok = true;
      break;
    } catch (e) {
      console.warn(
        `[generate-block-height-fallback] ${url} failed:`,
        e instanceof Error ? e.message : e,
      );
    }
  }
  if (!ok) {
    console.warn(
      `[generate-block-height-fallback] All endpoints failed; writing stub ${STUB_ON_FAILURE}`,
    );
  }

  const content =
    `/**\n` +
    ` * Auto-generated at build time by scripts/generate-block-height-fallback.mjs\n` +
    ` * (npm run generate:block-height-fallback, or prebuild before next build).\n` +
    ` * Do not edit by hand.\n` +
    ` */\n` +
    `export const FALLBACK_BLOCK_HEIGHT = ${height};\n`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, content, 'utf8');
}

main().catch((err) => {
  console.error('[generate-block-height-fallback] fatal:', err);
  process.exit(1);
});
