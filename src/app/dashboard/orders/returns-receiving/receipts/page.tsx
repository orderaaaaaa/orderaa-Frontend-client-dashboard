'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, FileImage, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLoading from '@/components/ui/page-loading';
import { ImageGalleryModal } from '@/components/receipts/ImageGalleryModal';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import {
  useReturnReceiptQuery,
  useReturnReceiptsQuery,
  useReviewReturnReceipt,
  type ReturnReceiptCard,
} from '@/services/returnReceipts';

type ReviewFilter = 'ALL' | 'REVIEWED' | 'PENDING';

const FILTERS: { value: ReviewFilter; label: string }[] = [
  // Defaults to ALL: hiding reviewed receipts would make the page look empty
  // and lose the audit value.
  { value: 'ALL', label: 'الكل' },
  { value: 'PENDING', label: 'بانتظار المراجعة' },
  { value: 'REVIEWED', label: 'تمت مراجعتها' },
];

export default function ReturnReceiptsPage() {
  const [filter, setFilter] = useState<ReviewFilter>('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [gallery, setGallery] = useState<{ title: string; images: string[] } | null>(
    null,
  );

  const { getStatusLabel } = useStatusLabel();
  const { mutate: review, isPending: isReviewing } = useReviewReturnReceipt();

  const { data, isLoading } = useReturnReceiptsQuery({
    reviewed:
      filter === 'ALL' ? undefined : filter === 'REVIEWED' ? true : false,
    limit: 50,
  });
  const { data: detail, isLoading: isLoadingDetail } =
    useReturnReceiptQuery(selectedId ?? undefined);

  const receipts = data?.data ?? [];

  const openGallery = (title: string, images: string[]) =>
    setGallery({ title, images });

  const renderReviewState = (receipt: ReturnReceiptCard) =>
    receipt.reviewedAt ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
        <CheckCircle2 className="w-3.5 h-3.5" />
        روجعت
        {receipt.reviewedByName ? ` — ${receipt.reviewedByName}` : ''}
        {` · ${new Date(receipt.reviewedAt).toLocaleDateString('ar-EG')}`}
      </span>
    ) : (
      <span className="text-xs font-semibold text-amber-600">
        بانتظار المراجعة
      </span>
    );

  if (isLoading) {
    return <PageLoading message="جاري تحميل استلامات المرتجعات..." />;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            استلامات المرتجعات
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            إيصالات المرتجعات المستلمة، بصورها وطلباتها وحالة مراجعتها
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

      {receipts.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-12">
          لا توجد استلامات مرتجعات
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              onClick={() =>
                setSelectedId(selectedId === receipt.id ? null : receipt.id)
              }
              className={`border rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-colors ${
                selectedId === receipt.id
                  ? 'border-primary'
                  : 'border-gray-200 hover:border-primary/40'
              } ${receipt.reviewedAt ? 'bg-green-50/40' : 'bg-white'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900">
                    إيصال #{receipt.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(receipt.createdAt).toLocaleDateString('ar-EG')}
                    {receipt.receivedByName
                      ? ` — ${receipt.receivedByName}`
                      : ''}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary shrink-0">
                  {receipt.ordersCount} طلب
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Both controls are disabled with a reason rather than opening
                    an empty viewer — images are optional on a receipt. */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  disabled={!receipt.receiptImageUrl}
                  title={
                    receipt.receiptImageUrl ? undefined : 'لا توجد صورة إيصال'
                  }
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    openGallery('صورة الإيصال', [receipt.receiptImageUrl!]);
                  }}
                >
                  <FileImage className="w-3.5 h-3.5" />
                  صورة الإيصال
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  disabled={receipt.codeSheetImageUrls.length === 0}
                  title={
                    receipt.codeSheetImageUrls.length
                      ? undefined
                      : 'لا توجد صور كشف أكواد'
                  }
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    openGallery('كشف الأكواد', receipt.codeSheetImageUrls);
                  }}
                >
                  <Images className="w-3.5 h-3.5" />
                  كشف الأكواد ({receipt.codeSheetImageUrls.length})
                </Button>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
                {renderReviewState(receipt)}
                {!receipt.reviewedAt && (
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full text-xs px-4"
                    disabled={isReviewing}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      review(receipt.id);
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
              <CardTitle className="text-base">
                إيصال #{selectedId}
                {detail ? ` — ${detail.ordersCount} طلب` : ''}
              </CardTitle>
              {detail && (
                <div className="mt-1 flex flex-col gap-0.5">
                  {renderReviewState(detail)}
                  {detail.notes && (
                    <span className="text-xs text-gray-500">
                      ملاحظات: {detail.notes}
                    </span>
                  )}
                </div>
              )}
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
                    onClick={() =>
                      openGallery('صورة الإيصال', [detail.receiptImageUrl!])
                    }
                  >
                    <FileImage className="w-3.5 h-3.5" />
                    صورة الإيصال
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    disabled={detail.codeSheetImageUrls.length === 0}
                    onClick={() =>
                      openGallery('كشف الأكواد', detail.codeSheetImageUrls)
                    }
                  >
                    <Images className="w-3.5 h-3.5" />
                    كشف الأكواد ({detail.codeSheetImageUrls.length})
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
                        <th className="px-4 py-2 text-right font-medium">الحالة</th>
                        <th className="px-4 py-2 text-right font-medium">المحافظة</th>
                        <th className="px-4 py-2 text-right font-medium">المنطقة</th>
                        <th className="px-4 py-2 text-right font-medium">المنتجات</th>
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
                          <td className="px-4 py-2">
                            {getStatusLabel(order.status ?? '') || '—'}
                          </td>
                          <td className="px-4 py-2">{order.governorate ?? '—'}</td>
                          <td className="px-4 py-2">{order.city ?? '—'}</td>
                          <td className="px-4 py-2">{order.productsCount}</td>
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

      <ImageGalleryModal
        isOpen={gallery !== null}
        onClose={() => setGallery(null)}
        title={gallery?.title ?? ''}
        images={gallery?.images ?? []}
      />
    </div>
  );
}
