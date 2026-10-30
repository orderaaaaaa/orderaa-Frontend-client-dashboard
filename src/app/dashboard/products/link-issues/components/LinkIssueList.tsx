'use client';

import type { ReactNode } from 'react';
import PaginationFooter from '@/components/ui/pagination-footer';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { useI18n } from '@/i18n/I18nProvider';
import type { LinkIssuePage } from '../types/linkIssues';

export const LINK_ISSUE_PAGE_LIMIT = 20;

interface LinkIssueListQuery<T> {
  data: LinkIssuePage<T> | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

interface LinkIssueListProps<T> {
  query: LinkIssueListQuery<T>;
  page: number;
  onPageChange: (page: number) => void;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}

export function LinkIssueList<T>({
  query,
  page,
  onPageChange,
  getKey,
  renderItem,
}: LinkIssueListProps<T>) {
  const { t } = useI18n();

  if (query.isLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        error={query.error}
        fallback={t('linkIssues.common.loadError')}
        onRetry={query.refetch}
      />
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return <EmptyState title={t('linkIssues.common.empty')} />;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {rows.map((item) => (
          <li key={getKey(item)}>{renderItem(item)}</li>
        ))}
      </ul>
      <PaginationFooter
        currentPage={page}
        totalPages={query.data?.totalPages ?? 1}
        totalItems={query.data?.total ?? rows.length}
        hasNextPage={page < (query.data?.totalPages ?? 1)}
        hasPreviousPage={page > 1}
        onPageChange={onPageChange}
        onPrevious={() => onPageChange(page - 1)}
        onNext={() => onPageChange(page + 1)}
        currentPageSize={LINK_ISSUE_PAGE_LIMIT}
      />
    </div>
  );
}
