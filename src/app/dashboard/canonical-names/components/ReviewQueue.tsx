'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import {
  QUEUE_DEFAULT_PAGE_SIZE,
  QUEUE_MAX_PAGE_SIZE,
  QueueToolbar,
  clampQueuePageSize,
} from '@/components/entity-manager/QueueToolbar';
import {
  ReviewListCore,
  selectReviewPage,
  type ReviewPagination,
  type ReviewRowState,
  type ReviewSelection,
  type ReviewTab,
} from '@/components/entity-manager/ReviewListCore';
import { EmptyPanel, QueueSkeleton } from '@/components/entity-manager/StateViews';
import type { QueueItem, QueueItemState, ReviewListStatus } from '@/components/entity-manager/types';
import { useI18n } from '@/i18n/I18nProvider';
import { useGroupCountsQuery } from '@/services/canonicalNameCounts';
import { useSourceGroupsQuery } from '@/services/canonicalNames';
import { useDebounce } from '@/utils/debounce';
import {
  GROUP_STATES,
  type CanonicalNameDomain,
  type GroupState,
  type ListGroupCountsParams,
  type ListGroupsParams,
  type SourceGroup,
  type UnscopedParent,
} from '@/types/canonicalNames';
import { CANONICAL_DOMAIN_CONFIGS } from '@/app/dashboard/canonical-names/config/domainConfigs';
import { locationSourceLabel } from '@/app/dashboard/canonical-names/utils/locationSourceLabel';
import {
  DEFAULT_QUEUE_STATE,
  useQueueUrlState,
  type QueueStateParam,
} from '@/app/dashboard/canonical-names/utils/queueUrlState';

export interface GroupQueueRow extends QueueItem {
  group: SourceGroup;
}

const GROUP_STATE_TO_QUEUE: Record<GroupState, QueueItemState> = {
  UNLINKED: 'unlinked',
  PARTIAL: 'partial',
  MIXED: 'mixed',
  LINKED: 'linked',
};

const queueStateOf = (group: SourceGroup): QueueItemState =>
  group.state === GROUP_STATES.UNLINKED && group.implicitName !== null
    ? 'implicit'
    : GROUP_STATE_TO_QUEUE[group.state];

export function toGroupQueueRow(group: SourceGroup): GroupQueueRow {
  return {
    id: `${group.scopeId}:${group.normalizedText}`,
    spelling: group.spellings[0]?.text ?? group.normalizedText,
    state: queueStateOf(group),
    counts: {
      rows: group.rowCount,
      products: group.productCount,
      orders: group.orderCount,
    },
    chips: group.sourceRows.map((row) => ({
      id: String(row.id),
      label: `${locationSourceLabel(row.source)} · ${row.label}`,
      stale: row.stale,
    })),
    group,
  };
}

const QUEUE_TABS: readonly ReviewTab<QueueStateParam>[] = [
  { value: 'all', labelKey: 'canonical.queue.tabs.all' },
  { value: 'unlinked', labelKey: 'canonical.queue.tabs.unlinked' },
  { value: 'partial', labelKey: 'canonical.queue.tabs.partial' },
  { value: 'mixed', labelKey: 'canonical.queue.tabs.mixed' },
  { value: 'linked', labelKey: 'canonical.queue.tabs.linked' },
];

const EMPTY_SELECTION: ReviewSelection = { ids: new Set<string>() };

export interface ReviewScopeControl {
  value: number | null;
  onChange: (scope: number | null) => void;
}

export interface ReviewBulkContext {
  selectedIds: ReadonlySet<string>;
  pageRows: readonly GroupQueueRow[];
  canManage: boolean;
  onSelectPage: () => void;
  onClearSelection: () => void;
}

export interface ReviewQueueKeyboard {
  onOpenRow: (row: GroupQueueRow) => void;
}

export interface ReviewQueueProps {
  domain: CanonicalNameDomain;
  canManage: boolean;
  keyboard: ReviewQueueKeyboard;
  renderRow: (row: GroupQueueRow, state: ReviewRowState) => ReactNode;
  renderBulkBar?: (context: ReviewBulkContext) => ReactNode;
  renderUnscopedParents?: (parents: UnscopedParent[]) => ReactNode;
  scopeSlot?: (control: ReviewScopeControl) => ReactNode;
}

function ReviewQueueContent({
  domain,
  canManage,
  keyboard,
  renderRow,
  renderBulkBar,
  renderUnscopedParents,
  scopeSlot,
}: ReviewQueueProps) {
  const { t } = useI18n();
  const config = CANONICAL_DOMAIN_CONFIGS[domain];
  const url = useQueueUrlState();

  const [draft, setDraft] = useState(url.search);
  const debouncedSearch = useDebounce(draft.trim(), 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(QUEUE_DEFAULT_PAGE_SIZE);

  const scopeId = config.hasScope ? url.scope : null;
  const gated = config.hasScope && scopeId === null;
  const tab = url.state;
  const searchForQuery = debouncedSearch || undefined;

  const groupParams: ListGroupsParams = {
    scopeId: scopeId ?? undefined,
    state: tab,
    search: searchForQuery,
    page,
    limit: pageSize,
  };
  const groupsQuery = useSourceGroupsQuery(domain, groupParams, !gated);
  const countParams: ListGroupCountsParams = {
    scopeId: scopeId ?? undefined,
    search: searchForQuery,
  };
  const countsQuery = useGroupCountsQuery(domain, countParams, !gated && config.showTabCounts);

  const groups = groupsQuery.data;
  const total = groups?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (groups !== undefined && page > totalPages) setPage(totalPages);
  }, [groups, page, totalPages]);

  const queryKey = JSON.stringify([tab, scopeId, searchForQuery ?? '', page, pageSize]);
  const [selectionState, setSelectionState] = useState<{ key: string; selection: ReviewSelection }>({
    key: queryKey,
    selection: EMPTY_SELECTION,
  });
  const selection = selectionState.key === queryKey ? selectionState.selection : EMPTY_SELECTION;
  const setSelection = (next: ReviewSelection) => setSelectionState({ key: queryKey, selection: next });

  const rows = (groups?.data ?? []).map(toGroupQueueRow);

  const status: ReviewListStatus = groupsQuery.isError
    ? 'error'
    : groups === undefined
      ? 'loading'
      : groupsQuery.isFetching
        ? 'refetching'
        : rows.length === 0
          ? 'empty'
          : 'ready';

  const hasFilters = draft.trim() !== '' || tab !== DEFAULT_QUEUE_STATE;

  const changeTab = (next: QueueStateParam) => {
    setPage(1);
    url.update({ state: next });
  };

  const changeScope = (next: number | null) => {
    setPage(1);
    url.update({ scope: next });
  };

  const changeSearch = (value: string) => {
    setDraft(value);
    setPage(1);
  };

  const changePageSize = (size: number) => {
    setPageSize(clampQueuePageSize(size));
    setPage(1);
  };

  const clearFilters = () => {
    setDraft('');
    setPage(1);
    url.update({ state: DEFAULT_QUEUE_STATE });
  };

  const pagination: ReviewPagination = {
    currentPage: page,
    totalPages,
    totalItems: total,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    onPageChange: setPage,
    onPrevious: () => setPage(Math.max(1, page - 1)),
    onNext: () => setPage(Math.min(totalPages, page + 1)),
    currentPageSize: pageSize,
    maxPageSize: QUEUE_MAX_PAGE_SIZE,
    showAllPageSizeOption: false,
  };

  const toolbar = (
    <QueueToolbar
      search={draft}
      onSearchChange={changeSearch}
      scope={
        scopeSlot && config.hasScope
          ? scopeSlot({ value: scopeId, onChange: changeScope })
          : undefined
      }
      pageSize={pageSize}
      onPageSizeChange={changePageSize}
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
    />
  );

  const unscopedParents =
    config.hasScope && renderUnscopedParents && groups && groups.unscopedParents.length > 0
      ? renderUnscopedParents(groups.unscopedParents)
      : null;

  if (gated) {
    return (
      <section className="flex flex-col gap-4">
        {toolbar}
        <EmptyPanel variant="no-items" titleKey="canonical.queue.scope.gate" />
      </section>
    );
  }

  return (
    <ReviewListCore<GroupQueueRow, QueueStateParam>
      rows={rows}
      tab={tab}
      tabs={QUEUE_TABS}
      onTabChange={changeTab}
      query={{ search: draft.trim(), hasFilters }}
      onClearFilters={clearFilters}
      selection={selection}
      onSelectionChange={setSelection}
      canManage={canManage}
      status={status}
      onRetry={() => void groupsQuery.refetch()}
      listLabel={t(config.labels.title)}
      emptyVariant={tab === 'unlinked' ? 'queue-clear' : 'no-items'}
      showTabCounts={config.showTabCounts}
      counts={config.showTabCounts ? countsQuery.data : undefined}
      renderRow={renderRow}
      header={
        <>
          {unscopedParents}
          {toolbar}
        </>
      }
      bulkBar={
        renderBulkBar?.({
          selectedIds: selection.ids,
          pageRows: rows,
          canManage,
          onSelectPage: () => setSelection(selectReviewPage(selection, rows)),
          onClearSelection: () => setSelection(EMPTY_SELECTION),
        })
      }
      pagination={pagination}
      keyboard={{ onOpenRow: keyboard.onOpenRow }}
    />
  );
}

export function ReviewQueue(props: ReviewQueueProps) {
  return (
    <Suspense fallback={<QueueSkeleton />}>
      <ReviewQueueContent {...props} />
    </Suspense>
  );
}
