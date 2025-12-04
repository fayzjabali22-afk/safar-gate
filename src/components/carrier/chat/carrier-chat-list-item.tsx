'use client';

import { useUser } from '@/firebase';
import type { Chat, UserProfile } from '@/lib/data';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { mockChatUsers } from './carrier-chat-list';

export function CarrierChatListItem({ chat }: { chat: Chat }) {
  const { user } = useUser(); // Still useful to determine the "other" participant
  const pathname = usePathname();

  const travelerId = useMemo(() => {
    // This logic remains the same.
    const mockUserId = 'carrier_user_id';
    return chat.participants.find(p => p !== mockUserId);
  }, [chat.participants]);

  // SIMULATION: Directly use mock data instead of fetching from Firestore
  const travelerUser = travelerId ? mockChatUsers[travelerId] : null;
  const isLoading = false; // We are not loading from a hook anymore.

  if (isLoading) {
    return (
        <div className="flex items-center p-3 space-x-4 rtl:space-x-reverse border-b">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
            </div>
        </div>
    );
  }
  
  const isActive = pathname === `/carrier/chats/${chat.id}`;

  const formatLastMessageTime = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: arSA });
    } catch {
      return '';
    }
  };

  return (
    <Link href={`/carrier/chats/${chat.id}`}>
        <div className={cn(
            "flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/30",
            isActive && "bg-muted"
        )}>
            <Avatar className="h-10 w-10">
                <AvatarImage src={(travelerUser as any)?.photoURL} alt={travelerUser?.firstName || 'User'}/>
                <AvatarFallback>{travelerUser?.firstName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-bold truncate text-sm">{travelerUser?.firstName} {travelerUser?.lastName}</p>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">{formatLastMessageTime(chat.updatedAt)}</time>
                </div>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
            </div>
        </div>
    </Link>
  );
}
