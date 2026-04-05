import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@xyflow/react', '@xyflow/system'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // 见 src/lib/shims/ledger-bitcoin-stub.js — 不打入 Ledger SDK
      '@ledgerhq/ledger-bitcoin': path.join(
        __dirname,
        'src/lib/shims/ledger-bitcoin-stub.js',
      ),
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: false,
    };
    return config;
  },
};

export default nextConfig;
