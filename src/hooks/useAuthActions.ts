import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { UserMenuKey } from './useSidebar';
import { useCallback } from 'react';
import { unlockActiveOrder } from './useOrderLock';
import { signOut } from '@/lib/api/refresh';

export function useAuthActions() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleUserAction = useCallback(
    async (key: UserMenuKey) => {
      if (key === 'settings') {
        router.push('/dashboard/settings');
        return;
      }
      if (key === 'logout') {
        await unlockActiveOrder();
        await signOut();
        router.push('/signin');
        return;
      }
    },
    [router]
  );

  return {
    user,
    handleUserAction,
  };
}
