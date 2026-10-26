'use client';

import { formatDate } from '@/utils/format';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Trash2, Wallet } from 'lucide-react';
import { LiaSearchSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import { Breadcrumb } from '@/components/dashboard-layout';
import PageLoading from '@/components/ui/page-loading';
import CopyableCode from '@/components/ui/copyable-code';
import PaginationFooter from '@/components/ui/pagination-footer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getApiErrorMessage } from '@/utils/apiError';
import { useDebounce } from '@/utils/debounce';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/generated/permission-codes';
import DeleteSettlementBatchDialog from '@/app/dashboard/orders/settlement/components/DeleteSettlementBatchDialog';
import SettlementBatchOrderDialogs from '@/app/dashboard/orders/settlement/components/SettlementBatchOrderDialogs';
import SettlementBatchOrdersPanel from '@/app/dashboard/orders/settlement/components/SettlementBatchOrdersPanel';
import type {
  SettlementBatchListItem,
  SettlementBatchOrder,
  SettlementOriginCounts,
} from '@/lib/api/settlement';
import {
  useSettlementBatchOrdersQuery,
  useSettlementBatchesQuery,
  type SettlementBatchStatusFilter,
} from '@/app/dashboard/orders/settlement/hooks/useSettlementQueries';

type StatusFilter = SettlementBatchStatusFilter;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'OPEN', label: 'مفتوح' },
  { value: 'CONFIRMED', label: 'مكتمل' },
  { value: 'ALL', label: 'الكل' },
];

const ORIGIN_LABELS: { key: keyof SettlementOriginCounts; label: string }[] = [
  { key: 'delivered', label: 'مُسلَّم' },
  { key: 'returned', label: 'مرتجع' },
  { key: 'withDrivers', label: 'مع المندوب' },
  { key: 'other', label: 'أخرى' },
];

const BATCHES_PAGE_SIZE = 20;
const INLINE_ORDERS_PARAMS = { q: '', page: 1, limit: 100 };
const COLLECTIONS_HREF = '/dashboard/orders/settlement/collections';

interface BatchDeleteButtonProps {
  batch: SettlementBatchListItem;
  onRequestDelete: (batch: SettlementBatchListItem) => void;
}

function BatchDeleteButton({ batch, onRequestDelete }: BatchDeleteButtonProps) {
  if (batch.ordersCount > 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="حذف التحصيل"
              disabled
              className="text-red-600"
            >
              <Trash2 />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>لا يمكن حذف تحصيل يحتوي على طلبات</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="حذف التحصيل"
      className="text-red-600"
      onClick={(e) => {
        e.stopPropagation();
        onRequestDelete(batch);
      }}
    >
      <Trash2 />
    </Button>
  );
}

export default function CollectionsPage() {
  const [status, setStatus] = useState<StatusFilter>('OPEN');
  const [searchInput, setSearchInput] = useState('');
  const q = useDebounce(searchInput, 300).trim();
  const effectiveStatus: StatusFilter = q ? 'ALL' : status;
  const [page, setPage] = useState(1);
  const limit = BATCHES_PAGE_SIZE;
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatchListItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<SettlementBatchOrder | null>(null);
  const [editTarget, setEditTarget] = useState<SettlementBatchOrder | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SettlementBatchListItem | null>(null);

  const canDeleteBatch = useHasPermission(PERMISSION_CODES.ORDERS_SETTLEMENT_DELETE);

  const batchesQuery = useSettlementBatchesQuery(effectiveStatus, {
    q,
    page,
    limit,
  });
  const batches = batchesQuery.data?.data ?? [];
  const total = batchesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const loadFailed =
    batchesQuery.isError && !batchesQuery.data && !batchesQuery.isFetching;
  const isSwitching = batchesQuery.isPlaceholderData;
  const batchesError = batchesQuery.error;

  const selected =
    batches.find((batch) => batch.id === selectedBatch?.id) ?? selectedBatch;

  const ordersQuery = useSettlementBatchOrdersQuery(
    selected?.id ?? null,
    INLINE_ORDERS_PARAMS,
  );
  const orders: SettlementBatchOrder[] = ordersQuery.data?.data ?? [];
  const ordersError = ordersQuery.error;

  useEffect(() => {
    if (batchesError) {
      toast.error(getApiErrorMessage(batchesError, 'تعذر تحميل التحصيلات'));
    }
  }, [batchesError]);

  useEffect(() => {
    if (ordersError) {
      toast.error('تعذر تحميل طلبات التحصيل');
    }
  }, [ordersError]);

  useEffect(() => {
    setPage(1);
  }, [effectiveStatus, q]);

  useEffect(() => {
    if (batchesQuery.isSuccess && batches.length === 0 && page > 1) {
      setPage(1);
    }
  }, [batchesQuery.isSuccess, batches.length, page]);

  const handleBatchDeleted = () => {
    if (deleteTarget && selectedBatch?.id === deleteTarget.id) {
      setSelectedBatch(null);
    }
  };

  if (batchesQuery.isLoading) {
    return <PageLoading message="جاري تحميل التحصيلات..." />;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
      <Breadcrumb items={[{ title: 'التحصيلات' }, { title: 'جميع التحصيلات' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            جميع التحصيلات
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            كل تحصيل بكوده وإجماليه وعدد طلباته
          </p>
        </div>

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={effectiveStatus === f.value ? 'default' : 'outline'}
              size="sm"
              aria-pressed={effectiveStatus === f.value}
              className="rounded-full text-xs px-4 max-sm:h-10 max-sm:flex-1"
              onClick={() => {
                setStatus(f.value);
                setSearchInput('');
              }}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative max-w-md">
        <LiaSearchSolid className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
        <Input
          placeholder="ابحث بكود التحصيل أو كود الطلب أو كود الشحن..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          clearable
          onClear={() => setSearchInput('')}
          inputClassName="pr-10 bg-white"
        />
      </div>

      {loadFailed ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm font-semibold text-red-700">تعذّر تحميل التحصيلات</p>
          <Button variant="outline" size="sm" onClick={() => batchesQuery.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : batchesQuery.isFetching && !batchesQuery.data ? (
        <PageLoading size="sm" message="جاري تحميل التحصيلات..." className="py-12 min-h-0" />
      ) : batches.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          {q
            ? 'لا توجد تحصيلات مطابقة للبحث'
            : 'لا توجد تحصيلات بعد — ارفع شيت تحصيل للبدء'}
        </p>
      ) : (
        <>
          <div
            aria-busy={isSwitching}
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 transition-opacity ${isSwitching ? 'opacity-60' : ''}`}
          >
            {batches.map((batch) => (
              <div
                key={batch.id}
                role="button"
                tabIndex={0}
                aria-pressed={selected?.id === batch.id}
                onClick={() => setSelectedBatch(batch)}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedBatch(batch);
                  }
                }}
                className={`border rounded-xl p-4 flex flex-col gap-3 bg-white cursor-pointer text-right transition-colors ${
                  selected?.id === batch.id
                    ? 'border-primary'
                    : 'border-gray-200 hover:border-primary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Wallet className="w-5 h-5 text-primary shrink-0" />
                    <CopyableCode value={batch.code} label="نسخ كود التحصيل" className="min-w-0 max-w-full">
                      <span className="font-bold text-gray-900 truncate">
                        {batch.code}
                      </span>
                    </CopyableCode>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        batch.status === 'OPEN'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {batch.status === 'OPEN' ? 'مفتوح' : 'مكتمل'}
                    </span>
                    {canDeleteBatch && (
                      <BatchDeleteButton batch={batch} onRequestDelete={setDeleteTarget} />
                    )}
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">الإجمالي</span>
                    {/* A decimal string, rendered as-is. */}
                    <span className="text-lg font-bold text-primary">
                      {batch.totalAmount} جنيه
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">عدد الطلبات</span>
                    <span className="text-lg font-bold">{batch.ordersCount}</span>
                  </div>
                </div>

                <dl className="grid grid-cols-4 gap-2 border-t border-gray-100 pt-2">
                  {ORIGIN_LABELS.map(({ key, label }) => (
                    <div key={key} className="flex flex-col items-center gap-0.5">
                      <dt className="text-[10px] text-muted-foreground">{label}</dt>
                      <dd className="text-sm font-semibold">{batch.origins[key]}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(batch.createdAt)}
                    {batch.actorName ? ` — ${batch.actorName}` : ''}
                  </span>
                  {batch.status === 'OPEN' && (
                    <Link
                      href="/dashboard/orders/settlement/upload"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      متابعة الرفع
                    </Link>
                  )}
                </div>

                {/* An open collection's total is still moving. */}
                {batch.status === 'OPEN' && (
                  <span className="text-[10px] text-amber-600">
                    الإجمالي غير نهائي — التحصيل ما زال مفتوحًا
                  </span>
                )}
              </div>
            ))}
          </div>

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
          />
        </>
      )}

      {selected && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex flex-wrap items-center gap-1.5">
              طلبات التحصيل <CopyableCode value={selected.code} label="نسخ كود التحصيل">{selected.code}</CopyableCode>
              — {selected.totalAmount} جنيه عن {selected.ordersCount} طلب
              <Link
                href={`${COLLECTIONS_HREF}/${selected.id}`}
                className="text-xs font-normal text-primary hover:underline"
              >
                فتح في صفحة مستقلة
              </Link>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="max-sm:h-10 max-sm:flex-1"
                onClick={() => setIsAddOpen(true)}
              >
                إضافة طلبات
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="max-sm:h-10 max-sm:flex-1"
                onClick={() => setSelectedBatch(null)}
              >
                إغلاق
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SettlementBatchOrdersPanel
              orders={orders}
              isLoading={ordersQuery.isLoading}
              onEdit={(row) => setEditTarget(row)}
              onRemove={(row) => setRemoveTarget(row)}
            />
          </CardContent>
        </Card>
      )}

      <SettlementBatchOrderDialogs
        batchId={selected?.id ?? ''}
        editTarget={editTarget}
        onEditClose={() => setEditTarget(null)}
        removeTarget={removeTarget}
        onRemoveClose={() => setRemoveTarget(null)}
        isAddOpen={isAddOpen}
        onAddClose={() => setIsAddOpen(false)}
      />

      <DeleteSettlementBatchDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        batchId={deleteTarget?.id ?? ''}
        batchCode={deleteTarget?.code ?? ''}
        onSuccess={handleBatchDeleted}
      />
    </div>
  );
}
