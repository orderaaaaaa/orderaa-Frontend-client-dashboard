'use client';

import type React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthStore } from '@/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { isAuthenticated, isChecking } = useAuthGuard(true);

  if (!hasHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
