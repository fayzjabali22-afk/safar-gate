'use client';

import { useCollection, useDoc, useFirestore } from '@/firebase';
import type { Chat, UserProfile } from '@/lib/data';
import { collection, query, where, doc, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { useUserProfile } from '@/hooks/use-user-profile';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { MessageSquareOff } from 'lucide-react';


function ChatListItem({ chat }: { chat: Chat }) {
  const { user } = useUserProfile();
  const firestore = useFirestore();
  const pathname = usePathname();

  const otherParticipantId = useMemo(() => {
    if (!user) return null;
    return chat.participants.find(p => p !== user.uid);
  }, [chat.participants, user]);

  const otherUserRef = useMemo(() => {
    if (!firestore || !otherParticipantId) return null;
    return doc(firestore, 'users', otherParticipantId);
  }, [firestore, otherParticipantId]);

  const { data: otherUser, isLoading } = useDoc<UserProfile>(otherUserRef);

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
  
  const isActive = pathname === `/chats/${chat.id}`;
  const formatLastMessageTime = (timestamp: string | Date) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: arSA });
    } catch {
      return '';
    }
  };

  return (
    <Link href={`/chats/${chat.id}`}>
        <div className={cn(
            "flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/30",
            isActive && "bg-muted"
        )}>
            <Avatar className="h-10 w-10">
                <AvatarImage src={(otherUser as any)?.photoURL} alt={otherUser?.firstName || 'User'}/>
                <AvatarFallback>{otherUser?.firstName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-bold truncate text-sm">{otherUser?.firstName} {otherUser?.lastName}</p>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">{formatLastMessageTime(chat.updatedAt)}</time>
                </div>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
            </div>
        </div>
    </Link>
  );
}


export function ChatList() {
  const { user, profile, isLoading: isUserLoading } = useUserProfile();
  const firestore = useFirestore();

  const chatsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'chats'), 
        where('participants', 'array-contains', user.uid),
        orderBy('updatedAt', 'desc')
    );
  }, [firestore, user]);

  const { data: chats, isLoading: areChatsLoading } = useCollection<Chat>(chatsQuery);
  const isLoading = isUserLoading || areChatsLoading;
  
  if (isLoading) {
    return (
        <div className="p-4 space-y-4">
             {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center p-2 space-x-4 rtl:space-x-reverse">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                    </div>
                </div>
            ))}
        </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col bg-card border-s" dir="rtl">
        <header className="p-4 border-b sticky top-0 bg-card z-10">
            <h2 className="text-xl font-bold">المحادثات</h2>
        </header>
      <div className="flex-1 overflow-y-auto">
        {chats && chats.length > 0 ? (
          chats.map(chat => <ChatListItem key={chat.id} chat={chat} />)
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground h-full">
            <MessageSquareOff className="h-12 w-12 mb-4 text-muted-foreground/50"/>
            <p className="font-bold">لا توجد محادثات حتى الآن.</p>
            <p className="text-xs mt-1">عندما تبدأ محادثة، ستظهر هنا.</p>
          </div>
        )}
      </div>
    </div>
  );
}
