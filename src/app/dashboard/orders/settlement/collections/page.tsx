'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { ChevronLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/dashboard-layout';
import PageLoading from '@/components/ui/page-loading';
import CopyButton from '@/components/ui/copy-button';
import { getApiErrorMessage } from '@/utils/apiError';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import {
  SettlementShippingColumnHeaders,
  SettlementShippingColumnCells,
} from '@/app/dashboard/orders/settlement/components/SettlementShippingColumns';
import RemoveSettlementOrderDialog from '@/app/dashboard/orders/settlement/components/RemoveSettlementOrderDialog';
import EditSettlementAmountDialog from '@/app/dashboard/orders/settlement/components/EditSettlementAmountDialog';
import AddSettlementOrdersDialog from '@/app/dashboard/orders/settlement/components/AddSettlementOrdersDialog';
import {
  SettlementMobileList,
  SettlementMobileRow,
} from '@/app/dashboard/orders/settlement/components/SettlementMobileList';
import type {
  SettlementBatchListItem,
  SettlementBatchOrder,
} from '@/lib/api/settlement';
import {
  useSettlementBatchOrdersQuery,
  useSettlementBatchesQuery,
  useSettlementSync,
  type SettlementBatchStatusFilter,
} from '@/app/dashboard/orders/settlement/hooks/useSettlementQueries';

type StatusFilter = SettlementBatchStatusFilter;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'OPEN', label: 'مفتوح' },
  { value: 'CONFIRMED', label: 'مكتمل' },
  { value: 'ALL', label: 'الكل' },
];

export default function CollectionsPage() {
  const [status, setStatus] = useState<StatusFilter>('OPEN');
  const { getStatusLabel } = useStatusLabel();
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatchListItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<SettlementBatchOrder | null>(null);
  const [editTarget, setEditTarget] = useState<SettlementBatchOrder | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const batchesQuery = useSettlementBatchesQuery(status);
  const batches = batchesQuery.data?.data ?? [];
  const loadFailed =
    batchesQuery.isError && !batchesQuery.data && !batchesQuery.isFetching;
  const isSwitching = batchesQuery.isPlaceholderData;
  const batchesError = batchesQuery.error;

  const selected =
    batches.find((batch) => batch.id === selectedBatch?.id) ?? selectedBatch;

  const ordersQuery = useSettlementBatchOrdersQuery(selected?.id ?? null);
  const orders: SettlementBatchOrder[] = ordersQuery.data?.data ?? [];
  const isLoadingOrders = ordersQuery.isLoading;
  const ordersError = ordersQuery.error;

  const syncSettlement = useSettlementSync();

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

  const openBatch = useCallback((batch: SettlementBatchListItem) => {
    setSelectedBatch(batch);
  }, []);

  const handleEdited = useCallback(async () => {
    await syncSettlement();
    toast.success('تم تحديث التحصيل');
  }, [syncSettlement]);

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
              variant={status === f.value ? 'default' : 'outline'}
              size="sm"
              aria-pressed={status === f.value}
              className="rounded-full text-xs px-4 max-sm:h-10 max-sm:flex-1"
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
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
          لا توجد تحصيلات بعد — ارفع شيت تحصيل للبدء
        </p>
      ) : (
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
              onClick={() => openBatch(batch)}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openBatch(batch);
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
                  <span className="font-bold text-gray-900 truncate">
                    {batch.code}
                  </span>
                  <CopyButton value={batch.code} label="نسخ كود التحصيل" />
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    batch.status === 'OPEN'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {batch.status === 'OPEN' ? 'مفتوح' : 'مكتمل'}
                </span>
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

              <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
                <span className="text-[11px] text-muted-foreground">
                  {new Date(batch.createdAt).toLocaleDateString('ar-EG')}
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
      )}

      {selected && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex flex-wrap items-center gap-1.5">
              طلبات التحصيل {selected.code}
              <CopyButton value={selected.code} label="نسخ كود التحصيل" />
              — {selected.totalAmount} جنيه عن {selected.ordersCount} طلب
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
            {isLoadingOrders ? (
              <PageLoading size="sm" className="py-6 min-h-0" />
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                لا توجد طلبات في هذا التحصيل
              </p>
            ) : (
              <>
                <SettlementMobileList>
                  {orders.map((row) => {
                    const moved = row.currentStatus !== row.targetStatus;
                    return (
                      <SettlementMobileRow
                        key={row.orderId}
                        fields={[
                          {
                            label: 'كود الطلب',
                            value: (
                              <span className="flex flex-wrap items-center gap-2 font-mono">
                                <Link
                                  href={`/dashboard/orders/${row.orderId}`}
                                  className="text-primary hover:underline"
                                >
                                  {row.orderCode}
                                </Link>
                                {row.isDeleted && (
                                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-sans">
                                    محذوف
                                  </span>
                                )}
                              </span>
                            ),
                          },
                          { label: 'المبلغ في هذا التحصيل', value: <span className="font-semibold">{row.amount}</span> },
                          { label: 'كود الشحن', value: <span className="font-mono">{row.shippingCode ?? '—'}</span> },
                          { label: 'العميل', value: row.customerName ?? '—' },
                          { label: 'الحالة وقتها', value: getStatusLabel(row.targetStatus) },
                          {
                            label: 'الحالة الآن',
                            value: (
                              <span className={moved ? 'text-amber-700 font-semibold' : undefined}>
                                {getStatusLabel(row.currentStatus)}
                              </span>
                            ),
                          },
                        ]}
                        shipping={row.shipping}
                        actions={
                          row.isDeleted ? undefined : (
                            <>
                              <Button
                                variant="outline"
                                className="h-10 flex-1"
                                onClick={() => setEditTarget(row)}
                              >
                                تعديل المبلغ
                              </Button>
                              <Button
                                variant="outline"
                                className="h-10 flex-1"
                                onClick={() => setRemoveTarget(row)}
                              >
                                إزالة
                              </Button>
                            </>
                          )
                        }
                      />
                    );
                  })}
                </SettlementMobileList>
                <div className="hidden sm:block rounded-md border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-right font-medium">كود الطلب</th>
                        <th className="px-4 py-2 text-right font-medium">كود الشحن</th>
                        <th className="px-4 py-2 text-right font-medium">العميل</th>
                        <th className="px-4 py-2 text-right font-medium">المبلغ في هذا التحصيل</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة وقتها</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة الآن</th>
                        <SettlementShippingColumnHeaders />
                        <th className="px-4 py-2 text-right font-medium">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((row) => {
                        // Showing both is the point: an order can move on after
                        // it was settled.
                        const moved = row.currentStatus !== row.targetStatus;
                        return (
                          <tr key={row.orderId} className="border-t">
                            <td className="px-4 py-2 font-mono">
                              <Link
                                href={`/dashboard/orders/${row.orderId}`}
                                className="text-primary hover:underline"
                              >
                                {row.orderCode}
                              </Link>
                              {row.isDeleted && (
                                <span className="mr-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                  محذوف
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 font-mono">
                              {row.shippingCode ?? '—'}
                            </td>
                            <td className="px-4 py-2">{row.customerName ?? '—'}</td>
                            <td className="px-4 py-2 font-semibold">{row.amount}</td>
                            <td className="px-4 py-2">{getStatusLabel(row.targetStatus)}</td>
                            <td
                              className={`px-4 py-2 ${moved ? 'text-amber-700 font-semibold' : ''}`}
                            >
                              {getStatusLabel(row.currentStatus)}
                              {moved && (
                                <ChevronLeft className="inline w-3 h-3 mr-1" />
                              )}
                            </td>
                            <SettlementShippingColumnCells shipping={row.shipping} />
                            <td className="px-4 py-2">
                              {!row.isDeleted && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditTarget(row)}
                                  >
                                    تعديل المبلغ
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setRemoveTarget(row)}
                                  >
                                    إزالة
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <RemoveSettlementOrderDialog
        isOpen={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        batchId={selected?.id ?? ''}
        orderId={removeTarget?.orderId ?? 0}
        orderStatus={removeTarget?.currentStatus ?? ''}
        onSuccess={async () => {
          await handleEdited();
          setRemoveTarget(null);
        }}
      />

      <EditSettlementAmountDialog
        isOpen={editTarget !== null}
        onClose={() => setEditTarget(null)}
        batchId={selected?.id ?? ''}
        orderId={editTarget?.orderId ?? 0}
        currentAmount={editTarget?.amount ?? '0.00'}
        onSuccess={async () => {
          await handleEdited();
          setEditTarget(null);
        }}
      />

      <AddSettlementOrdersDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        batchId={selected?.id ?? ''}
        onSuccess={handleEdited}
      />
    </div>
  );
}
