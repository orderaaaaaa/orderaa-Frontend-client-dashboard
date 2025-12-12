'use client';

import { useState } from 'react';
import Dropdown from '../ui/Dropdown';
import { USER_MENU_OPTIONS } from '@/constants/dashboard-layout';
import { UserMenuKey } from '@/hooks/useSidebar';
import { useAuthStore } from '@/store/authStore';

interface UserMenuProps {
  username?: string;
  email?: string;
  onUserAction: (key: UserMenuKey) => void;
  variant?: 'mobile' | 'desktop';
}

export function UserMenu({
  username,
  email,
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
  const displayText = authUser?.username || username || email;

  // Show loading spinner while user data is loading
  if (!displayText) {
    return (
      <div className='flex flex-row items-center gap-2'>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"/>
      </div>
    );
  }

  return (
    <div className='flex flex-row items-center gap-2'>
      <p className={isMobile ? 'font-normal text-white text-[16px]' : 'font-bold text-[#1F1F1F] text-[20px]'}>
        اهلا يا{' '}
      </p>
      <Dropdown
        value={userMenuValue}
        onChange={handleUserMenuChange}
        options={USER_MENU_OPTIONS}
        placeholder={displayText}
        readOnly={true}
        className={
          isMobile
            ? 'border-0'
            : 'max-w-[200px] flex-shrink-1 min-w-0'
        }
        placeholderClassName={
          isMobile
            ? '!text-white font-normal text-[16px]'
            : '!text-[#1F1F1F] font-bold text-[20px]'
        }
        selectClassName={
          isMobile
            ? 'border-0 rounded-lg py-2.5 pr-0 !text-[#1F1F1F] text-[16px] placeholder:!text-white overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer outline-none font-normal'
            : 'border-0 py-2.5 pr-0 !text-[#1F1F1F] text-[18px] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer outline-none font-bold placeholder:!text-[#1F1F1F]'
        }
        arrowClassName={
          isMobile
            ? 'absolute cursor-pointer left-0 top-1/2 transform -translate-y-1/2 transition-colors z-10'
            : 'absolute cursor-pointer left-0 top-1/2 transform -translate-y-1/2 hover:text-gray-600 transition-colors z-10'
        }
        dropdownClassName="absolute z-50 left-0 right-0 bg-white rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg"
      />
    </div>
  );
}
