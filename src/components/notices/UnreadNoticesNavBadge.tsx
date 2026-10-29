'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { useUnreadNoticeCountQuery } from '@/services/orderNotices';
import { formatNumber } from '@/utils/format';

interface UnreadNoticesNavBadgeProps {
  className?: string;
  poll?: boolean;
}

export function UnreadNoticesNavBadge({ className, poll = true }: UnreadNoticesNavBadgeProps) {
  const canReadNotices = useHasPermissionStrict(PERMISSION_CODES.ORDERS_NOTICES_READ);
  const { data } = useUnreadNoticeCountQuery({ enabled: canReadNotices, polling: poll });
  const { t } = useI18n();

  const total = data?.total ?? 0;
  if (!canReadNotices || total <= 0) return null;

  return (
    <span
      role="img"
      dir="ltr"
      aria-label={t('orderNotices.badge.ariaLabel', { count: formatNumber(total) })}
      className={cn(
        'flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-bold tabular-nums text-destructive-foreground',
        className
      )}
    >
      {formatNumber(total)}
    </span>
  );
}
