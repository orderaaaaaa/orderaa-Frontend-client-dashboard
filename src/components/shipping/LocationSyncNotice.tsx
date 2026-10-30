'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import { formatDateTime } from '@/utils/format';
import { LOCATION_SYNC_STATUSES, type LocationSyncStatus } from '@/types/canonicalNames';

export interface LocationSyncView {
  status: LocationSyncStatus;
  attempts: number;
  nextRetryAt: string | null;
  lastSuccessAt?: string | null;
}

export interface LocationSyncRetry {
  onRetry: () => void;
  pending: boolean;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : formatDateTime(date);
};

interface LocationSyncNoticeProps {
  sync: LocationSyncView | null | undefined;
  retry?: LocationSyncRetry | null;
}

export function LocationSyncNotice({ sync, retry }: LocationSyncNoticeProps) {
  const { t } = useI18n();
  if (!sync) return null;

  if (sync.status === LOCATION_SYNC_STATUSES.RUNNING) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        {t('canonical.sync.running')}
      </p>
    );
  }

  if (sync.status === LOCATION_SYNC_STATUSES.QUEUED) {
    const text =
      sync.attempts > 0 && sync.nextRetryAt
        ? t('canonical.sync.retryScheduled', { date: formatDate(sync.nextRetryAt) })
        : t('canonical.sync.queued');
    return <p className="text-xs text-muted-foreground">{text}</p>;
  }

  if (sync.status === LOCATION_SYNC_STATUSES.FAILED) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-destructive">{t('canonical.sync.failed')}</span>
        {retry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={retry.onRetry}
            disabled={retry.pending}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            {t('canonical.sync.retry')}
          </Button>
        )}
      </div>
    );
  }

  if (!sync.lastSuccessAt) return null;
  return (
    <p className="text-xs text-muted-foreground">
      {t('canonical.sync.ok', { date: formatDate(sync.lastSuccessAt) })}
    </p>
  );
}
