'use client';

import { useUserProfile } from '@/hooks/use-user-profile';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatList } from '@/components/chat-list';
import { MessageSquareDashed } from 'lucide-react';

export default function ChatsPage() {
  const isMobile = useIsMobile();
  const { profile, isLoading } = useUserProfile();
  
  if (isLoading) {
      return (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center" dir="rtl">
              <p>جاري تحميل المحادثات...</p>
          </div>
      )
  }

  // On mobile, show the list. On desktop, show the placeholder.
  if (isMobile) {
      return <ChatList />;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background/20 p-8 text-center" dir="rtl">
      <MessageSquareDashed className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h2 className="text-xl font-bold text-foreground">مركز المحادثات</h2>
      <p className="text-muted-foreground">
        اختر محادثة من القائمة لعرض الرسائل والرد عليها.
      </p>
    </div>
  );
}
