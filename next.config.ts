import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with only the server files and the dependencies
  // actually reached — keeps the Docker image small.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mannequincare.in",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
