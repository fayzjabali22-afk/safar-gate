'use client';
import { useUser, useFirestore, useDoc, useCollection, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';
import type { Chat, UserProfile, Trip } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, ArrowRight } from 'lucide-react';
import { MessageList } from '@/components/message-list';
import Link from 'next/link';

const cities: { [key: string]: string } = {
    damascus: 'دمشق', aleppo: 'حلب', homs: 'حمص',
    amman: 'عمّان', irbid: 'إربد', zarqa: 'الزرقاء',
    riyadh: 'الرياض', jeddah: 'جدة', dammam: 'الدمام',
    cairo: 'القاهرة', alexandria: 'الاسكندرية', giza: 'الجيزة',
};

const getCityName = (key: string) => cities[key] || key;


function ChatHeader({ chat }: { chat: Chat }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const travelerId = useMemo(() => {
    return chat.participants.find(p => p !== user?.uid);
  }, [chat, user]);

  const travelerRef = useMemo(() => {
    if (!firestore || !travelerId) return null;
    return doc(firestore, 'users', travelerId);
  }, [firestore, travelerId]);
  
  const tripRef = useMemo(() => {
      if(!firestore || !chat.tripId) return null;
      return doc(firestore, 'trips', chat.tripId);
  }, [firestore, chat.tripId]);

  const { data: traveler, isLoading: isLoadingTraveler } = useDoc<UserProfile>(travelerRef);
  const { data: trip, isLoading: isLoadingTrip } = useDoc<Trip>(tripRef);


  if (isLoadingTraveler || isLoadingTrip) {
    return (
      <div className="flex items-center space-x-4 rtl:space-x-reverse p-3 border-b bg-card">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
           <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 p-2 border-b bg-card" dir="rtl">
       <div className='flex items-center gap-3'>
         <Avatar className="h-10 w-10">
              <AvatarImage src={(traveler as any)?.photoURL} alt={traveler?.firstName || 'User'} />
              <AvatarFallback>{traveler?.firstName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm">{traveler?.firstName} {traveler?.lastName}</span>
            <span className="text-xs text-muted-foreground">متصل الآن</span>
          </div>
       </div>
       {trip && (
           <Link href={`/history#${trip.id}`} className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
               <span>رحلة {getCityName(trip.origin)}</span>
               <ArrowRight className="h-3 w-3"/>
               <span>{getCityName(trip.destination)}</span>
           </Link>
       )}
    </div>
  );
}


export default function CarrierChatWindowPage() {
  const { chatId } = useParams() as { chatId: string };
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  const chatRef = useMemo(() => {
    if (!firestore || !chatId) return null;
    return doc(firestore, 'chats', chatId);
  }, [firestore, chatId]);

  const { data: chat, isLoading: isChatLoading } = useDoc<Chat>(chatRef);

  const messagesQuery = useMemo(() => {
    if (!chatRef) return null;
    return query(collection(chatRef, 'messages'), orderBy('timestamp', 'asc'));
  }, [chatRef]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (!isChatLoading && chat && user && !chat.participants.includes(user.uid)) {
      router.push('/carrier/chats');
    }
  }, [chat, isChatLoading, user, router]);

  useEffect(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages])

  const handleSendMessage = async () => {
    if (!chatRef || !user || newMessage.trim() === '') return;
    
    const messageData = {
        senderId: user.uid,
        content: newMessage,
        timestamp: new Date().toISOString(),
    };
    
    // Non-blocking message add
    const messagesCollection = collection(chatRef, 'messages');
    addDocumentNonBlocking(messagesCollection, messageData);
    
    // Non-blocking chat document update
    const chatUpdateData = {
        lastMessage: newMessage,
        updatedAt: serverTimestamp(),
    }
    updateDoc(chatRef, chatUpdateData);

    setNewMessage('');
  };


  if (isChatLoading) {
    return <div className="flex h-full items-center justify-center">جاري تحميل المحادثة...</div>;
  }

  if (!chat) {
    return <div className="flex h-full items-center justify-center">لم يتم العثور على المحادثة</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background" dir="rtl">
        <ChatHeader chat={chat} />
        <div className="flex-1 overflow-y-auto">
            <MessageList messages={messages || []} isLoading={areMessagesLoading} />
            <div ref={messageEndRef} />
        </div>
        <div className="p-4 border-t bg-card">
            <div className="flex items-center gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1"
                    dir="auto"
                />
                <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" disabled>
                    <Paperclip className="h-5 w-5" />
                </Button>
            </div>
        </div>
    </div>
  );
}
