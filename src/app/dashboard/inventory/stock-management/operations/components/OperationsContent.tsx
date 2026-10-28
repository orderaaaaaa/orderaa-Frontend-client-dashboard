'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { EmptyState } from '@/components/ui/state-panels';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { OperationsProductPanel } from './OperationsProductPanel';
import { OperationsProductTable } from './OperationsProductTable';
import { OperationsWarehousePicker } from './OperationsWarehousePicker';

const parseId = (raw: string | null): number | null => {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
};

export function OperationsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const warehouseId = parseId(searchParams.get('warehouseId'));
  const productId = parseId(searchParams.get('productId'));
  const variantId = parseId(searchParams.get('variantId'));
  const canTransfer = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_TRANSFER);
  const canAdjust = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_ADJUST);
  const canHistory = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_HISTORY_READ);

  const updateParams = useCallback(
    (patch: Record<string, number | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <>
      <StockPageHeader
        title="عمليات المخزون"
        subtitle="انقل الكميات بين المخازن وسوِّ الأرصدة وتابع سجل كل منتج"
        breadcrumbs={[
          { label: 'إدارة المخزن', href: '/dashboard/inventory/stock-management' },
          { label: 'العمليات' },
        ]}
      />

      <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 md:p-5">
        <span className="text-sm font-medium text-foreground">المخزن</span>
        <div className="max-w-md">
          <OperationsWarehousePicker
            value={warehouseId}
            onChange={(id) => updateParams({ warehouseId: id, variantId: null })}
          />
        </div>
      </section>

      {warehouseId === null ? (
        <EmptyState
          title="اختر مخزنًا لعرض منتجاته"
          description="بعد اختيار المخزن تظهر المنتجات والمتغيرات مع كمياتها فيه"
        />
      ) : (
        <OperationsProductTable
          warehouseId={warehouseId}
          selectedProductId={productId}
          onSelectProduct={(id) => updateParams({ productId: id, variantId: null })}
          canTransfer={canTransfer}
          canAdjust={canAdjust}
        />
      )}

      {productId !== null && (
        <OperationsProductPanel
          key={productId}
          productId={productId}
          variantId={variantId}
          onVariantChange={(id) => updateParams({ variantId: id })}
          onClose={() => updateParams({ productId: null, variantId: null })}
          canAdjust={canAdjust}
          canHistory={canHistory}
        />
      )}
    </>
  );
}
