/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;




