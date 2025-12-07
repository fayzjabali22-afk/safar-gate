'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from './use-user-profile';

export function useAdmin() {
  const { profile, isLoading: isProfileLoading, user, isUserLoading: isAuthLoading } = useUserProfile();
  const router = useRouter();
  
  const isLoading = isAuthLoading || (user && isProfileLoading);

  useEffect(() => {
    // Do not make any decisions until all loading is complete.
    if (isLoading) {
      return;
    }

    // After loading, if there's no user, they must log in.
    if (!user) {
      router.replace('/admin/login');
      return;
    }

    // ** CRITICAL FIX **
    // After loading, if there IS a user AND their profile HAS loaded,
    // but their role is not admin/owner, THEN redirect.
    // This prevents the redirect from happening while `profile` is still null.
    if (profile) {
      const isAuthorized = profile.role === 'admin' || profile.role === 'owner';
      if (!isAuthorized) {
        router.replace('/dashboard'); // Redirect unauthorized users away.
      }
    }

  }, [user, profile, isLoading, router]);

  // The consuming layout should show a loading screen as long as this is true.
  const isAuthorized = !!(profile && (profile.role === 'admin' || profile.role === 'owner'));
  
  // Remain in loading state if the final authorization status is not yet determined.
  return { 
    isLoading: isLoading || (user && !profile), 
    isAdmin: isAuthorized
  };
}
