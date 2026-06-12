import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  formatDocHealthReport,
  runDocHealth,
} from '../check-doc-health.mjs';

function write(root, rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function createValidFixture(root) {
  write(root, '.nvmrc', '22\n');
  write(
    root,
    'package.json',
    JSON.stringify({
      engines: { node: '>=22 <23' },
      scripts: {
        prebuild: 'npm run generate:block-height-fallback',
        build: 'next build',
        'build:check': 'next build',
        'test:coverage': 'vitest run --coverage',
      },
    }),
  );
  write(
    root,
    'package-lock.json',
    JSON.stringify({
      packages: {
        '': { engines: { node: '>=22 <23' } },
      },
    }),
  );
  write(
    root,
    '.github/workflows/ci.yml',
    `steps:
  - uses: actions/setup-node@v4
    with:
      node-version-file: .nvmrc
  - run: npm run doc:health
  - run: npm run lint
  - run: npm run typecheck
  - run: npm run test:coverage
  - run: npm run build:check
`,
  );
  write(
    root,
    'vitest.config.ts',
    `export default {
  test: {
    coverage: {
      thresholds: {
        'src/lib/engine/**': {
          lines: 70,
          functions: 70,
        },
        'src/lib/builder/**': {
          lines: 70,
          functions: 70,
        },
        'src/lib/playground/**': {
          lines: 70,
          functions: 70,
        },
      },
    },
  },
};
`,
  );
  write(
    root,
    'AGENTS.md',
    'Coverage: `src/lib/engine/**`, `src/lib/builder/**`, `src/lib/playground/**` 70%. Use `build:check`; formal build runs `prebuild`.\n',
  );
  write(
    root,
    'README.md',
    'Use Node 22. Run `nvm use` before installing dependencies.\n',
  );
  write(
    root,
    'docs/ARCHITECTURE.md',
    'Use Node 22 and `nvm use`. Coverage: `src/lib/engine/**`, `src/lib/builder/**`, `src/lib/playground/**` 70%. CI uses `build:check`; deployment runs `prebuild`.\n',
  );
  write(
    root,
    'docs/PRODUCT.md',
    `# Product

## 路由与信息架构

| 路由 | 用途 |
|---|---|
| \`/\` | Home |
| \`/playground\` | Playground |
| \`/playground?mode=build\` | Build mode |

## Other
`,
  );
  write(root, 'src/app/page.tsx', 'export default function Page() { return null; }\n');
  write(
    root,
    'src/app/playground/page.tsx',
    'export default function Page() { return null; }\n',
  );
  write(
    root,
    'src/lib/i18n/zh.ts',
    `export const zh = {
  home: {
    title: "标题",
  },
} as const;
`,
  );
  write(
    root,
    'src/lib/i18n/en.ts',
    `export const en = {
  home: {
    title: "Title",
  },
} as const;
`,
  );
  write(
    root,
    'src/lib/engine/block-height.ts',
    'export async function tip(url) { return fetch(url, { signal: AbortSignal.timeout(1) }); }\n',
  );
  write(
    root,
    'scripts/generate-block-height-fallback.mjs',
    'export async function tip(url) { return fetch(url); }\n',
  );
}

describe('runDocHealth Harness contracts', () => {
  let root;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-health-'));
    createValidFixture(root);
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('accepts a fixture whose routes, i18n, network and config contracts align', () => {
    expect(runDocHealth(root)).toEqual([]);
  });

  it('reports a route present in App Router but missing from PRODUCT', () => {
    write(
      root,
      'docs/PRODUCT.md',
      `# Product

## 路由与信息架构

| 路由 | 用途 |
|---|---|
| \`/\` | Home |

## Other
`,
    );

    expect(runDocHealth(root)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'route',
          detail: expect.stringContaining('/playground'),
        }),
      ]),
    );
  });

  it('reports missing or extra i18n keys', () => {
    write(
      root,
      'src/lib/i18n/en.ts',
      `export const en = {
  home: {
    subtitle: "Subtitle",
  },
} as const;
`,
    );

    const problems = runDocHealth(root).filter((problem) => problem.kind === 'i18n');
    expect(problems).toHaveLength(2);
    expect(problems.map((problem) => problem.detail)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('home.title'),
        expect.stringContaining('home.subtitle'),
      ]),
    );
  });

  it('reports unauthorized fetch and write-capable transport APIs', () => {
    write(
      root,
      'src/lib/analytics.ts',
      `fetch("https://example.com/collect", { method: "POST" });
navigator.sendBeacon("/collect", "payload");
`,
    );

    const problems = runDocHealth(root).filter((problem) => problem.kind === 'network');
    expect(problems).toHaveLength(2);
    expect(problems.map((problem) => problem.detail)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('fetch'),
        expect.stringContaining('sendBeacon'),
      ]),
    );
  });

  it('reports Node and CI configuration drift', () => {
    write(root, '.nvmrc', '20\n');
    write(
      root,
      '.github/workflows/ci.yml',
      `steps:
  - uses: actions/setup-node@v4
    with:
      node-version: 22
`,
    );

    const problems = runDocHealth(root).filter((problem) => problem.kind === 'config');
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ file: '.nvmrc' }),
        expect.objectContaining({
          file: '.github/workflows/ci.yml',
          detail: expect.stringContaining('node-version-file'),
        }),
      ]),
    );
  });

  it('formats failures by category', () => {
    const report = formatDocHealthReport([
      { kind: 'route', file: 'docs/PRODUCT.md', detail: 'missing /new' },
      { kind: 'network', file: 'src/lib/leak.ts', detail: 'fetch not allowed' },
    ]);

    expect(report).toContain('[路由事实不一致]');
    expect(report).toContain('[网络数据外发违规]');
  });
});
