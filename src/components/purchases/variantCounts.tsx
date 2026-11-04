'use client';

import type { InvoiceProductApiItem, InvoiceProductVariantDetail } from '@/lib/api/suppliers';
import { formatStockNumber } from '@/utils/format';

export function variantLabelFromDetail(variant: InvoiceProductVariantDetail | null | undefined): string | null {
  const names = (variant?.options ?? []).map((option) => option.attribute_option.name).filter(Boolean);
  return names.length > 0 ? names.join(' / ') : null;
}

export function invoiceVariantCountLabel(variant: InvoiceProductVariantDetail | null | undefined): string {
  return variantLabelFromDetail(variant) ?? 'بدون متغير';
}

export function variantOptionIdsOf(variant: InvoiceProductVariantDetail | null | undefined): number[] {
  return (variant?.options ?? []).map((option) => option.attribute_option.id);
}

interface VariantCountsListProps {
  line: InvoiceProductApiItem;
  isApproved: boolean;
}

export function VariantCountsList({ line, isApproved }: VariantCountsListProps) {
  if (!isApproved) {
    const label = variantLabelFromDetail(line.variant);
    return label ? (
      <span className="text-xs text-muted-foreground">
        {label}: <span dir="ltr" className="tabular-nums">{formatStockNumber(line.quantity)}</span>
      </span>
    ) : null;
  }
  if (line.variantCounts === null) {
    return <span className="text-xs text-muted-foreground">غير مسجل</span>;
  }
  if (line.variantCounts.length === 0) {
    return <span className="text-xs text-muted-foreground">لا توجد أعداد أصناف معتمدة</span>;
  }
  return (
    <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
      {line.variantCounts.map((count) => (
        <li key={`${count.variantId}-${count.warehouseId ?? 'none'}`} className="tabular-nums">
          {invoiceVariantCountLabel(count.variant)}: مقبول{' '}
          <span dir="ltr">{formatStockNumber(count.approvedCount)}</span> · مرفوض{' '}
          <span dir="ltr">{formatStockNumber(count.rejectedCount)}</span>
        </li>
      ))}
    </ul>
  );
}
