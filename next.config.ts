import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // لقد قمنا بإزالة السطر: output: 'export' للسماح للسيرفر بالعمل

  images: {
    // هذه الإعدادات تسمح بجلب الصور من مصادر خارجية
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'i.ibb.co' }
    ],
    // unoptimized: true, // يمكنك تفعيل هذا السطر إذا واجهت مشاكل في الصور لاحقاً
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
