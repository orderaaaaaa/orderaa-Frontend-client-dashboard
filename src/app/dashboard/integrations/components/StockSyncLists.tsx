'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { PERMISSION_CODES } from '@/lib/generated/permission-codes';
import type {
  StockPushErrorCode,
  StockPushLogPage,
  StockPolicyLogPage,
  UnlinkedVariantPage,
  UnlinkedVariantReason,
} from '../types/apiIntegration';

export const STOCK_PUSH_ERROR_LABEL: Record<StockPushErrorCode, string> = {
  SHOPIFY_SCOPES_MISSING: 'صلاحيات تطبيق Shopify ناقصة',
  SHOPIFY_INVENTORY_ITEM_NOT_FOUND: 'عنصر المخزون غير موجود في Shopify',
  SHOPIFY_TRACKING_UPDATE_FAILED: 'تعذر تفعيل تتبع المخزون في Shopify',
  SHOPIFY_ACTIVATION_FAILED: 'تعذر إضافة المنتج إلى موقع المخزون في Shopify',
  SHOPIFY_INVENTORY_POLICY_UPDATE_FAILED:
    'تعذر إيقاف البيع عند نفاد المخزون في Shopify',
  POLICY_ORIGINAL_NOT_SAVED: 'تعذر حفظ الإعداد الأصلي فلم نغيّر إعداد البيع',
  SHOPIFY_VARIANT_NOT_FOUND: 'المنتج غير موجود في Shopify',
  SHOPIFY_POLICY_RESTORE_FAILED: 'تعذر استعادة إعداد البيع الأصلي في Shopify',
  POLICY_CHANGED_IN_SHOPIFY: 'تغيّر الإعداد في Shopify فتركناه كما هو',
  SHOPIFY_SET_QUANTITY_FAILED: 'رفض Shopify تحديث الكمية',
  PROVIDER_REJECTED: 'رفض المتجر الطلب',
  PROVIDER_UNREACHABLE: 'تعذر الوصول إلى المتجر',
  MISSING_TAAGER_CODE: 'لا يوجد كود تاجر',
  MISSING_INVENTORY_ITEM: 'لا يوجد عنصر مخزون',
  INTERRUPTED: 'توقف الدفع قبل اكتماله',
};

export const isStockPushErrorCode = (
  code: string
): code is StockPushErrorCode =>
  Object.prototype.hasOwnProperty.call(STOCK_PUSH_ERROR_LABEL, code);

export const pushErrorLabel = (code: string | null): string =>
  code !== null && isStockPushErrorCode(code)
    ? STOCK_PUSH_ERROR_LABEL[code]
    : 'فشل الدفع';

export const UNLINKED_REASON_LABEL: Record<UnlinkedVariantReason, string> = {
  NO_MAPPING: 'غير مرتبط',
  MISSING_TAAGER_CODE: 'لا يوجد كود تاجر',
  MISSING_INVENTORY_ITEM: 'لا يوجد عنصر مخزون',
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ar-EG');
}

function useClampedPage(
  currentPage: number,
  totalPages: number | undefined,
  onPageChange: (page: number) => void
) {
  useEffect(() => {
    if (totalPages === undefined) return;
    const lastPage = Math.max(totalPages, 1);
    if (currentPage > lastPage) {
      onPageChange(lastPage);
    }
  }, [currentPage, totalPages, onPageChange]);
}

function Pager({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const lastPage = Math.max(totalPages, 1);
  if (lastPage <= 1 && page <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-1">
      <Button
        type="button"
        size="xs"
        variant="ghost"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        السابق
      </Button>
      <span className="text-xs text-gray-500">
        {page} / {lastPage}
      </span>
      <Button
        type="button"
        size="xs"
        variant="ghost"
        disabled={page >= lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        التالي
      </Button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
      <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
    </div>
  );
}

export function FailedPushList({
  page,
  isLoading,
  currentPage,
  onPageChange,
  onRetryOne,
  onRetryAll,
  isRetrying,
  canPush,
}: {
  page: StockPushLogPage | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRetryOne: (variantId: number) => void;
  onRetryAll: () => void;
  isRetrying: boolean;
  canPush: boolean;
}) {
  useClampedPage(currentPage, page?.totalPages, onPageChange);
  const rows = page?.data ?? [];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold text-gray-900">عمليات دفع فشلت</h5>
        {rows.length > 0 && (
          <Can code={PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRetryAll}
              disabled={!canPush || isRetrying}
              loading={isRetrying}
            >
              إعادة إرسال الكل
            </Button>
          </Can>
        )}
      </div>

      {isLoading ? (
        <Skeleton />
      ) : rows.length === 0 ? (
        <p className="text-xs text-gray-500">لا توجد عمليات فشلت</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-lg border border-gray-200 bg-white p-3 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-900">
                  {row.productName} — {row.variantLabel}
                </span>
                <Can code={PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE}>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => onRetryOne(row.variantId)}
                    disabled={!canPush || isRetrying}
                  >
                    إعادة الإرسال
                  </Button>
                </Can>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {row.sku && <span>SKU: {row.sku}</span>}
                <span>الكمية: {row.quantity}</span>
                <span>محاولة {row.attempts}</span>
                <span>{formatTimestamp(row.updatedAt)}</span>
              </div>
              <div className="text-xs text-red-600">
                {pushErrorLabel(row.lastErrorCode)}
                {row.lastError && (
                  <div className="text-[11px] text-gray-400">{row.lastError}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pager page={currentPage} totalPages={page?.totalPages ?? 1} onPageChange={onPageChange} />
    </div>
  );
}

export function UnlinkedVariantList({
  page,
  isLoading,
  currentPage,
  onPageChange,
}: {
  page: UnlinkedVariantPage | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  useClampedPage(currentPage, page?.totalPages, onPageChange);
  const rows = page?.data ?? [];
  return (
    <div className="space-y-3">
      <h5 className="text-sm font-semibold text-gray-900">منتجات غير مرتبطة</h5>

      {isLoading ? (
        <Skeleton />
      ) : rows.length === 0 ? (
        <p className="text-xs text-gray-500">كل المنتجات مرتبطة</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.variantId}
              className="rounded-lg border border-gray-200 bg-white p-3 space-y-1"
            >
              <div className="text-sm text-gray-900">
                {row.productName} — {row.variantLabel}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {row.sku && <span>SKU: {row.sku}</span>}
                <span>{UNLINKED_REASON_LABEL[row.reason]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pager page={currentPage} totalPages={page?.totalPages ?? 1} onPageChange={onPageChange} />
    </div>
  );
}

export function PolicyLogList({
  page,
  isLoading,
  currentPage,
  onPageChange,
  hasPendingPolicy,
  skippedCount,
  onRetry,
  isRetrying,
  canRetry,
}: {
  page: StockPolicyLogPage | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  hasPendingPolicy: boolean;
  skippedCount: number;
  onRetry: () => void;
  isRetrying: boolean;
  canRetry: boolean;
}) {
  useClampedPage(currentPage, page?.totalPages, onPageChange);
  const rows = page?.data ?? [];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold text-gray-900">إعدادات البيع في Shopify</h5>
        <Can code={PERMISSION_CODES.INTEGRATION_CONFIG_MANAGE}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRetry}
            disabled={!canRetry || isRetrying}
            loading={isRetrying}
          >
            إعادة المحاولة
          </Button>
        </Can>
      </div>

      {hasPendingPolicy && (
        <p className="text-xs text-gray-500">جاري استعادة إعدادات البيع الأصلية...</p>
      )}

      {isLoading ? (
        <Skeleton />
      ) : rows.length === 0 ? (
        <p className="text-xs text-gray-500">لا توجد مشاكل في إعدادات البيع</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-lg border border-gray-200 bg-white p-3 space-y-1"
            >
              <div className="text-sm text-gray-900">
                {row.productName} — {row.variantLabel}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {row.sku && <span>SKU: {row.sku}</span>}
                <span>{formatTimestamp(row.updatedAt)}</span>
              </div>
              <div className="text-xs text-red-600">{pushErrorLabel(row.lastErrorCode)}</div>
            </div>
          ))}
        </div>
      )}

      {skippedCount > 0 && (
        <p className="text-xs text-gray-500">
          {skippedCount} منتج تُرك كما هو لأن إعداده تغيّر في Shopify أو حُذف
        </p>
      )}

      <Pager page={currentPage} totalPages={page?.totalPages ?? 1} onPageChange={onPageChange} />
    </div>
  );
}
