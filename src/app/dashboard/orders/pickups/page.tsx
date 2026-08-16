'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLoading from '@/components/ui/page-loading';
import { ImageGalleryModal } from '@/components/receipts/ImageGalleryModal';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import {
  usePickupQuery,
  usePickupsQuery,
  useReviewPickup,
  type PickupCard,
} from '@/services/pickups';

type ReviewFilter = 'ALL' | 'REVIEWED' | 'PENDING';

const FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'PENDING', label: 'بانتظار المراجعة' },
  { value: 'REVIEWED', label: 'تمت مراجعتها' },
];

export default function PickupsPage() {
  const [filter, setFilter] = useState<ReviewFilter>('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const { getStatusLabel } = useStatusLabel();
  const { mutate: review, isPending: isReviewing } = useReviewPickup();

  const { data, isLoading } = usePickupsQuery({
    reviewed:
      filter === 'ALL' ? undefined : filter === 'REVIEWED' ? true : false,
    limit: 50,
  });
  const { data: detail, isLoading: isLoadingDetail } = usePickupQuery(
    selectedId ?? undefined,
  );

  const pickups = data?.data ?? [];

  const renderReviewState = (pickup: PickupCard) =>
    pickup.reviewedAt ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
        <CheckCircle2 className="w-3.5 h-3.5" />
        روجعت
        {pickup.reviewedByName ? ` — ${pickup.reviewedByName}` : ''}
        {` · ${new Date(pickup.reviewedAt).toLocaleDateString('ar-EG')}`}
      </span>
    ) : (
      <span className="text-xs font-semibold text-amber-600">
        بانتظار المراجعة
      </span>
    );

  if (isLoading) {
    return <PageLoading message="جاري تحميل عمليات البيك اب..." />;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">بيك اب</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            عمليات تسليم الشحنات لشركة الشحن، بصورة الإيصال وطلبات كل عملية
          </p>
        </div>

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              className="rounded-full text-xs px-4"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {pickups.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-12">
          لا توجد عمليات بيك اب
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pickups.map((pickup) => (
            <div
              key={pickup.id}
              onClick={() =>
                setSelectedId(selectedId === pickup.id ? null : pickup.id)
              }
              className={`border rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-colors ${
                selectedId === pickup.id
                  ? 'border-primary'
                  : 'border-gray-200 hover:border-primary/40'
              } ${pickup.reviewedAt ? 'bg-green-50/40' : 'bg-white'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 font-mono">
                    {pickup.code}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(pickup.createdAt).toLocaleDateString('ar-EG')}
                    {pickup.submittedByName
                      ? ` — ${pickup.submittedByName}`
                      : ''}
                  </p>
                  {pickup.shipmentPickupCode && (
                    <p className="text-[11px] text-gray-400">
                      كود الشركة: {pickup.shipmentPickupCode}
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold text-primary shrink-0">
                  {pickup.ordersCount} طلب
                </span>
              </div>

              {/* One image control, not two: a pickup has a single image field,
                  so a second one would open an empty viewer. */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full text-xs w-fit"
                disabled={!pickup.receiptImageUrl}
                title={pickup.receiptImageUrl ? undefined : 'لا توجد صورة إيصال'}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  setImage(pickup.receiptImageUrl);
                }}
              >
                <FileImage className="w-3.5 h-3.5" />
                صورة الإيصال
              </Button>

              <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
                {renderReviewState(pickup)}
                {!pickup.reviewedAt && (
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full text-xs px-4"
                    disabled={isReviewing}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      review(pickup.id);
                    }}
                  >
                    تم المراجعة
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base font-mono">
                {detail?.code ?? `#${selectedId}`}
                {detail ? ` — ${detail.ordersCount} طلب` : ''}
              </CardTitle>
              {detail && <div className="mt-1">{renderReviewState(detail)}</div>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
              إغلاق
            </Button>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {isLoadingDetail || !detail ? (
              <PageLoading size="sm" className="py-6 min-h-0" />
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    disabled={!detail.receiptImageUrl}
                    onClick={() => setImage(detail.receiptImageUrl)}
                  >
                    <FileImage className="w-3.5 h-3.5" />
                    صورة الإيصال
                  </Button>
                  {!detail.reviewedAt && (
                    <Button
                      size="sm"
                      className="rounded-full text-xs px-4"
                      disabled={isReviewing}
                      onClick={() => review(detail.id)}
                    >
                      تم المراجعة
                    </Button>
                  )}
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-right font-medium">كود الطلب</th>
                        <th className="px-4 py-2 text-right font-medium">العميل</th>
                        <th className="px-4 py-2 text-right font-medium">الحالة الآن</th>
                        <th className="px-4 py-2 text-right font-medium">شركة الشحن</th>
                        <th className="px-4 py-2 text-right font-medium">المحافظة</th>
                        <th className="px-4 py-2 text-right font-medium">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.orders.map((order) => (
                        <tr key={order.orderId} className="border-t">
                          <td className="px-4 py-2 font-mono">
                            <Link
                              href={`/dashboard/orders/${order.orderId}`}
                              className="text-primary hover:underline"
                            >
                              {order.code}
                            </Link>
                            {order.isDeleted && (
                              <span className="mr-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                محذوف
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">{order.customerName ?? '—'}</td>
                          {/* Orders move on after the pickup; the current
                              status is shown rather than filtered out. */}
                          <td className="px-4 py-2">
                            {getStatusLabel(order.status ?? '') || '—'}
                          </td>
                          <td className="px-4 py-2">
                            {order.shippingCompany ?? '—'}
                          </td>
                          <td className="px-4 py-2">{order.governorate ?? '—'}</td>
                          <td className="px-4 py-2">
                            {order.totalCost === null
                              ? '—'
                              : `${order.totalCost.toLocaleString()} جنيه`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* The same viewer T26 built — a pickup simply supplies one image. */}
      <ImageGalleryModal
        isOpen={image !== null}
        onClose={() => setImage(null)}
        title="صورة إيصال البيك اب"
        images={image ? [image] : []}
      />
    </div>
  );
}
