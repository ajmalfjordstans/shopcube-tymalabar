import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/menu",
        destination: "https://order.tymalabar.co.uk/menu",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
