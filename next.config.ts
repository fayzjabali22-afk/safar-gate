import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // هذه الإعدادات تسمح بجلب الصور من مصادر خارجية
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'i.ibb.co' }
    ],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
