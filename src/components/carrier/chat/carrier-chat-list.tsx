'use client';

import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Chat, UserProfile } from '@/lib/data';
import { collection, query, where } from 'firebase/firestore';
import { CarrierChatListItem } from './carrier-chat-list-item';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareOff } from 'lucide-react';
import { useMemo } from 'react';

// --- MOCK DATA ---
const mockChats: Chat[] = [
    {
        id: 'chat_1',
        tripId: 'trip_123',
        participants: ['carrier_user_id', 'traveler_A'],
        lastMessage: 'أهلاً بك، هل يمكن تأكيد موعد الانطلاق؟',
        updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    },
    {
        id: 'chat_2',
        tripId: 'trip_456',
        participants: ['carrier_user_id', 'traveler_B'],
        lastMessage: 'تمام، سأكون في الانتظار عند نقطة التجمع.',
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
        id: 'chat_3',
        tripId: 'trip_789',
        participants: ['carrier_user_id', 'traveler_C'],
        lastMessage: 'شكراً جزيلاً لك.',
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    }
];

export const mockChatUsers: { [key: string]: UserProfile } = {
    'traveler_A': { id: 'traveler_A', firstName: 'أحمد', lastName: 'خالد', email: 'ahmad@email.com' },
    'traveler_B': { id: 'traveler_B', firstName: 'فاطمة', lastName: 'علي', email: 'fatima@email.com' },
    'traveler_C': { id: 'traveler_C', firstName: 'يوسف', lastName: 'محمد', email: 'yusuf@email.com' },
};
// --- END MOCK DATA ---


export function CarrierChatList() {
  const isLoading = false;
  const chats = mockChats;

  const sortedChats = useMemo(() => {
    if (!chats) return [];
    return [...chats].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [chats]);
  
  if (isLoading) {
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold px-2">المحادثات</h2>
             {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center p-2 space-x-4 rtl:space-x-reverse">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                </div>
            ))}
        </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col bg-card border-s" dir="rtl">
        <header className="p-4 border-b sticky top-0 bg-card z-10">
            <h2 className="text-xl font-bold">محادثاتي</h2>
        </header>
      <div className="flex-1 overflow-y-auto">
        {sortedChats && sortedChats.length > 0 ? (
          sortedChats.map(chat => <CarrierChatListItem key={chat.id} chat={chat} />)
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground h-full">
            <MessageSquareOff className="h-12 w-12 mb-4 text-muted-foreground/50"/>
            <p className="font-bold">لا توجد محادثات حتى الآن.</p>
            <p className="text-xs mt-1">عندما تبدأ محادثة مع مسافر، ستظهر هنا.</p>
          </div>
        )}
      </div>
    </div>
  );
}
