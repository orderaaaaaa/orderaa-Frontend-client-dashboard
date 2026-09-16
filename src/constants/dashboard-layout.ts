import { Settings, LogOut, LucideIcon } from 'lucide-react';

export const SIDEBAR_WIDTH = {
  EXPANDED: 'w-64',
  COLLAPSED: 'w-16',
  EXPANDED_CSS: '16rem',
  COLLAPSED_CSS: '4rem',
} as const;

export const FIXED_BOTTOM_BAR_CLASS =
  'fixed bottom-0 left-0 right-0 lg:right-[var(--sidebar-w,0px)] z-30 transition-[right] duration-300';

export const BREAKPOINTS = {
  LG: 1024,
} as const;

export interface UserMenuOption {
  key: 'settings' | 'logout';
  value: string;
  icon?: LucideIcon;
}

export const USER_MENU_OPTIONS: UserMenuOption[] = [
  { key: 'settings' as const, value: 'الإعدادات', icon: Settings },
  { key: 'logout' as const, value: 'تسجيل الخروج', icon: LogOut },
];
