'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useCollection, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import type { Message } from '@/lib/data';
import { MessageList } from './message-list';
import { Loader2, Send } from 'lucide-react';

interface ChatDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  bookingId: string;
  otherPartyName: string;
}

export function ChatDialog({ isOpen, onOpenChange, bookingId, otherPartyName }: ChatDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemo(() => {
    if (!firestore || !bookingId) return null;
    return query(
      collection(firestore, 'chats', bookingId, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [firestore, bookingId]);

  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if(isOpen) {
        setTimeout(() => scrollToBottom(), 100);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async () => {
    if (!firestore || !user || !newMessage.trim()) return;

    const messagesCollection = collection(firestore, 'chats', bookingId, 'messages');
    const chatDocRef = doc(firestore, 'chats', bookingId);
    
    const messageData = {
      content: newMessage,
      senderId: user.uid,
      timestamp: serverTimestamp(),
    };
    
    addDocumentNonBlocking(messagesCollection, messageData);
    
    updateDoc(chatDocRef, {
        lastMessage: newMessage,
        updatedAt: serverTimestamp(),
        participants: arrayUnion(user.uid) 
    }).catch(() => {
      setDoc(chatDocRef, {
          id: bookingId,
          participants: [user.uid],
          lastMessage: newMessage,
          updatedAt: serverTimestamp(),
      }, { merge: true });
    });

    setNewMessage('');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[70vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>محادثة مع {otherPartyName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages || []} isLoading={isLoading} />
          <div ref={messagesEndRef} />
        </div>
        
        <DialogFooter className="p-4 border-t bg-background">
          <div className="flex w-full items-center space-x-2 rtl:space-x-reverse">
            <Input
              id="message-input"
              placeholder="اكتب رسالتك هنا..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">إرسال</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
