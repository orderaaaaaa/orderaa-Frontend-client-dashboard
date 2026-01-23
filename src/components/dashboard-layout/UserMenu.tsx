'use client';

import { useState, useRef, useEffect } from 'react';
import { LiaAngleDownSolid } from 'react-icons/lia';
import { USER_MENU_OPTIONS } from '@/constants/dashboard-layout';
import { UserMenuKey } from '@/hooks/useSidebar';
import { useAuthStore } from '@/store/authStore';
import { Button } from '../ui/button';

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
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const authUser = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isMobile = variant === 'mobile';
  const displayText = authUser?.name || username || email || 'user';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (key: string) => {
    setIsOpen(false);
    if (key === 'settings' || key === 'logout') {
      onUserAction(key as UserMenuKey);
    } else {
      console.warn(`Invalid user menu key: ${key}`);
    }
  };

  if (!hasHydrated) {
    return (
      <div className="flex flex-row items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative flex flex-row items-center">
      <span
        className={
          isMobile
            ? 'font-normal text-white text-[16px]'
            : 'font-bold text-[#1F1F1F] text-base'
        }
      >
        اهلا يا
      </span>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center !p-1  cursor-pointer ${
          isMobile
            ? 'font-normal text-white text-[16px] hover:text-white'
            : 'font-bold text-[#1F1F1F] text-base'
        } transition-colors hover:bg-transparent`}
      >
        <span>{displayText}</span>
        <LiaAngleDownSolid
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen && (
        <ul className="absolute z-50 top-full mt-1 left-0 min-w-[150px] bg-white rounded-lg max-h-48 overflow-y-auto shadow-lg">
          {USER_MENU_OPTIONS.map((option) => (
            <li
              key={option.key}
              className="px-3 py-2 cursor-pointer text-[#111827] hover:bg-primary hover:text-white"
              style={{ direction: 'rtl' }}
              onClick={() => handleOptionClick(option.key)}
            >
              {option.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
