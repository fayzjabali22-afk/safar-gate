'use client';

import { ReactNode } from "react";
import { CarrierChatList } from "@/components/carrier/chat/carrier-chat-list";

export default function CarrierChatsLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-128px)]" dir="rtl">
        <aside className="hidden md:block h-full border-s overflow-y-auto">
            <CarrierChatList />
        </aside>
        <main className="h-full bg-muted/30">
            {children}
        </main>
    </div>
  );
}
