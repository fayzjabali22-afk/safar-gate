import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // هذا السطر يسمح بجميع الصور من أي رابط خارجي
      },
    ],
  },
};

export default nextConfig;
