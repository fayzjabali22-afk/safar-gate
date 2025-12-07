'use client';

import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import InstallPrompt from '@/components/install-prompt';
import { useEffect } from 'react';
import { GuideTrigger } from '@/components/ai/guide-trigger';
import { usePathname, useRouter } from 'next/navigation';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/') {
      router.replace('/landing');
    }
  }, [pathname, router]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('Service Worker registered:', registration.scope))
        .catch((error) => console.error('Service Worker registration failed:', error));
    }
  }, []);

  // If we are on the root path, we show nothing to prevent flicker during redirect.
  if (pathname === '/') {
    return null;
  }

  return (
    <FirebaseClientProvider>
      {children}
      <InstallPrompt />
      <GuideTrigger />
      <Toaster />
    </FirebaseClientProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <title>safaryat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="description" content="منصة safaryat لإدارة الرحلات والحجوزات بسهولة." />
        <meta name="theme-color" content="#321118" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}