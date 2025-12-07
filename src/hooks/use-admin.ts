'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from './use-user-profile';

export function useAdmin() {
  const { profile, isLoading: isProfileLoading, user, isUserLoading: isAuthLoading } = useUserProfile();
  const router = useRouter();
  
  // This combined loading state is the key.
  // It's true if auth is loading OR if we have a user but are still waiting for their profile.
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

    // After loading, if there IS a user but their profile is not admin/owner, redirect.
    const isAuthorized = profile?.role === 'admin' || profile?.role === 'owner';
    if (!isAuthorized) {
      router.replace('/dashboard'); // Redirect unauthorized users away.
    }

  }, [user, profile, isLoading, router]);

  // The consuming layout should show a loading screen as long as this is true.
  // This prevents any premature rendering of the admin layout before the check is complete.
  const isAuthorized = profile?.role === 'admin' || profile?.role === 'owner';
  return { 
    isLoading: isLoading || (user && !isAuthorized), // Remain in loading state if user exists but is not yet (or ever) authorized
    isAdmin: isAuthorized
  };
}
