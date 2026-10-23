'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  useGoLiveMutation,
  useGoLiveSummaryQuery,
  useStockModeQuery,
} from '@/services/stockMode';
import { getApiErrorMessage } from '@/utils/apiError';

const COUNT_PAGE_HREF = '/dashboard/inventory/stock-management/opening-count';
const ORDER_STOCK_SYNC_HREF = '/dashboard/inventory/stock-management/order-stock-sync';

const MODE_LABELS = {
  TRIAL: 'وضع التجربة: تُسجَّل الحركات حتى لو كان الرصيد سالبًا، ولا يتم منع أي طلب بسبب المخزون.',
  ENFORCED: 'وضع التشغيل: قواعد المخزون تمنع الحركة عند نقص الرصيد.',
} as const;

const NOT_STARTED_LABEL =
  'لم يبدأ تتبع المخزون بعد. يبدأ عند إضافة أول قاعدة انتقال.';

export function StockModeSection() {
  const router = useRouter();
  const { hasPermission } = usePermissionCheck();
  const canRead = hasPermission(PERMISSION_CODES.STOCK_WORKFLOWS_READ);
  const canUpdate = hasPermission(PERMISSION_CODES.STOCK_WORKFLOWS_UPDATE);
  const canReadMovements = hasPermission(PERMISSION_CODES.STOCK_MOVEMENTS_READ);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: mode } = useStockModeQuery(canRead);
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useGoLiveSummaryQuery(dialogOpen && canRead);
  const goLive = useGoLiveMutation();

  if (!canRead || !mode) return null;

  const negativeCount = summary
    ? summary.negativeBalances.reduce(
        (total, warehouse) => total + warehouse.variants.length,
        0
      )
    : 0;
  const warehouseCount = summary ? summary.negativeBalances.length : 0;

  const summaryText = summary
    ? `يوجد ${negativeCount} متغير برصيد سالب في ${warehouseCount} مخزن، و${summary.inFlightOrderCount} طلب قيد التنفيذ. يمكنك إجراء الجرد أولًا، أو التفعيل الآن.`
    : summaryLoading
      ? 'جارٍ تحميل ملخص الأرصدة...'
      : '';

  const onConfirmGoLive = async () => {
    try {
      await goLive.mutateAsync();
      toast.success('تم تفعيل منع النقص');
      setDialogOpen(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر تفعيل منع النقص'), {
        autoClose: 8000,
      });
    }
  };

  const onCountFirst = () => {
    setDialogOpen(false);
    router.push(COUNT_PAGE_HREF);
  };

  return (
    <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">
            {mode.mode ? MODE_LABELS[mode.mode] : NOT_STARTED_LABEL}
          </p>
          {mode.stockTrackingStartedAt && (
            <p className="text-xs text-gray-500">
              بدأ التتبع في{' '}
              {new Date(mode.stockTrackingStartedAt).toLocaleDateString('ar-EG')}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={COUNT_PAGE_HREF}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            عدّ المخزون الافتتاحي
          </Link>
          {canReadMovements && (
            <Link
              href={ORDER_STOCK_SYNC_HREF}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              مزامنة مخزون الطلبات
            </Link>
          )}
          {canUpdate && mode.mode === 'TRIAL' && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              بدء التشغيل الفعلي للمخزون
            </Button>
          )}
        </div>
      </div>

      <BaseModal
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="تفعيل منع النقص"
        showFooter={false}
        maxWidth="md:max-w-[480px]"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{summaryText}</p>
          {summaryError && (
            <p className="text-sm text-red-500">
              {getApiErrorMessage(summaryError, 'تعذر تحميل ملخص الأرصدة')}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={onCountFirst}>
              إجراء الجرد الآن
            </Button>
            <Button
              onClick={onConfirmGoLive}
              disabled={!summary || goLive.isPending}
              loading={goLive.isPending}
            >
              تفعيل الآن
            </Button>
          </div>
        </div>
      </BaseModal>
    </section>
  );
}
