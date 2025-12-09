'use client';

import { ReactNode } from "react";

export default function CarrierBookingsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="space-y-4 w-full">
            <header>
                <h1 className="text-xl md:text-2xl font-bold">طلبات الحجز الموجهة</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    إدارة جميع الطلبات الموجهة إليك، سواء كانت لرحلة جديدة أو لحجز مقاعد في رحلة قائمة.
                </p>
            </header>
            <main>
                {children}
            </main>
        </div>
    )
}
