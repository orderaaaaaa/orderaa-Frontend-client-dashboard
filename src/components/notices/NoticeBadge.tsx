'use client';

import type { MouseEvent } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { formatNumber } from '@/utils/format';

interface NoticeBadgeProps {
  count: number;
  onClick(): void;
}

export function NoticeBadge({ count, onClick }: NoticeBadgeProps) {
  const canReadNotices = useHasPermissionStrict(PERMISSION_CODES.ORDERS_NOTICES_READ);
  const { t } = useI18n();

  if (!canReadNotices || count <= 0) return null;

  return (
    <Button
      variant="ghost"
      onClick={(event: MouseEvent) => {
        event.stopPropagation();
        onClick();
      }}
      className="relative hover:scale-110 transition-transform p-0 h-auto"
      title={t('orderNotices.badge.title')}
      aria-label={t('orderNotices.badge.ariaLabel', { count: formatNumber(count) })}
    >
      <Bell className="w-6 h-6 text-red-600 cursor-pointer" style={{ strokeWidth: 1.5 }} />
      <span className="absolute top-3 right-[-4px] w-4 h-4 text-[11px] font-bold bg-card text-red-600 rounded-full flex items-center justify-center">
        {formatNumber(count)}
      </span>
    </Button>
  );
}
