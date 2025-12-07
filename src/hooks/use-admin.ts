
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from './use-user-profile';

export function useAdmin() {
  const { profile, isLoading: isProfileLoading, user, isUserLoading: isAuthLoading } = useUserProfile();
  const router = useRouter();

  // The overall loading state is true if auth is loading, or if auth is done but profile is still loading.
  const isLoading = isAuthLoading || (user && isProfileLoading);

  useEffect(() => {
    // 1. Do not make any decisions until all loading is complete.
    if (isLoading) {
      return;
    }

    // 2. After loading, if there's no user at all, they must log in to the admin portal.
    if (!user) {
      router.replace('/admin/login');
      return;
    }

    // 3. After loading, and we know there IS a user, we must check if we have their profile data.
    // If the profile doesn't exist, we can't authorize, so redirect away.
    if (!profile) {
      // This could happen if the user document is missing in Firestore.
      // Redirecting to the general dashboard is a safe fallback.
      router.replace('/dashboard');
      return;
    }
    
    // 4. ONLY NOW, after loading is done and we have a profile, we check authorization.
    const isAuthorized = profile.role === 'admin' || profile.role === 'owner';
    if (!isAuthorized) {
      router.replace('/dashboard'); // Redirect unauthorized users away.
    }
    
  }, [user, profile, isLoading, router]);

  // The consuming layout should show a loading screen as long as this is true.
  // This ensures we don't render the admin layout for a non-admin user even for a flash.
  return { 
    isLoading: isLoading, 
    isAdmin: !!(profile && (profile.role === 'admin' || profile.role === 'owner'))
  };
}
