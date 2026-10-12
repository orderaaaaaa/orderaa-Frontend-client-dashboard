'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { LiaAngleDownSolid } from 'react-icons/lia';
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
  const authUser = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isMobile = variant === 'mobile';
  const displayName = authUser?.name || username || email;

  if (!hasHydrated || !displayName) {
    return (
      <div className="flex flex-row items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-row items-center">
      <span
        className={
          isMobile
            ? 'font-normal text-white text-[16px]'
            : 'font-bold text-foreground-heading text-base'
        }
      >
        اهلا يا
      </span>
      <DropdownMenuPrimitive.Root dir="rtl">
        <DropdownMenuPrimitive.Trigger
          className={`group flex items-center gap-1 p-1 cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors ${
            isMobile
              ? 'font-normal text-white text-[16px] hover:text-white'
              : 'font-bold text-foreground-heading text-base'
          }`}
        >
          <span>{displayName}</span>
          <LiaAngleDownSolid className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 min-w-[150px] overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg dark:border dark:border-border"
          >
            {USER_MENU_OPTIONS.map((option) => (
              <DropdownMenuPrimitive.Item
                key={option.key}
                onSelect={() => onUserAction(option.key)}
                className="cursor-pointer px-3 py-2.5 text-foreground-body outline-none data-[highlighted]:bg-primary data-[highlighted]:text-white"
              >
                {option.value}
              </DropdownMenuPrimitive.Item>
            ))}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
}
