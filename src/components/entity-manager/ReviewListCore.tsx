'use client';

import { Fragment, type ComponentProps, type ReactNode } from 'react';
import PaginationFooter from '@/components/ui/pagination-footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { cn } from '@/lib/utils';
import { EmptyPanel, ErrorWithRetry, QueueSkeleton } from './StateViews';
import type { QueueItem, QueueTab, ReviewListStatus, TabCounts } from './types';

export interface ReviewSelection {
  ids: ReadonlySet<string>;
  anchorId?: string;
}

export interface ReviewTab<TTab extends string = QueueTab> {
  value: TTab;
  labelKey: TranslationKey;
}

export type ReviewPagination = Omit<
  ComponentProps<typeof PaginationFooter>,
  'hasSelectedItems' | 'onPageSizeChange'
>;

export interface ReviewRowState {
  selected: boolean;
  onToggleSelect: (event: { shift: boolean }) => void;
}

export interface ReviewListQuery {
  search: string;
  hasFilters: boolean;
}

type EmptyVariant = ComponentProps<typeof EmptyPanel>['variant'];

export interface ReviewListCoreProps<Row extends QueueItem, TTab extends string = QueueTab> {
  rows: readonly Row[];
  tab: TTab;
  tabs: readonly ReviewTab<TTab>[];
  onTabChange: (tab: TTab) => void;
  query: ReviewListQuery;
  onClearFilters: () => void;
  selection: ReviewSelection;
  onSelectionChange: (next: ReviewSelection) => void;
  canManage: boolean;
  status: ReviewListStatus;
  onRetry: () => void;
  listLabel: string;
  emptyVariant: EmptyVariant;
  showTabCounts: boolean;
  counts?: TabCounts<TTab>;
  renderRow: (row: Row, state: ReviewRowState) => ReactNode;
  header?: ReactNode;
  bulkBar?: ReactNode;
  pagination: ReviewPagination;
}

export function toggleReviewSelection(
  selection: ReviewSelection,
  rows: readonly { id: string }[],
  rowId: string,
  event: { shift: boolean },
): ReviewSelection {
  const ids = new Set(selection.ids);
  if (event.shift && selection.anchorId !== undefined) {
    const from = rows.findIndex((row) => row.id === selection.anchorId);
    const to = rows.findIndex((row) => row.id === rowId);
    if (from !== -1 && to !== -1) {
      const start = Math.min(from, to);
      const end = Math.max(from, to);
      const select = !selection.ids.has(rowId);
      for (let index = start; index <= end; index++) {
        if (select) {
          ids.add(rows[index].id);
        } else {
          ids.delete(rows[index].id);
        }
      }
      return { ids, anchorId: selection.anchorId };
    }
  }
  if (ids.has(rowId)) {
    ids.delete(rowId);
  } else {
    ids.add(rowId);
  }
  return { ids, anchorId: rowId };
}

export function selectReviewPage(selection: ReviewSelection, rows: readonly { id: string }[]): ReviewSelection {
  const ids = new Set(selection.ids);
  for (const row of rows) {
    ids.add(row.id);
  }
  return { ids, anchorId: selection.anchorId };
}

export function ReviewListCore<Row extends QueueItem, TTab extends string = QueueTab>({
  rows,
  tab,
  tabs,
  onTabChange,
  query,
  onClearFilters,
  selection,
  onSelectionChange,
  canManage,
  status,
  onRetry,
  listLabel,
  emptyVariant,
  showTabCounts,
  counts,
  renderRow,
  header,
  bulkBar,
  pagination,
}: ReviewListCoreProps<Row, TTab>) {
  const { t } = useI18n();

  const isLoading = status === 'loading' || (status === 'refetching' && rows.length === 0);
  const isError = status === 'error';
  const isEmpty = !isLoading && !isError && (status === 'empty' || rows.length === 0);
  const isRefetching = status === 'refetching' && rows.length > 0;

  const tabLabel = (definition: ReviewTab<TTab>): string => {
    const label = t(definition.labelKey);
    const count = counts?.[definition.value];
    return showTabCounts && typeof count === 'number'
      ? t('canonical.queue.tabs.withCount', { label, count })
      : label;
  };

  return (
    <section className="flex flex-col gap-4">
      {header}
      <Tabs
        value={tab}
        onValueChange={(next) => {
          const match = tabs.find((definition) => definition.value === next);
          if (match) onTabChange(match.value);
        }}
      >
        <TabsList className="w-full">
          {tabs.map((definition) => (
            <TabsTrigger key={definition.value} value={definition.value} className="min-h-11">
              {tabLabel(definition)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab} className="flex flex-col gap-4">
          {bulkBar}
          {isLoading && <QueueSkeleton />}
          {isError && <ErrorWithRetry message={t('canonical.queue.error')} onRetry={onRetry} />}
          {isEmpty && (
            <EmptyPanel
              variant={query.hasFilters ? 'filtered' : emptyVariant}
              query={query.search}
              onClear={onClearFilters}
            />
          )}
          {!isLoading && !isError && !isEmpty && (
            <div className="relative">
              {isRefetching && (
                <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary/15">
                  <div className="h-full w-1/3 animate-pulse bg-primary motion-reduce:animate-none" />
                </div>
              )}
              <div
                role="list"
                aria-label={listLabel}
                aria-busy={isRefetching}
                className={cn(
                  'flex flex-col transition-opacity motion-reduce:transition-none',
                  isRefetching && 'opacity-60',
                )}
              >
                {rows.map((row) => (
                  <Fragment key={row.id}>
                    {renderRow(row, {
                      selected: selection.ids.has(row.id),
                      onToggleSelect: (event) =>
                        onSelectionChange(toggleReviewSelection(selection, rows, row.id, event)),
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          )}
          {!isLoading && !isError && !isEmpty && (
            <PaginationFooter
              {...pagination}
              onPageSizeChange={undefined}
              hasSelectedItems={selection.ids.size > 0 && canManage}
            />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
