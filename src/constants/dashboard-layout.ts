import { Settings, LogOut, LucideIcon } from 'lucide-react';

export const SIDEBAR_WIDTH = {
  EXPANDED: 'w-64',
  COLLAPSED: 'w-16',
} as const;

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
