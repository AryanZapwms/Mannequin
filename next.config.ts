import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mannequincare.in",
      },
      {
        protocol: "https",
        hostname: "qkbmccglvkhiidmvesqf.supabase.co",
      },
    ],
  },
};

export default nextConfig;
