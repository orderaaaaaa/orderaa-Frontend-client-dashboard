'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import { THEMES, isDarkModeReadyRoute } from '@/constants/theme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isDarkModeReadyRoute(pathname)) {
    return null;
  }

  const isDark = resolvedTheme === THEMES.DARK;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-pressed={isDark}
      aria-label={t('common.theme.toggle')}
      onClick={() => setTheme(isDark ? THEMES.LIGHT : THEMES.DARK)}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
