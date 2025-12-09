'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Ship } from 'lucide-react';

function LoadingScreen() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center bg-background">
            <Ship className="h-16 w-16 animate-pulse text-primary" />
            <h1 className="text-xl font-bold text-muted-foreground">جاري التحقق من الهوية...</h1>
            <p className="text-sm text-muted-foreground">الرجاء الانتظار.</p>
        </div>
    );
}

export default function SmartRedirectPage() {
    const router = useRouter();
    const { user, profile, isLoading } = useUserProfile();

    useEffect(() => {
        // The Patience Protocol: Make no decision until loading is fully complete.
        if (isLoading) {
            return;
        }

        // The Security Protocol: If there is no registered user, they are redirected to the entrance gate.
        if (!user) {
            router.replace('/login');
            return;
        }
        
        // The Strict Layered Routing Protocol (Final Version)
        // The highest priority for the owner and admin. This condition is decided first.
        if (profile?.role === 'admin' || profile?.role === 'owner') {
            router.replace('/admin');
        } 
        // If not an admin, check their role as a carrier.
        else if (profile?.role === 'carrier') {
            router.replace('/carrier');
        } 
        // If none of the above, they are a traveler.
        else {
            router.replace('/dashboard');
        }
        
    }, [user, profile, isLoading, router]);

    // Always display the loading screen until the correct and sole routing decision is made.
    return <LoadingScreen />;
}
