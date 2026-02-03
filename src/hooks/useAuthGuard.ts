'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';

export function useAuthGuard(requireAuth = true) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (requireAuth && !token) {
      toast.info('يرجى تسجيل الدخول للمتابعة');
      router.replace('/signin');
    } else if (requireAuth && token && !user) {
      toast.error('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
      logout();
      router.replace('/signin');
    } else if (!requireAuth && token && user) {
      router.replace('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [token, user, router, requireAuth, hasHydrated, logout]);

  return { isAuthenticated: !!token && !!user, isChecking };
}
