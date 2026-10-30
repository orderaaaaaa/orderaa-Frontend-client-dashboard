'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { LiaClipboardCheckSolid, LiaClipboardListSolid, LiaSyncSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  useGoLiveMutation,
  useGoLiveSummaryQuery,
  useStockModeQuery,
} from '@/services/stockMode';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDate } from '@/utils/format';
import { STOCKTAKE_LIST_HREF } from './stocktake/stocktakeRoutes';
import { StockActionsMenu, type StockActionItem } from './StockActionsMenu';
import {
  formatCountAmount,
  formatStockNumber,
  formatVariantCount,
  ORDER_FORMS,
} from '../utils/formatNumber';

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
  const canRead = useHasPermissionStrict(PERMISSION_CODES.STOCK_WORKFLOWS_READ);
  const canSwitchMode = useHasPermissionStrict(
    PERMISSION_CODES.STOCK_WORKFLOWS_MODE_SWITCH,
  );
  const canReadMovements = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_READ);
  const canReadStocktake = useHasPermissionStrict(
    PERMISSION_CODES.STOCK_MOVEMENTS_STOCKTAKE_READ,
  );
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
    ? `يوجد ${formatVariantCount(negativeCount)} برصيد سالب في ${formatStockNumber(warehouseCount)} مخزن، و${formatCountAmount(summary.inFlightOrderCount, ORDER_FORMS)} قيد التنفيذ. يمكنك إجراء الجرد أولًا، أو التفعيل الآن.`
    : summaryLoading
      ? 'جارٍ تحميل ملخص الأرصدة...'
      : '';

  const goLiveVisible = canSwitchMode && mode.mode === 'TRIAL';
  const stocktakeVisible = canReadStocktake;
  const primary = goLiveVisible ? 'goLive' : stocktakeVisible ? 'stocktake' : null;

  const menuItems: StockActionItem[] = [
    ...(canReadMovements
      ? [{ key: 'count', label: 'عدّ المخزون الافتتاحي', href: COUNT_PAGE_HREF, icon: LiaClipboardListSolid }]
      : []),
    ...(canReadStocktake && primary !== 'stocktake'
      ? [{ key: 'stocktake', label: 'جرد المخزون', href: STOCKTAKE_LIST_HREF, icon: LiaClipboardCheckSolid }]
      : []),
    ...(canReadMovements
      ? [{ key: 'sync', label: 'مزامنة مخزون الطلبات', href: ORDER_STOCK_SYNC_HREF, icon: LiaSyncSolid }]
      : []),
  ];

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
              {formatDate(mode.stockTrackingStartedAt)}
            </p>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          {primary === 'goLive' && (
            <Button
              size="sm"
              className="h-10 w-full sm:h-9 sm:w-auto"
              onClick={() => setDialogOpen(true)}
            >
              بدء التشغيل الفعلي للمخزون
            </Button>
          )}
          {primary === 'stocktake' && (
            <Button asChild size="sm" className="h-10 w-full sm:h-9 sm:w-auto">
              <Link href={STOCKTAKE_LIST_HREF}>جرد المخزون</Link>
            </Button>
          )}
          <StockActionsMenu items={menuItems} />
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
