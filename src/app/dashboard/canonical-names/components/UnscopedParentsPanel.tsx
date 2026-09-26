'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import { useSourceGroupsQuery } from '@/services/canonicalNames';
import type { UnscopedParent } from '@/types/canonicalNames';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import { locationSourceLabel } from '../utils/locationSourceLabel';
import { VisualizedSpelling } from './SourceGroupRow';

interface UnscopedParentCitiesProps {
  scopeId: number;
  parentRowId: number;
}

function UnscopedParentCities({ scopeId, parentRowId }: UnscopedParentCitiesProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const { data, isLoading, isError, refetch } = useSourceGroupsQuery(
    CANONICAL_NAME_DOMAINS.CITY,
    { scopeId, parentRowId, page, limit },
  );

  if (isLoading) return <PageLoading size="sm" />;

  if (isError || !data) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 mb-2">تعذر تحميل البيانات</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (data.data.length === 0) {
    return <p className="text-xs text-gray-500 py-2">لا توجد مدن لهذه المحافظة</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {data.data.map((group) => (
          <li
            key={`${group.scopeId}:${group.normalizedText}`}
            className="flex flex-col gap-1 rounded-md border bg-white px-2 py-1 text-sm"
          >
            <span className="font-medium text-gray-900">
              <VisualizedSpelling text={group.spellings[0]?.text ?? group.normalizedText} />
            </span>
            <div className="flex flex-wrap gap-2">
              {group.sourceRows.map((row) => (
                <span key={row.id} className="text-xs text-gray-500">
                  {locationSourceLabel(row.source)}: <VisualizedSpelling text={row.label} />
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <PaginationFooter
        currentPage={data.page}
        totalPages={Math.max(1, Math.ceil(data.total / data.limit))}
        totalItems={data.total}
        hasNextPage={data.page * data.limit < data.total}
        hasPreviousPage={data.page > 1}
        onPageChange={setPage}
        onPrevious={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        currentPageSize={limit}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
      />
    </div>
  );
}

interface UnscopedParentsPanelProps {
  scopeId: number;
  parents: UnscopedParent[];
}

export default function UnscopedParentsPanel({
  scopeId,
  parents,
}: UnscopedParentsPanelProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (parentRowId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(parentRowId)) next.delete(parentRowId);
      else next.add(parentRowId);
      return next;
    });
  };

  return (
    <div className="mt-4 rounded-md border border-dashed p-3">
      <p className="text-xs font-medium text-gray-500 mb-1">
        مدن بمحافظة غير مرتبطة
      </p>
      <p className="text-xs text-gray-400 mb-2">
        لا يمكن ربط المدينة قبل ربط صف المحافظة
      </p>
      <ul className="flex flex-col gap-2">
        {parents.map((parent) => {
          const isOpen = expanded.has(parent.parentRowId);
          return (
            <li key={parent.parentRowId} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    {locationSourceLabel(parent.parentSource)}
                  </span>
                  <VisualizedSpelling text={parent.parentLabel} />
                  <Badge variant="outline">{parent.cityCount} مدينة</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => toggle(parent.parentRowId)}
                  >
                    {isOpen ? 'إخفاء المدن' : 'عرض المدن'}
                  </Button>
                  <Link
                    href={`/dashboard/canonical-names/governorates?search=${encodeURIComponent(parent.parentLabel)}`}
                    className="text-xs text-primary underline"
                  >
                    اربط المحافظة أولا
                  </Link>
                </div>
              </div>
              {isOpen && (
                <UnscopedParentCities
                  scopeId={scopeId}
                  parentRowId={parent.parentRowId}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
