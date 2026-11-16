import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.LOCAL_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/dashboard", permanent: false }];
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: apiBaseUrl ?? "",
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
