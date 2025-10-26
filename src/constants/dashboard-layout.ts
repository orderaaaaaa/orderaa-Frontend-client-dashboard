export const SIDEBAR_WIDTH = {
  EXPANDED: 'w-64',
  COLLAPSED: 'w-16',
} as const;

export const BREAKPOINTS = {
  LG: 1024,
} as const;

export const USER_MENU_OPTIONS = [
  { key: 'settings' as const, value: 'الإعدادات' },
  { key: 'logout' as const, value: 'تسجيل الخروج' },
];
