import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    testTimeout: 30000,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
