'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { AppLayout } from '@/components/app-layout';
import { Ship } from 'lucide-react';

export default function SmartRedirectPage() {
  const router = useRouter();
  const { profile, isLoading } = useUserProfile();

  useEffect(() => {
    // We don't do anything until the loading is complete
    if (!isLoading) {
      if (profile?.role === 'admin' || profile?.role === 'owner') {
        router.replace('/admin');
      } else if (profile?.role === 'carrier') {
        router.replace('/carrier');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [profile, isLoading, router]);

  // Render a simple loading state to avoid flashes of content
  return (
    <AppLayout>
        <div className="flex h-[calc(100vh-200px)] w-full flex-col items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-center">
                <Ship className="h-20 w-20 text-primary animate-pulse" />
                <h1 className="text-2xl font-bold text-white/90">جاري تحديد وجهتك...</h1>
                <p className="text-sm text-white/60">
                    الرجاء الانتظار قليلاً.
                </p>
            </div>
        </div>
    </AppLayout>
  );
}
