// @ts-check
// Only validate environment in development and when explicitly enabled
if (!process.env.SKIP_ENV_VALIDATION && process.env.NODE_ENV !== 'production') {
  await import("./src/env.mjs");
  await import("@aeon/auth/env.mjs");
}

import { withNextDevtools } from "@next-devtools/core/plugin";
// import "@aeon/api/env"
import withMDX from "@next/mdx";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@aeon/api",
    "@aeon/auth",
    "@aeon/db",
    "@aeon/common",
    "@aeon/ui",
    "@aeon/stripe",
  ],
  pageExtensions: ["ts", "tsx", "mdx"],
  experimental: {
    mdxRs: true,
    // serverActions: true,
  },
  images: {
    domains: ["images.unsplash.com", "avatars.githubusercontent.com", "www.twillot.com", "cdnv2.ruguoapp.com", "www.setupyourpay.com"],
  },
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
};

export default withNextDevtools(withMDX()(config));
