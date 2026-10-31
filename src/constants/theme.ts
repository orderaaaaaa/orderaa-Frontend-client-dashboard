export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

export const THEME_STORAGE_KEY = 'theme';

export function isLightOnlyRoute(pathname: string): boolean {
  return pathname !== '/dashboard' && !pathname.startsWith('/dashboard/');
}
