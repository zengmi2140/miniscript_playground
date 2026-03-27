/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@xyflow/react', '@xyflow/system'],
  webpack: (config) => {
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
