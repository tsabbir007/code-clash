import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Dangerously allows production builds to complete with ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true, // Dangerously allows production builds to complete with TypeScript errors
  },
};

export default nextConfig;
