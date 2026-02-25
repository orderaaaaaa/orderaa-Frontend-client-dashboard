'use client';

import type React from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthStore } from '@/store/authStore';
import { usePermission } from '@/hooks/usePermission';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { isAuthenticated, isChecking } = useAuthGuard(true);
  const { checkRouteAccess } = usePermission();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthorized =
    isAuthenticated && !isChecking && checkRouteAccess(pathname);

  useEffect(() => {
    if (isAuthenticated && !isChecking && !checkRouteAccess(pathname)) {
      router.replace('/dashboard/unauthorized');
    }
  }, [isAuthenticated, isChecking, pathname, checkRouteAccess, router]);

  if (!hasHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
