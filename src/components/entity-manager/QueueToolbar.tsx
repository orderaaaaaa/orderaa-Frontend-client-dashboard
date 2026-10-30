'use client';

import { useId, type ReactNode, type Ref } from 'react';
import { X } from 'lucide-react';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n/I18nProvider';

export const QUEUE_PAGE_SIZES = [25, 50, 100, 500] as const;

export const QUEUE_MAX_PAGE_SIZE = 500;

export const QUEUE_DEFAULT_PAGE_SIZE = 25;

export function clampQueuePageSize(size: number | undefined): number {
  if (size === undefined || !Number.isFinite(size)) return QUEUE_DEFAULT_PAGE_SIZE;
  return Math.min(QUEUE_MAX_PAGE_SIZE, Math.max(1, Math.trunc(size)));
}

export interface QueueToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchInputRef?: Ref<HTMLInputElement>;
  scope?: ReactNode;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeLabel?: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function QueueToolbar({
  search,
  onSearchChange,
  searchInputRef,
  scope,
  pageSize,
  onPageSizeChange,
  pageSizeLabel,
  hasFilters,
  onClearFilters,
}: QueueToolbarProps) {
  const { t } = useI18n();
  const hintId = useId();
  const searchLabel = t('canonical.queue.search.placeholder');
  const pageSizeName = pageSizeLabel ?? t('canonical.queue.pageSize');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
          <Input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onClear={() => onSearchChange('')}
            clearable
            placeholder={searchLabel}
            aria-label={searchLabel}
            aria-describedby={hintId}
            autoComplete="off"
          />
          <p id={hintId} className="text-sm text-muted-foreground">
            {t('canonical.queue.search.hint')}
          </p>
        </div>
        {scope}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={String(clampQueuePageSize(pageSize))}
          onValueChange={(next) => onPageSizeChange(clampQueuePageSize(Number(next)))}
        >
          <SelectTrigger aria-label={pageSizeName} className="min-h-11 min-w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUEUE_PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button type="button" variant="ghost" className="min-h-11" onClick={onClearFilters}>
            <X aria-hidden="true" />
            {t('canonical.queue.clearFilters')}
          </Button>
        )}
      </div>
    </div>
  );
}
