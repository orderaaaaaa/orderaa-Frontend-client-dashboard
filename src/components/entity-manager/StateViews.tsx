'use client';

import { useId } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  PackageSearch,
  RefreshCw,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import type { TranslationKey } from '@/i18n/translate';
import { cn } from '@/lib/utils';

export function QueueSkeleton({ rows = 6 }: { rows?: number }) {
  const { t } = useI18n();
  return (
    <div role="status" aria-live="polite" className="flex flex-col">
      <span className="sr-only">{t('canonical.queue.loading')}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} aria-hidden="true" className="flex items-center gap-3 border-b py-3 last:border-b-0">
          <Skeleton className="h-3 w-24 bg-muted" />
          <Skeleton className="h-3 flex-1 bg-muted" />
          <Skeleton className="h-6 w-20 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

type EmptyPanelVariant = 'queue-clear' | 'no-items' | 'no-results' | 'filtered' | 'no-access';

interface EmptyPanelProps {
  variant: EmptyPanelVariant;
  query?: string;
  onClear?: () => void;
  titleKey?: TranslationKey;
}

const EMPTY_PANEL_TITLE_KEY: Record<EmptyPanelVariant, TranslationKey> = {
  'queue-clear': 'canonical.queue.empty.unlinked',
  'no-items': 'canonical.queue.empty.none',
  'no-results': 'canonical.name.empty.noResults',
  filtered: 'canonical.queue.empty.filtered',
  'no-access': 'canonical.state.noAccess',
};

const EMPTY_PANEL_ICON: Record<EmptyPanelVariant, LucideIcon> = {
  'queue-clear': CheckCircle2,
  'no-items': PackageSearch,
  'no-results': Search,
  filtered: Search,
  'no-access': Lock,
};

const EMPTY_PANEL_ICON_TONE: Record<EmptyPanelVariant, string> = {
  'queue-clear': 'text-success',
  'no-items': 'text-muted-foreground',
  'no-results': 'text-muted-foreground',
  filtered: 'text-muted-foreground',
  'no-access': 'text-muted-foreground',
};

export function EmptyPanel({ variant, query, onClear, titleKey }: EmptyPanelProps) {
  const { t } = useI18n();
  const Icon = EMPTY_PANEL_ICON[variant];
  const title = titleKey ?? EMPTY_PANEL_TITLE_KEY[variant];
  const showClear = onClear !== undefined && (variant === 'filtered' || variant === 'no-results');
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <Icon className={cn('size-10', EMPTY_PANEL_ICON_TONE[variant])} aria-hidden="true" />
      <p className="text-base font-semibold text-foreground">
        {t(title, { query: query ?? '' })}
      </p>
      {showClear && (
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          <X aria-hidden="true" />
          {t('canonical.queue.clearFilters')}
        </Button>
      )}
    </div>
  );
}

interface ErrorWithRetryProps {
  message: string;
  reason?: string;
  onRetry: () => void;
}

export function ErrorWithRetry({ message, reason, onRetry }: ErrorWithRetryProps) {
  const { t } = useI18n();
  const messageId = useId();
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <p id={messageId} className="text-base font-semibold text-foreground">
        {message}
      </p>
      {reason && <p className="text-sm text-muted-foreground">{reason}</p>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        aria-describedby={messageId}
      >
        <RefreshCw aria-hidden="true" />
        {t('common.retry')}
      </Button>
    </div>
  );
}

interface PartialSuccessNoticeProps {
  saved: number;
  total: number;
  failed: number;
  reason: string;
  onRetry?: () => void;
}

export function PartialSuccessNotice({ saved, total, failed, reason, onRetry }: PartialSuccessNoticeProps) {
  const { t } = useI18n();
  return (
    <div role="status" className="flex flex-col gap-2 rounded-md border bg-warning/15 p-3 text-sm text-foreground">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
        <p>
          {t('canonical.bulk.partial', {
            saved,
            total,
            failed,
            spellingNoun: pluralAr(t, 'spelling', failed),
            reason,
          })}
        </p>
      </div>
      {onRetry && (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            {t('canonical.bulk.retryRest')}
          </Button>
        </div>
      )}
    </div>
  );
}

interface StaleBannerProps {
  lastSuccessAt: string | Date;
  failedCount?: number;
}

const STALE_DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function StaleBanner({ lastSuccessAt }: StaleBannerProps) {
  const { t } = useI18n();
  const date = STALE_DATE_FORMAT.format(new Date(lastSuccessAt));
  return (
    <div role="status" className="flex items-start gap-2 rounded-md border bg-warning/15 p-3 text-sm text-foreground">
      <Clock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <p>{t('canonical.state.staleBanner', { date })}</p>
    </div>
  );
}
