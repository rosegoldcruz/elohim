/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
const nextConfig = {
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
      layers: false,
      topLevelAwait: false,
    };
    return config;
  },
};

export default nextConfig;
