'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import PageLoading from '@/components/ui/page-loading';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/utils/debounce';
import { useCanonicalNamesQuery } from '@/services/canonicalNames';
import type { CanonicalName, CanonicalNameDomain } from '@/types/canonicalNames';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import { useHeldData } from '../hooks/useHeldData';

interface NameCardProps {
  name: CanonicalName;
  domain: CanonicalNameDomain;
  canManage: boolean;
  onRename: (name: CanonicalName) => void;
  onDelete: (name: CanonicalName) => void;
  onViewImpact: (name: CanonicalName) => void;
}

function NameCard({
  name,
  domain,
  canManage,
  onRename,
  onDelete,
  onViewImpact,
}: NameCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `name:${name.id}`,
    data: { nameId: name.id, nameName: name.name },
  });
  const isAttributeDomain =
    domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_NAME ||
    domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION;
  const countLabel = isAttributeDomain
    ? `مرتبط بـ ${name.rowCount} عنصر في ${name.productCount} منتج`
    : `مرتبط بـ ${name.orderCount} طلب`;

  return (
    <div ref={setNodeRef}>
      <Card className={cn('p-3 gap-2', isOver && 'border-primary bg-primary/5')}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">{name.name}</span>
            {name.isSystem && <Badge variant="secondary">نظامي</Badge>}
          </div>
        </div>
        <p className="text-xs text-gray-500">{countLabel}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="min-h-10" onClick={() => onViewImpact(name)}>
            عرض التأثير
          </Button>
          {canManage && !name.isSystem && (
            <>
              <Button variant="outline" size="sm" className="min-h-10" onClick={() => onRename(name)}>
                إعادة تسمية
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-10 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDelete(name)}
              >
                حذف
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

interface NamesPaneProps {
  domain: CanonicalNameDomain;
  scopeId: number;
  canManage: boolean;
  onCreate: () => void;
  onRename: (name: CanonicalName) => void;
  onDelete: (name: CanonicalName) => void;
  onViewImpact: (name: CanonicalName) => void;
}

export default function NamesPane({
  domain,
  scopeId,
  canManage,
  onCreate,
  onRename,
  onDelete,
  onViewImpact,
}: NamesPaneProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { data, isFetching, isError, refetch } = useCanonicalNamesQuery(
    domain,
    { scopeId, search: debouncedSearch || undefined },
  );
  const names = useHeldData(data, `${domain}:${scopeId}`);
  const isLoading = names === undefined && !isError;
  const canCreate = canManage;

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="min-w-0 flex-1 basis-48"
          placeholder="بحث"
          aria-label="بحث في الأسماء الموحدة"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          clearable
          onClear={() => setSearch('')}
        />
        {canCreate && (
          <Button size="sm" onClick={onCreate} className="min-h-10 shrink-0">
            <Plus className="h-4 w-4" />
            إضافة اسم
          </Button>
        )}
      </div>

      {isLoading && <PageLoading size="sm" />}

      {isError && names === undefined && (
        <div role="alert" className="text-center py-8">
          <p className="text-sm text-gray-500 mb-2">تعذر تحميل البيانات</p>
          <Button variant="outline" size="sm" className="min-h-10" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {names !== undefined && names.length === 0 && !isFetching && (
        <p className="text-sm text-gray-500 text-center py-8">
          لا توجد أسماء موحدة بعد. أضف اسما أو استخدم اقتراح الربط.
        </p>
      )}

      {names !== undefined && (
        <div
          className={cn('flex flex-col gap-2 transition-opacity', isFetching && 'opacity-60')}
          aria-busy={isFetching}
        >
          {(names ?? []).map((name) => (
            <NameCard
              key={name.id}
              name={name}
              domain={domain}
              canManage={canManage}
              onRename={onRename}
              onDelete={onDelete}
              onViewImpact={onViewImpact}
            />
          ))}
        </div>
      )}
    </div>
  );
}
