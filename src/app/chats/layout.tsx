'use client';

import { ChatList } from '@/components/chat-list';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { AppLayout } from '@/components/app-layout';

export default function ChatsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile, isLoading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
        <AppLayout>
            <div className="flex h-full items-center justify-center">
                <p>جاري التحميل...</p>
            </div>
        </AppLayout>
    )
  }

  return (
    <AppLayout>
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-[calc(100vh-120px)] md:h-[calc(100vh-120px)]">
            <aside className="hidden md:block h-full border-s overflow-y-auto">
                <ChatList />
            </aside>
            <main className="h-full bg-muted/30">
                {children}
            </main>
        </div>
    </AppLayout>
  );
}
