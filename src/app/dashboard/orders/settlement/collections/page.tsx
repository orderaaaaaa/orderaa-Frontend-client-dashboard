'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { ChevronLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLoading from '@/components/ui/page-loading';
import {
  listSettlementBatches,
  listSettlementBatchOrders,
  type SettlementBatchListItem,
  type SettlementBatchOrder,
} from '@/lib/api/settlement';

type StatusFilter = 'ALL' | 'OPEN' | 'CONFIRMED';

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'OPEN', label: 'مفتوح' },
  { value: 'CONFIRMED', label: 'مكتمل' },
];

export default function CollectionsPage() {
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [batches, setBatches] = useState<SettlementBatchListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selected, setSelected] = useState<SettlementBatchListItem | null>(null);
  const [orders, setOrders] = useState<SettlementBatchOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    listSettlementBatches({
      status: status === 'ALL' ? undefined : status,
      limit: 50,
    })
      .then((result) => setBatches(result.data))
      .catch(() => toast.error('تعذر تحميل التحصيلات'))
      .finally(() => setIsLoading(false));
  }, [status]);

  const openBatch = useCallback(async (batch: SettlementBatchListItem) => {
    setSelected(batch);
    setIsLoadingOrders(true);
    try {
      const result = await listSettlementBatchOrders(batch.id, { limit: 100 });
      setOrders(result.data);
    } catch {
      toast.error('تعذر تحميل طلبات التحصيل');
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  if (isLoading) {
    return <PageLoading message="جاري تحميل التحصيلات..." />;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
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
              className="rounded-full text-xs px-4"
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {batches.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          لا توجد تحصيلات بعد — ارفع شيت تحصيل للبدء
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {batches.map((batch) => (
            <div
              key={batch.id}
              onClick={() => openBatch(batch)}
              className={`border rounded-xl p-4 flex flex-col gap-3 bg-white cursor-pointer transition-colors ${
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
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">
              طلبات التحصيل {selected.code} — {selected.totalAmount} جنيه عن{' '}
              {selected.ordersCount} طلب
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              إغلاق
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <PageLoading size="sm" className="py-6 min-h-0" />
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                لا توجد طلبات في هذا التحصيل
              </p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-right font-medium">كود الطلب</th>
                      <th className="px-4 py-2 text-right font-medium">كود الشحن</th>
                      <th className="px-4 py-2 text-right font-medium">العميل</th>
                      <th className="px-4 py-2 text-right font-medium">المبلغ في هذا التحصيل</th>
                      <th className="px-4 py-2 text-right font-medium">الحالة وقتها</th>
                      <th className="px-4 py-2 text-right font-medium">الحالة الآن</th>
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
                          <td className="px-4 py-2">{row.targetStatus}</td>
                          <td
                            className={`px-4 py-2 ${moved ? 'text-amber-700 font-semibold' : ''}`}
                          >
                            {row.currentStatus}
                            {moved && (
                              <ChevronLeft className="inline w-3 h-3 mr-1" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
