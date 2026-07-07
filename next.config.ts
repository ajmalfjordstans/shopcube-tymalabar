import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://tymalabaronline.com/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
