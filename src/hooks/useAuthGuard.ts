'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';

export function useAuthGuard(requireAuth = true) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const bootstrapSettled = useAuthStore((state) => state.bootstrapSettled);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const setIsLoggingOut = useAuthStore((state) => state.setIsLoggingOut);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!hasHydrated || !bootstrapSettled) return;

    if (requireAuth && !user) {
      if (!isLoggingOut) {
        toast.info('يرجى تسجيل الدخول للمتابعة');
      }
      router.replace('/signin');
    } else if (!requireAuth && user) {
      router.replace('/dashboard');
    } else {
      if (isLoggingOut) {
        setIsLoggingOut(false);
      }
      setIsChecking(false);
    }
  }, [user, router, requireAuth, hasHydrated, bootstrapSettled, isLoggingOut, setIsLoggingOut]);

  return { isAuthenticated: !!user, isChecking };
}
