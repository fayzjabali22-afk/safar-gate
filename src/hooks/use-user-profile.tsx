'use client';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/data';
import { useMemo } from 'react';

/**
 * Hook to get the full user profile data from Firestore.
 * It combines the auth user from `useUser` with their corresponding
 * document in the 'users' collection.
 *
 * @returns An object containing the auth user, the Firestore profile, and the combined loading state.
 */
export function useUserProfile() {
  const { user, isUserLoading: isAuthLoading, userError } = useUser();
  const firestore = useFirestore();

  // Memoize the DocumentReference to prevent re-renders.
  const userProfileRef = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useDoc<UserProfile>(userProfileRef);

  // The overall loading state is true if either the auth state or the profile fetch is in progress.
  const isLoading = isAuthLoading || isProfileLoading;
  
  // CRITICAL FIX:
  // If authentication is still loading, or if the user has just logged in but their profile
  // hasn't been fetched yet, we must return a loading state with null data.
  // This prevents downstream hooks (like useAdmin) from acting on stale data (e.g., a null profile
  // for a user who is actually an admin).
  const profile = isLoading ? null : profileData;


  return {
    user, // The user object from Firebase Auth
    profile, // The user profile document from Firestore (contains the 'role')
    isLoading,
    error: userError || profileError,
    userProfileRef, // Expose the ref for mutation
  };
}
