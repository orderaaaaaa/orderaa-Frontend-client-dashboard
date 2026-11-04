'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LiaSearchSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import CopyableCode from '@/components/ui/copyable-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import { getApiErrorStatus } from '@/utils/apiError';
import { useDebounce } from '@/utils/debounce';
import SettlementBatchOrderDialogs from '@/app/dashboard/orders/settlement/components/SettlementBatchOrderDialogs';
import SettlementBatchOrdersPanel from '@/app/dashboard/orders/settlement/components/SettlementBatchOrdersPanel';
import type { SettlementBatchOrder } from '@/lib/api/settlement';
import {
  useSettlementBatchOrdersQuery,
  useSettlementBatchQuery,
} from '@/app/dashboard/orders/settlement/hooks/useSettlementQueries';

const COLLECTIONS_HREF = '/dashboard/orders/settlement/collections';
const DEFAULT_PAGE_SIZE = 25;

function SettlementCollectionLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل التحصيل..." />
    </div>
  );
}

function SettlementCollectionContent() {
  const { batchId } = useParams<{ batchId: string }>();
  const [searchInput, setSearchInput] = useState('');
  const q = useDebounce(searchInput, 300).trim();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [editTarget, setEditTarget] = useState<SettlementBatchOrder | null>(null);
  const [removeTarget, setRemoveTarget] = useState<SettlementBatchOrder | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const batchQuery = useSettlementBatchQuery(batchId);
  const batch = batchQuery.data;

  const ordersQuery = useSettlementBatchOrdersQuery(batchId, { q, page, limit });
  const orders: SettlementBatchOrder[] = ordersQuery.data?.data ?? [];
  const total = ordersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    if (ordersQuery.isSuccess && orders.length === 0 && page > 1) {
      setPage(1);
    }
  }, [ordersQuery.isSuccess, orders.length, page]);

  const backLink = (
    <Link href={COLLECTIONS_HREF} className="text-xs text-primary-text hover:underline w-fit">
      رجوع إلى التحصيلات
    </Link>
  );

  if (batchQuery.isError) {
    const isNotFound = getApiErrorStatus(batchQuery.error) === 404;
    return (
      <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
        {backLink}
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm font-semibold text-red-700">
            {isNotFound ? 'التحصيل غير موجود' : 'تعذّر تحميل التحصيل'}
          </p>
          {!isNotFound && (
            <Button variant="outline" size="sm" onClick={() => batchQuery.refetch()}>
              إعادة المحاولة
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!batch) {
    return <PageLoading message="جاري تحميل التحصيل..." />;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {backLink}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            طلبات التحصيل <CopyableCode value={batch.code} label="نسخ كود التحصيل">{batch.code}</CopyableCode>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {batch.totalAmount} جنيه عن {batch.ordersCount} طلب
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <LiaSearchSolid className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-(--z-raised) pointer-events-none" />
        <Input
          placeholder="ابحث بكود الطلب أو كود الشحن أو اسم العميل أو رقم الهاتف..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          clearable
          onClear={() => setSearchInput('')}
          inputClassName="pr-10 bg-background"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">الطلبات</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="max-sm:h-10"
            onClick={() => setIsAddOpen(true)}
          >
            إضافة طلبات
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {ordersQuery.isError ? (
            <p className="text-sm text-red-700 text-center py-6">تعذّر تحميل طلبات التحصيل</p>
          ) : (
            <SettlementBatchOrdersPanel
              orders={orders}
              isLoading={ordersQuery.isLoading}
              emptyText={q ? 'لا توجد طلبات مطابقة للبحث' : undefined}
              onEdit={setEditTarget}
              onRemove={setRemoveTarget}
            />
          )}
          {total > 0 && (
            <PaginationFooter
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              hasNextPage={page < totalPages}
              hasPreviousPage={page > 1}
              onPageChange={setPage}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              currentPageSize={limit}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>

      <SettlementBatchOrderDialogs
        batchId={batchId}
        editTarget={editTarget}
        onEditClose={() => setEditTarget(null)}
        removeTarget={removeTarget}
        onRemoveClose={() => setRemoveTarget(null)}
        isAddOpen={isAddOpen}
        onAddClose={() => setIsAddOpen(false)}
      />
    </div>
  );
}

export default function SettlementCollectionPage() {
  return (
    <Suspense fallback={<SettlementCollectionLoading />}>
      <SettlementCollectionContent />
    </Suspense>
  );
}
