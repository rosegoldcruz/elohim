/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  experimental: {
    // layers: true, ← ❌ Removed: not valid in Next.js 15.2.4
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack(config) {
    // TEMP FIX: Prevent crashing on ConsumeSharedPluginOptions / WebAssembly bug
    config.experiments = {
      ...config.experiments,
      syncWebAssembly: false,
      asyncWebAssembly: false,
      topLevelAwait: false,
    };
    return config;
  },
};

export default nextConfig;
