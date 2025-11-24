'use client';

import { useState } from 'react';
import Dropdown from '../ui/Drobdown';
import { USER_MENU_OPTIONS } from '@/constants/dashboard-layout';
import { UserMenuKey } from '@/hooks/useSidebar';
import { useAuthStore } from '@/store/authStore';

interface UserMenuProps {
  username?: string;
  onUserAction: (key: UserMenuKey) => void;
  variant?: 'mobile' | 'desktop';
}

export function UserMenu({
  username,
  onUserAction,
  variant = 'desktop',
}: UserMenuProps) {
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

  const isMobile = variant === 'mobile';
  return (
    <Dropdown
      value={userMenuValue}
      onChange={handleUserMenuChange}
      options={USER_MENU_OPTIONS}
      placeholder={authUser ? authUser.username : username || 'المستخدم'}
      className={
        isMobile
          ? 'max-w-[200px] flex-shrink-1 min-w-0 border-0'
          : 'max-w-[200px] flex-shrink-1 min-w-0'
      }
      placeholderClassName={
        isMobile
          ? 'text-white font-bold text-[20px]'
          : 'text-[#1F1F1F] font-bold text-[20px]'
      }
      selectClassName={
        isMobile
          ? 'border-0 bg-transparent rounded-lg py-2.5 pl-[22px] pr-2 text-[14px] text-white placeholder:text-white overflow-hidden text-ellipsis whitespace-nowrap min-w-[100px] text-left'
          : 'border-0 rounded-lg py-2.5 pl-[22px] pr-2 text-[18px] text-[#1F1F1F] placeholder:text-[#878A99] overflow-hidden text-ellipsis whitespace-nowrap min-w-[150px] max-w-[200px] text-left'
      }
      arrowClassName={
        isMobile
          ? 'absolute cursor-pointer left-0 top-1/2 transform -translate-y-1/2 text-white hover:text-white/80 transition-colors z-10'
          : 'absolute cursor-pointer left-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10'
      }
      dropdownClassName="absolute z-10 left-0 right-0 bg-white rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg"
    />
  );
}
