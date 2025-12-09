import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
