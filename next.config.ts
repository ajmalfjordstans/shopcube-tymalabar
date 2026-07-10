import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/menu",
        destination: "https://tymalabaronline.com/menu",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
