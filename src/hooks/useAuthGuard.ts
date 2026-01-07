'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useAuthGuard(requireAuth = true) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (requireAuth && !token) {
        router.replace('/signin');
      } else if (!requireAuth && token) {
        router.replace('/dashboard');
      } else {
        setIsChecking(false);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [token, router, requireAuth]);

  return { isAuthenticated: !!token, isChecking };
}
