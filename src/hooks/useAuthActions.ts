import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { UserMenuKey } from './useSidebar';
import { useCallback } from 'react';

export function useAuthActions() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleUserAction = useCallback(
    (key: UserMenuKey) => {
      if (key === 'settings') {
        router.push('/dashboard/settings');
        return;
      }
      if (key === 'logout') {
        logout();
        localStorage.removeItem('auth-storage');
        router.push('/signin');
        return;
      }
    },
    [router, logout]
  );

  return {
    user,
    handleUserAction,
  };
}
