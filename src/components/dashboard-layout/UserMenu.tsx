'use client';

import { useState } from 'react';
import Dropdown from '../ui/Drobdown';
import { USER_MENU_OPTIONS } from '@/constants/dashboard-layout';
import { UserMenuKey } from '@/hooks/useSidebar';
import { useAuthStore } from '@/store/authStore';

interface UserMenuProps {
  username?: string;
  onUserAction: (key: UserMenuKey) => void;
}

export function UserMenu({ username, onUserAction }: UserMenuProps) {
  const [userMenuValue, setUserMenuValue] = useState<string>('');
  const authUser = useAuthStore((state) => state.user);

  const handleUserMenuChange = (key: string) => {
    setUserMenuValue('');

    // Type guard to ensure key is a valid UserMenuKey
    if (key === 'settings' || key === 'logout') {
      onUserAction(key as UserMenuKey);
    } else {
      console.warn(`Invalid user menu key: ${key}`);
    }
  };

  return (
    <Dropdown
      value={userMenuValue}
      onChange={handleUserMenuChange}
      options={USER_MENU_OPTIONS}
      placeholder={authUser ? authUser.username : username || 'المستخدم'}
      className="w-auto"
      placeholderClassName="text-[#1F1F1F] font-bold text-[20px]"
      selectClassName="border-0"
    />
  );
}
