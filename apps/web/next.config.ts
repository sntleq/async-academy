import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  async redirects() {
    return [
      {
        source: "/javascript",
        destination: "/js",
        permanent: true,
      },
      {
        source: "/lessons/:path*",
        destination: "/js/lessons/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
