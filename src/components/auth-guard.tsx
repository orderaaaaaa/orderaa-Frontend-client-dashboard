'use client';

import type React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthStore } from '@/store/authStore';
import PageLoading from '@/components/ui/page-loading';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { isAuthenticated, isChecking } = useAuthGuard(true);

  if (!hasHydrated || isChecking) {
    return <PageLoading fullScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
