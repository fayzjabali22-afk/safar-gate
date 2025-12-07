
'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useUserProfile } from '@/firebase';
import { AppLayout } from '@/components/app-layout';
import { Ship } from 'lucide-react';

function LoadingScreen() {
    return (
        <AppLayout>
            <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4 text-center">
                <Ship className="h-16 w-16 animate-pulse text-primary" />
                <h1 className="text-xl font-bold text-muted-foreground">جاري تحديد وجهتك ...</h1>
                <p className="text-sm text-muted-foreground">يقوم النظام بالتحقق من حالة حسابك.</p>
            </div>
        </AppLayout>
    );
}

export default function SmartRedirectPage() {
    const router = useRouter();
    const { user, profile, isLoading } = useUserProfile();

    useEffect(() => {
        // Wait until the initial loading of user and profile is complete.
        if (isLoading) {
            return;
        }

        // If no user is logged in, redirect to the public dashboard.
        if (!user) {
            router.replace('/login');
            return;
        }

        // If the user has a specific role, redirect them to their respective dashboard.
        if (profile?.role === 'admin' || profile?.role === 'owner') {
            router.replace('/admin');
        } else if (profile?.role === 'carrier') {
            router.replace('/carrier');
        } else {
            // Default for travelers or users with no specific role set yet.
            router.replace('/dashboard');
        }

    }, [user, profile, isLoading, router]);

    // Render a loading screen while the redirection logic is processing.
    return <LoadingScreen />;
}
