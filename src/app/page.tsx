'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // FIX: Added missing import
import { useUserProfile } from '@/hooks/use-user-profile'; // FIX: Correct path
import { AppLayout } from '@/components/app-layout';
import { Ship } from 'lucide-react';

function LoadingScreen() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center bg-background">
            <Ship className="h-16 w-16 animate-pulse text-primary" />
            <h1 className="text-xl font-bold text-muted-foreground">جاري تحديد وجهتك ...</h1>
            <p className="text-sm text-muted-foreground">يقوم النظام بالتحقق من صلاحيات حسابك.</p>
        </div>
    );
}

export default function SmartRedirectPage() {
    const router = useRouter();
    const { user, profile, isLoading } = useUserProfile();

    useEffect(() => {
        // Wait for loading to finish
        if (isLoading) return;

        // 1. No User -> Go to Login
        if (!user) {
            router.replace('/login');
            return;
        }

        // 2. Routing based on Role
        if (profile?.role === 'admin' || profile?.role === 'owner') {
            router.replace('/admin'); // The fix for you
        } else if (profile?.role === 'carrier') {
            router.replace('/carrier');
        } else {
            // Default for travelers
            router.replace('/history'); 
        }
    }, [user, profile, isLoading, router]);

    // Always show loading screen while deciding
    return <LoadingScreen />;
}
