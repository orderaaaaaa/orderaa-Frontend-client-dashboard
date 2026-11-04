'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import { PartialSuccessNotice } from './StateViews';

export interface BulkActionBarProps {
  count: number;
  pageCount: number;
  onSelectPage?: () => void;
  onClear: () => void;
  bulkLink?: { combobox: ReactNode };
  acceptSuggestions?: { count: number; onClick: () => void };
  disabledReason?: string;
  progress?: { done: number; total: number } | null;
  partial?: ComponentProps<typeof PartialSuccessNotice> | null;
}

export function BulkActionBar({
  count,
  pageCount,
  onSelectPage,
  onClear,
  bulkLink,
  acceptSuggestions,
  disabledReason,
  progress,
  partial,
}: BulkActionBarProps) {
  const { t } = useI18n();

  return (
    <>
      <p role="status" className="sr-only">
        {count > 0 ? t('canonical.bulk.selected', { count }) : ''}
      </p>
      {count > 0 && (
        <BulkBar
          count={count}
          pageCount={pageCount}
          onSelectPage={onSelectPage}
          onClear={onClear}
          bulkLink={bulkLink}
          acceptSuggestions={acceptSuggestions}
          disabledReason={disabledReason}
          progress={progress}
          partial={partial}
        />
      )}
    </>
  );
}

function BulkBar({
  count,
  pageCount,
  onSelectPage,
  onClear,
  bulkLink,
  acceptSuggestions,
  disabledReason,
  progress,
  partial,
}: BulkActionBarProps) {
  const { t } = useI18n();

  return (
    <div className="sticky bottom-0 z-(--z-inpage-sticky) flex flex-col gap-2 rounded-xl border bg-card p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-sm sm:top-0 sm:bottom-auto sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p
          aria-hidden="true"
          className="me-auto text-sm font-semibold text-foreground"
        >
          {t('canonical.bulk.selected', { count })}
        </p>
        {onSelectPage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11"
            onClick={onSelectPage}
          >
            {t('canonical.action.selectPage', { count: pageCount })}
          </Button>
        )}
        {bulkLink?.combobox}
        {acceptSuggestions && (
          <Button
            type="button"
            size="sm"
            className="min-h-11 min-w-11"
            onClick={acceptSuggestions.onClick}
          >
            {t('canonical.action.acceptSelected', {
              count: acceptSuggestions.count,
            })}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 min-w-11"
          onClick={onClear}
        >
          {t('canonical.action.clearSelection')}
        </Button>
      </div>
      {disabledReason && (
        <p className="text-sm text-muted-foreground">{disabledReason}</p>
      )}
      {progress && (
        <p role="status" className="text-sm text-muted-foreground">
          {t('canonical.bulk.progress', {
            done: progress.done,
            total: progress.total,
          })}
        </p>
      )}
      {partial && <PartialSuccessNotice {...partial} />}
    </div>
  );
}
