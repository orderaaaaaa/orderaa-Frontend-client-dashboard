'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import type { TranslationKey } from '@/i18n/translate';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { formatDateTime } from '@/utils/format';
import {
  LOCATION_SYNC_STATUSES,
  type LocationSourceStatus,
  type LocationSourcesStatus,
  type LocationSourceSync,
} from '@/types/canonicalNames';
import {
  useLocationSourceSyncWatch,
  useRefreshLocationSource,
} from '@/services/locationSourceSync';
import { locationSourceLabel } from '../utils/locationSourceLabel';
import { ErrorWithRetry, StaleBanner } from '@/components/entity-manager/StateViews';

type Translate = ReturnType<typeof useI18n>['t'];

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : formatDateTime(date);
};

const failureReasonOf = (source: LocationSourceStatus, t: Translate): string | null => {
  const code = source.lastErrorCode;
  if (!code) return null;
  const count = source.failedGovernorateKeys.length;
  return t(`canonical.status.source.${code}` as TranslationKey, {
    carrier: locationSourceLabel(source.source),
    count,
    governorateNoun: pluralAr(t, 'governorate', count),
  });
};

const syncTextOf = (sync: LocationSourceSync, t: Translate): string | null => {
  switch (sync.status) {
    case LOCATION_SYNC_STATUSES.RUNNING:
      return t('canonical.sync.running');
    case LOCATION_SYNC_STATUSES.QUEUED:
      return sync.attempts > 0 && sync.nextRetryAt
        ? t('canonical.sync.retryScheduled', { date: formatDate(sync.nextRetryAt) })
        : t('canonical.sync.queued');
    case LOCATION_SYNC_STATUSES.FAILED:
      return t('canonical.sync.failed');
    default:
      return null;
  }
};

const outcomeOf = (sources: LocationSourceStatus[]) => {
  const failed = sources.filter((source) => source.lastErrorCode !== null).length;
  if (failed === 0) return 'done';
  return failed === sources.length ? 'failed' : 'partial';
};

interface SourceRowProps {
  source: LocationSourceStatus;
  canManage: boolean;
}

function SourceRow({ source, canManage }: SourceRowProps) {
  const { t } = useI18n();
  const retry = useRefreshLocationSource(source.source);
  const sync = source.sync ?? null;
  const syncText = sync ? syncTextOf(sync, t) : null;
  const reason = failureReasonOf(source, t);
  const staleSince =
    source.lastSuccessAt !== null &&
    source.lastAttemptAt !== null &&
    Date.parse(source.lastSuccessAt) < Date.parse(source.lastAttemptAt)
      ? source.lastSuccessAt
      : null;
  const syncBusy =
    sync?.status === LOCATION_SYNC_STATUSES.QUEUED ||
    sync?.status === LOCATION_SYNC_STATUSES.RUNNING;
  const counts = t('canonical.status.counts', {
    governorates: source.governorateCount,
    governorateNoun: pluralAr(t, 'governorate', source.governorateCount),
    cities: source.cityCount,
    cityNoun: pluralAr(t, 'city', source.cityCount),
  });

  return (
    <li className="flex flex-col gap-1 rounded-md border bg-background px-3 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">
          {locationSourceLabel(source.source)}
        </span>
        {syncText && <span className="text-muted-foreground">{syncText}</span>}
        {canManage && sync?.status === LOCATION_SYNC_STATUSES.FAILED && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-8"
            onClick={() => retry.mutate()}
            disabled={retry.isPending || syncBusy}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            {t('canonical.sync.retry')}
          </Button>
        )}
      </div>
      <p className="text-muted-foreground">
        {source.lastSuccessAt
          ? t('canonical.status.lastSuccess', { date: formatDate(source.lastSuccessAt) })
          : t('canonical.status.neverSucceeded')}
      </p>
      <p className="text-muted-foreground">
        {source.lastAttemptAt
          ? t('canonical.status.lastAttempt', { date: formatDate(source.lastAttemptAt) })
          : t('canonical.sync.queued')}
      </p>
      <p className="text-muted-foreground">{counts}</p>
      {reason && <p className="text-destructive">{reason}</p>}
      {staleSince && <StaleBanner lastSuccessAt={staleSince} />}
    </li>
  );
}

interface LocationSourcesStatusStripProps {
  status: LocationSourcesStatus | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export default function LocationSourcesStatusStrip({
  status,
  isLoading = false,
  isError = false,
  onRetry,
}: LocationSourcesStatusStripProps) {
  const { t } = useI18n();
  const canManage = useHasPermission(PERMISSION_CODES.CANONICAL_NAMES_MANAGE);
  useLocationSourceSyncWatch(status);
  const [announcement, setAnnouncement] = useState('');
  const wasRunning = useRef(false);

  useEffect(() => {
    if (!status) return;
    if (wasRunning.current && !status.running) {
      setAnnouncement(t(`canonical.refresh.${outcomeOf(status.sources)}` as TranslationKey));
    }
    wasRunning.current = status.running;
  }, [status, t]);

  if (!status) {
    if (isLoading) return <Skeleton className="h-16 w-full bg-muted" />;
    if (isError) {
      return (
        <div className="rounded-md border bg-muted p-3">
          <ErrorWithRetry message={t('canonical.status.loadError')} onRetry={onRetry ?? (() => {})} />
        </div>
      );
    }
    return null;
  }

  if (!status.running && status.sources.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-muted p-3">
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {status.running && (
        <p className="text-xs text-muted-foreground">
          {t('canonical.status.running')}
        </p>
      )}
      <ul className="flex flex-wrap gap-2">
        {status.sources.map((source) => (
          <SourceRow key={source.source} source={source} canManage={canManage} />
        ))}
      </ul>
    </div>
  );
}
