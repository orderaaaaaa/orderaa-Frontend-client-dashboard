'use client';

import { Bell } from 'lucide-react';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { formatNumber } from '@/utils/format';

interface NoticeBadgeProps {
  count: number;
  onClick(): void;
}

export function NoticeBadge({ count, onClick }: NoticeBadgeProps) {
  const canReadNotices = useHasPermissionStrict(PERMISSION_CODES.ORDERS_NOTICES_READ);

  if (!canReadNotices || count <= 0) return null;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={`عرض تنبيهات الطلب، غير مقروءة ${formatNumber(count)}`}
      className="relative z-[2] inline-flex max-w-full items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Bell aria-hidden="true" className="size-3.5 shrink-0" />
      <span>تنبيهات</span>
      <span
        dir="ltr"
        className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-bold tabular-nums text-destructive-foreground"
      >
        {formatNumber(count)}
      </span>
    </button>
  );
}
