'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Skeleton from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSourceGroupsQuery } from '@/services/canonicalNames';
import type {
  CanonicalName,
  CanonicalNameDomain,
  GroupStateFilter,
  LinkItem,
  SourceGroup,
} from '@/types/canonicalNames';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import SourceGroupRow from './SourceGroupRow';
import UnscopedParentsPanel from './UnscopedParentsPanel';

const STATE_TABS: { value: GroupStateFilter; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'unlinked', label: 'غير مرتبط' },
  { value: 'linked', label: 'مرتبط' },
  { value: 'partial', label: 'مرتبط جزئيا' },
  { value: 'mixed', label: 'مختلط' },
];

const groupKey = (group: Pick<SourceGroup, 'scopeId' | 'normalizedText'>) =>
  `${group.scopeId}:${group.normalizedText}`;

interface SourceGroupsPaneProps {
  domain: CanonicalNameDomain;
  scopeId: number;
  scopeReady: boolean;
  canManage: boolean;
  nameOptions: CanonicalName[];
  initialSearch?: string;
  sourcesRunning?: boolean;
  onRequestLink: (items: LinkItem[], groups: SourceGroup[]) => void;
  onDirectLink: (item: LinkItem) => void;
  onViewMembers: (scopeId: number, normalizedText: string) => void;
}

export default function SourceGroupsPane({
  domain,
  scopeId,
  scopeReady,
  canManage,
  nameOptions,
  initialSearch,
  sourcesRunning,
  onRequestLink,
  onDirectLink,
  onViewMembers,
}: SourceGroupsPaneProps) {
  const [search, setSearch] = useState(initialSearch ?? '');
  const [stateFilter, setStateFilter] = useState<GroupStateFilter>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading, isFetching, isError, refetch } = useSourceGroupsQuery(
    domain,
    {
      scopeId,
      state: stateFilter === 'all' ? undefined : stateFilter,
      search: search || undefined,
      page,
      limit,
    },
  );

  const groupsByKey = useMemo(() => {
    const map = new Map<string, SourceGroup>();
    (data?.data ?? []).forEach((group) => map.set(groupKey(group), group));
    return map;
  }, [data]);

  const nameSelectOptions = nameOptions.map((name) => ({
    key: String(name.id),
    label: name.name,
  }));

  const toggleSelected = (key: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const applyBulkLink = (targetId: string) => {
    const target = nameOptions.find((n) => String(n.id) === targetId);
    if (!target) return;
    const groups = Array.from(selected)
      .map((key) => groupsByKey.get(key))
      .filter((g): g is SourceGroup => !!g);
    const items: LinkItem[] = groups.map((group) => ({
      scopeId: group.scopeId,
      normalizedText: group.normalizedText,
      canonicalNameId: target.id,
    }));
    if (items.length === 0) return;
    onRequestLink(items, groups);
    setSelected(new Set());
  };

  if (!scopeReady) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        اختر المحافظة لعرض المدن
      </p>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-3">
      <Tabs
        value={stateFilter}
        onValueChange={(value) => {
          setStateFilter(value as GroupStateFilter);
          setPage(1);
        }}
      >
        <TabsList>
          {STATE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Input
        placeholder="بحث"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        clearable
        onClear={() => setSearch('')}
      />

      {canManage && selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-2">
          <span className="text-xs text-gray-600">
            {selected.size} محدد
          </span>
          <div className="w-48">
            <SearchableSelect
              options={nameSelectOptions}
              placeholder="ربط المحدد بـ"
              onChange={applyBulkLink}
            />
          </div>
        </div>
      )}

      {isLoading && <PageLoading size="sm" />}

      {isError && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-2">تعذر تحميل البيانات</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && (data?.data.length ?? 0) === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          {sourcesRunning
            ? 'جاري تحميل القوائم لأول مرة…'
            : 'لا توجد أسماء مسجلة لهذا القسم بعد.'}
        </p>
      )}

      {!isLoading && isFetching && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {!isLoading && !isFetching && data && (
        <div className="flex flex-col gap-2">
          {data.data.map((group) => (
            <SourceGroupRow
              key={groupKey(group)}
              domain={domain}
              group={group}
              nameOptions={nameOptions}
              selected={selected.has(groupKey(group))}
              onToggleSelect={(checked) =>
                toggleSelected(groupKey(group), checked)
              }
              onRequestLink={(item, sourceGroup) =>
                onRequestLink([item], [sourceGroup])
              }
              onDirectLink={onDirectLink}
              onUnlink={() =>
                onDirectLink({
                  scopeId: group.scopeId,
                  normalizedText: group.normalizedText,
                  unlink: true,
                })
              }
              onViewMembers={
                domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_NAME ||
                domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION
                  ? () => onViewMembers(group.scopeId, group.normalizedText)
                  : undefined
              }
              canManage={canManage}
            />
          ))}

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
      )}

      {domain === CANONICAL_NAME_DOMAINS.CITY &&
        (data?.unscopedParents ?? []).length > 0 && (
          <UnscopedParentsPanel
            scopeId={scopeId}
            parents={data?.unscopedParents ?? []}
          />
        )}
    </div>
  );
}
