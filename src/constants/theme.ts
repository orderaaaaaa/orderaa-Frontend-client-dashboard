export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

export const THEME_STORAGE_KEY = 'theme';

export const DARK_MODE_READY_ROUTES = ['/dashboard/statistics'] as const;

export function isDarkModeReadyRoute(pathname: string): boolean {
  return DARK_MODE_READY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
