'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from './use-user-profile';

export function useAdmin() {
  const { profile, isLoading, user } = useUserProfile();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // If loading is finished and we have profile/user data
    if (!isLoading) {
      // If there's no user at all, they are not an admin.
      if (!user) {
        router.replace('/login');
        return;
      }
      
      const authorized = profile?.role === 'admin' || profile?.role === 'owner';
      
      if (authorized) {
        setIsAdmin(true);
      } else {
        // If not authorized, redirect them away.
        router.replace('/dashboard');
      }
    }
  }, [profile, isLoading, user, router]);

  return { 
    isLoading: isLoading || !isAdmin, // Remain in loading state until admin status is confirmed
    isAdmin 
  };
}
