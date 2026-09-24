import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/for-you",
          destination: "/dashboard",
        },
        {
          source: "/book/:id",
          destination: "/book", // Points to an internal dynamic renderer folder
        },
      ],
    };
  },
};

export default nextConfig;
