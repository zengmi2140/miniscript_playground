import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ledgerhq/ledger-bitcoin': path.resolve(
        __dirname,
        './src/lib/shims/ledger-bitcoin-stub.js',
      ),
    },
  },
  test: {
    testTimeout: 30000,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
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
});
