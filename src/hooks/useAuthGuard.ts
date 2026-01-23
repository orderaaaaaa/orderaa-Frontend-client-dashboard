'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useAuthGuard(requireAuth = true) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (requireAuth && !token) {
      router.replace('/signin');
    } else if (!requireAuth && token) {
      router.replace('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [token, router, requireAuth, hasHydrated]);

  return { isAuthenticated: !!token, isChecking };
}
