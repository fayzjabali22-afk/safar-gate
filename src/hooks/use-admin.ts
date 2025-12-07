'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from './use-user-profile';

/**
 * DEACTIVATED: This hook is currently disabled to allow direct access
 * to the admin panel without authentication checks.
 */
export function useAdmin() {
  // Always return isLoading: false to prevent the loading screen and any logic execution.
  return { 
    isLoading: false, 
    isAdmin: true // Assume admin to prevent any theoretical downstream effects.
  };
}
