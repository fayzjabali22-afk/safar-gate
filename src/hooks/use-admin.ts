'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from './use-user-profile';

export function useAdmin() {
  const { profile, isLoading, user } = useUserProfile();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // If the main loading process (auth & profile) is finished...
    if (!isLoading) {
      // and if there's no user at all, redirect to login.
      if (!user) {
        router.replace('/login');
        return;
      }
      
      // Check for authorization.
      const authorized = profile?.role === 'admin' || profile?.role === 'owner';
      
      if (authorized) {
        // If authorized, confirm admin status. This will unblock the UI.
        setIsAdmin(true);
      } else {
        // If not authorized, redirect them away to the traveler dashboard.
        router.replace('/dashboard');
      }
    }
    // This effect depends on the final loading state and the resulting profile/user data.
  }, [profile, isLoading, user, router]);

  // The hook now signals loading until BOTH the initial data fetch is done
  // AND the admin status has been positively confirmed. This prevents the
  // layout from rendering and then immediately redirecting.
  return { 
    isLoading: isLoading || !isAdmin, 
    isAdmin 
  };
}
