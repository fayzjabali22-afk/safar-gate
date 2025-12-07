'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This is the root page of the application.
 * It now serves as a simple redirect to the login page.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  // Return a minimal loading state or null while redirecting
  // to avoid any flicker.
  return null;
}
