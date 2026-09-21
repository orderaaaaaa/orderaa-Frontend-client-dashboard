'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import {
  THEME_STORAGE_KEY,
  THEMES,
  isDarkModeReadyRoute,
} from '@/constants/theme';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={THEMES.LIGHT}
      enableSystem={false}
      disableTransitionOnChange
      storageKey={THEME_STORAGE_KEY}
      forcedTheme={
        isDarkModeReadyRoute(pathname) ? undefined : THEMES.LIGHT
      }
    >
      {children}
    </ThemeProvider>
  );
}
