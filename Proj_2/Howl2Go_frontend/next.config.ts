import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // Enable standalone build for Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
