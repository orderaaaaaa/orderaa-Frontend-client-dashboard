'use client';

import { Fragment, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import PaginationFooter from '@/components/ui/pagination-footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { cn } from '@/lib/utils';
import { ScrollEndFade } from '@/components/ui/scroll-end-fade';
import { StackedList } from '@/components/ui/stacked-list';
import { EmptyPanel, ErrorWithRetry, QueueSkeleton } from './StateViews';
import { usePhone } from './useMediaQuery';
import { useOverflowFade } from './useOverflowFade';
import type { QueueItem, QueueTab, ReviewListStatus, TabCounts } from './types';
import {
  BULK_BAR_ATTR,
  QUEUE_ROW_ATTR,
  focusQueueRow,
  queueRowTabIndex,
  useQueueKeyboard,
} from './useQueueKeyboard';

const isUnlinkedRow = (row: QueueItem) => row.state === 'unlinked' || row.state === 'implicit';

function rowElementOf(root: HTMLElement | null, id: string): HTMLElement | null {
  const rows = Array.from(root?.querySelectorAll<HTMLElement>(`[${QUEUE_ROW_ATTR}]`) ?? []);
  return rows.find((element) => element.getAttribute(QUEUE_ROW_ATTR) === id) ?? null;
}

function clickWithin(root: HTMLElement | null, selector: string) {
  root?.querySelector<HTMLElement>(selector)?.click();
}

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
  tabIndex: 0 | -1;
  focused: boolean;
  onLinked: () => void;
}

export interface ReviewKeyboardHandlers<Row> {
  onOpenRow: (row: Row) => void;
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
  keyboard?: ReviewKeyboardHandlers<Row>;
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
  keyboard,
}: ReviewListCoreProps<Row, TTab>) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const phone = usePhone();
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabsOverflow = useOverflowFade(tabsRef);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const rowIds = rows.map((row) => row.id);

  const focusNextUnlinked = (afterId: string) => {
    const index = rows.findIndex((row) => row.id === afterId);
    const next =
      rows.slice(index + 1).find(isUnlinkedRow) ?? rows.slice(0, Math.max(index, 0)).find(isUnlinkedRow);
    if (!next) return;
    requestAnimationFrame(() => focusQueueRow(containerRef.current, next.id));
  };

  const { onKeyDown } = useQueueKeyboard({
    containerRef,
    rowIds,
    focusedId,
    canManage,
    onFocusRow: setFocusedId,
    onToggleRow: (id) => onSelectionChange(toggleReviewSelection(selection, rows, id, { shift: false })),
    onRangeRow: (id) => onSelectionChange(toggleReviewSelection(selection, rows, id, { shift: true })),
    onLinkRow: (id) => clickWithin(rowElementOf(containerRef.current, id), '[data-link-control] button'),
    onLinkSelection: () =>
      clickWithin(
        containerRef.current?.querySelector<HTMLElement>(`[${BULK_BAR_ATTR}]`) ?? null,
        '[data-link-control] button',
      ),
    onOpenRow: (id) => {
      const row = rows.find((candidate) => candidate.id === id);
      if (row) keyboard?.onOpenRow(row);
    },
  });

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

  const rowNodes = rows.map((row) => (
    <Fragment key={row.id}>
      {renderRow(row, {
        selected: selection.ids.has(row.id),
        onToggleSelect: (event) =>
          onSelectionChange(toggleReviewSelection(selection, rows, row.id, event)),
        tabIndex: queueRowTabIndex(rowIds, focusedId, row.id),
        focused: focusedId === row.id,
        onLinked: () => focusNextUnlinked(row.id),
      })}
    </Fragment>
  ));

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
        <div className="relative">
          <div ref={tabsRef} className="overflow-x-auto">
            <TabsList className="w-max min-w-full justify-start">
              {tabs.map((definition) => (
                <TabsTrigger key={definition.value} value={definition.value} className="min-h-11">
                  {tabLabel(definition)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <ScrollEndFade visible={tabsOverflow} />
        </div>
        <TabsContent value={tab} className="flex flex-col gap-4">
          <div
            ref={containerRef}
            className="flex flex-col gap-4"
            onKeyDown={onKeyDown}
            onFocus={(event) => {
              const id = event.target instanceof HTMLElement ? event.target.getAttribute(QUEUE_ROW_ATTR) : null;
              if (id !== null) setFocusedId(id);
            }}
          >
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
                <div aria-hidden="true" className="absolute inset-x-0 top-0 z-(--z-raised) h-0.5 overflow-hidden bg-primary/15">
                  <div className="h-full w-1/3 animate-pulse bg-primary motion-reduce:animate-none" />
                </div>
              )}
              {phone ? (
                <div
                  aria-busy={isRefetching}
                  className={cn('transition-opacity motion-reduce:transition-none', isRefetching && 'opacity-60')}
                >
                  <StackedList label={listLabel} className="bg-card">
                    {rowNodes}
                  </StackedList>
                </div>
              ) : (
                <div
                  role="list"
                  aria-label={listLabel}
                  aria-busy={isRefetching}
                  className={cn(
                    'flex flex-col transition-opacity motion-reduce:transition-none',
                    isRefetching && 'opacity-60',
                  )}
                >
                  {rowNodes}
                </div>
              )}
            </div>
          )}
          </div>
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
