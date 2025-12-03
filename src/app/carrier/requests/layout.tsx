'use client';

import { ReactNode } from "react";

export default function CarrierRequestsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold">سوق الطلبات</h1>
                <p className="text-muted-foreground">
                    استعرض طلبات المسافرين المتاحة وقدم أفضل عروضك.
                </p>
            </header>
            <main>
                {children}
            </main>
        </div>
    )
}
