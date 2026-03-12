'use client';

import { memo, useMemo, useCallback, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import {
  LiaBarcodeSolid,
  LiaCheckCircleSolid,
  LiaTimesCircleSolid,
  LiaExclamationCircleSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { useBarcodeScanner } from '@/app/dashboard/orders/print-orders/hooks/useBarcodeScanner';
import { MOCK_RECEIPT_PRODUCTS } from '../constants';
import { SelectedVariant } from '../types';

interface RejectionStepProps {
  productVariants: Record<number, SelectedVariant[]>;
  confirmedCounts: Record<string, number>;
  rejectedCounts: Record<string, number>;
  onRejectedCountsChange: (counts: Record<string, number>) => void;
}

type VariantStatus = 'incomplete' | 'complete' | 'excess';

interface RejectionVariantRow extends Record<string, unknown> {
  id: string;
  productId: number;
  variantName: string;
  image: string;
  confirmedQuantity: number;
}

function getVariantStatus(scanned: number, expected: number): VariantStatus {
  if (expected > 0 && scanned === expected) return 'complete';
  if (scanned > expected) return 'excess';
  return 'incomplete';
}

function getStatusLabel(status: VariantStatus) {
  switch (status) {
    case 'complete':
      return { text: 'مكتمل', icon: LiaCheckCircleSolid, className: 'text-green-600' };
    case 'excess':
      return { text: 'زيادة', icon: LiaTimesCircleSolid, className: 'text-red-600' };
    case 'incomplete':
      return { text: 'غير مكتمل', icon: LiaExclamationCircleSolid, className: 'text-gray-500' };
  }
}

function getProductStatus(
  variants: RejectionVariantRow[],
  rejectedCounts: Record<string, number>
): { status: VariantStatus; totalRejected: number; totalConfirmed: number } {
  let totalRejected = 0;
  let totalConfirmed = 0;
  let hasExcess = false;
  let allComplete = true;

  for (const v of variants) {
    const rejected = rejectedCounts[v.id] ?? 0;
    totalRejected += rejected;
    totalConfirmed += v.confirmedQuantity;

    const status = getVariantStatus(rejected, v.confirmedQuantity);
    if (status === 'excess') hasExcess = true;
    if (status !== 'complete') allComplete = false;
  }

  const status: VariantStatus = hasExcess ? 'excess' : allComplete ? 'complete' : 'incomplete';
  return { status, totalRejected, totalConfirmed };
}

const RejectionStep = memo(({ productVariants, confirmedCounts, rejectedCounts, onRejectedCountsChange }: RejectionStepProps) => {
  const [lastScannedVariant, setLastScannedVariant] = useState<string | null>(null);

  const productsWithVariants = useMemo(() => {
    return MOCK_RECEIPT_PRODUCTS
      .filter((p) => productVariants[p.id]?.length > 0)
      .map((product) => ({
        product,
        variants: productVariants[product.id].map((v) => {
          const rowId = `${product.id}-${v.variantId}-${v.color}-${v.size}`;
          return {
            id: rowId,
            productId: product.id,
            variantName: `${v.variantName} - ${v.color} - ${v.size}`,
            image: product.image,
            confirmedQuantity: confirmedCounts[rowId] ?? 0,
          } satisfies RejectionVariantRow;
        }),
      }));
  }, [productVariants, confirmedCounts]);

  const variantIdByBarcode = useMemo(() => {
    const map: Record<string, string> = {};
    for (const { variants } of productsWithVariants) {
      for (const v of variants) {
        map[v.id] = v.id;
      }
    }
    return map;
  }, [productsWithVariants]);

  const incrementVariant = useCallback((variantRowId: string) => {
    onRejectedCountsChange({
      ...rejectedCounts,
      [variantRowId]: (rejectedCounts[variantRowId] ?? 0) + 1,
    });
    setLastScannedVariant(variantRowId);
    setTimeout(() => setLastScannedVariant(null), 1000);
  }, [rejectedCounts, onRejectedCountsChange]);

  const handleScan = useCallback(
    (barcode: string) => {
      const variantRowId = variantIdByBarcode[barcode];
      if (variantRowId) {
        incrementVariant(variantRowId);
      }
    },
    [variantIdByBarcode, incrementVariant]
  );

  useBarcodeScanner({
    onScan: handleScan,
    enabled: true,
    minCharLength: 1,
    maxCharLength: 1000,
  });

  const columns: DataTableColumn<RejectionVariantRow>[] = useMemo(
    () => [
      {
        key: 'image',
        header: 'صورة المنتج',
        className: 'w-20',
        render: (_value: unknown, row: RejectionVariantRow) => (
          <div className="flex items-center justify-center">
            <Image
              src={row.image}
              alt={row.variantName}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          </div>
        ),
      },
      {
        key: 'variantName',
        header: 'اسم المنتج',
      },
      {
        key: 'rejected',
        header: 'مرفوض',
        className: 'w-28',
        render: (_value: unknown, row: RejectionVariantRow) => {
          const rejected = rejectedCounts[row.id] ?? 0;
          const isFlashing = lastScannedVariant === row.id;
          return (
            <span
              className={clsx(
                'text-sm font-bold transition-all duration-300',
                isFlashing && 'text-red-500 scale-110'
              )}
            >
              {rejected}/{row.confirmedQuantity}
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'الحالة',
        className: 'w-36',
        render: (_value: unknown, row: RejectionVariantRow) => {
          const rejected = rejectedCounts[row.id] ?? 0;
          const status = getVariantStatus(rejected, row.confirmedQuantity);
          const label = getStatusLabel(status);
          const Icon = label.icon;
          return (
            <span className={clsx('flex items-center gap-1.5 text-sm font-semibold', label.className)}>
              <Icon className="w-5 h-5" />
              {label.text}
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: '',
        className: 'w-16',
        render: (_value: unknown, row: RejectionVariantRow) => (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-400 w-8 h-8"
              onClick={() => incrementVariant(row.id)}
            >
              <LiaBarcodeSolid className="w-5 h-5" />
            </Button>
          </div>
        ),
      },
    ],
    [rejectedCounts, lastScannedVariant, incrementVariant]
  );

  const overallTotals = useMemo(() => {
    const allVariants = productsWithVariants.flatMap((p) => p.variants);
    let totalRejected = 0;
    let totalConfirmed = 0;
    for (const v of allVariants) {
      totalRejected += rejectedCounts[v.id] ?? 0;
      totalConfirmed += v.confirmedQuantity;
    }
    return { totalRejected, totalConfirmed };
  }, [productsWithVariants, rejectedCounts]);

  if (productsWithVariants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <LiaBarcodeSolid className="w-16 h-16 text-gray-300" />
        <p className="text-lg font-semibold text-gray-400">لا توجد متغيرات للرفض</p>
        <p className="text-sm text-gray-400">يرجى إكمال خطوة تأكيد العدد أولاً</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-gray-800">مرحلة الرفض والإتلاف</h2>
        <p className="text-sm text-gray-500">
          امسح الباركود للقطع المرفوضة أو التالفة لخصمها من الكمية المؤكدة
        </p>
      </div>

      {productsWithVariants.map(({ product, variants }) => {
        const productStatus = getProductStatus(variants, rejectedCounts);
        const statusLabel = getStatusLabel(productStatus.status);
        const StatusIcon = statusLabel.icon;

        return (
          <div key={product.id} className="flex flex-col gap-3">
            <h3 className="text-base font-bold text-gray-800">{product.name}</h3>
            <DataTable
              columns={columns}
              data={variants}
              keyField="id"
              emptyMessage="لا توجد متغيرات"
            />
            <div className="flex justify-end px-4">
              <span className={clsx('flex items-center gap-1.5 text-sm font-bold', statusLabel.className)}>
                <StatusIcon className="w-5 h-5" />
                {statusLabel.text} : {productStatus.totalRejected}/{productStatus.totalConfirmed}
              </span>
            </div>
          </div>
        );
      })}

      <div className="flex flex-row items-center justify-between px-4 pt-2 border-t border-gray-200">
        <p className="text-base font-bold text-gray-800">
          إجمالي المرفوضات : {overallTotals.totalRejected}/{overallTotals.totalConfirmed}
        </p>
      </div>
    </div>
  );
});

RejectionStep.displayName = 'RejectionStep';

export default RejectionStep;
