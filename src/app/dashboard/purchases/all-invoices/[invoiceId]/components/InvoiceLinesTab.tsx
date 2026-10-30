'use client';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { InvoiceProductApiItem } from '@/lib/api/suppliers';
import { formatMoney } from '@/utils/formatMoney';
import { formatStockNumber } from '@/utils/format';

type LineRow = InvoiceProductApiItem & Record<string, unknown>;

export function variantLabelOf(line: InvoiceProductApiItem): string | null {
  const names = (line.variant?.options ?? [])
    .map((option) => option.attribute_option?.name)
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(' / ') : null;
}

interface InvoiceLinesTabProps {
  products: InvoiceProductApiItem[];
}

export function InvoiceLinesTab({ products }: InvoiceLinesTabProps) {
  const hasPackageColumns = products.some(
    (line) => line.packageCount != null || line.piecesPerPackage != null,
  );

  const columns: DataTableColumn<LineRow>[] = [
    {
      key: 'product',
      header: 'اسم الصنف',
      render: (_value, row) => {
        const variant = variantLabelOf(row);
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-semibold text-foreground break-words">{row.product.name}</span>
            {variant && <span className="text-xs text-muted-foreground">{variant}</span>}
          </div>
        );
      },
    },
    ...(hasPackageColumns
      ? [
          {
            key: 'packageCount',
            header: 'عدد الطرود',
            render: (_value: unknown, row: LineRow) =>
              row.packageCount != null ? (
                <span className="tabular-nums" dir="ltr">{formatStockNumber(row.packageCount)}</span>
              ) : (
                '—'
              ),
          } as DataTableColumn<LineRow>,
          {
            key: 'piecesPerPackage',
            header: 'القطع في الطرد',
            render: (_value: unknown, row: LineRow) =>
              row.piecesPerPackage != null ? (
                <span className="tabular-nums" dir="ltr">{formatStockNumber(row.piecesPerPackage)}</span>
              ) : (
                '—'
              ),
          } as DataTableColumn<LineRow>,
        ]
      : []),
    {
      key: 'quantity',
      header: 'إجمالي القطع',
      render: (value: unknown) => (
        <span className="tabular-nums" dir="ltr">{formatStockNumber(value)}</span>
      ),
    },
    {
      key: 'price',
      header: 'السعر',
      render: (value: unknown) => (
        <span className="tabular-nums" dir="ltr">{formatMoney(String(value))}</span>
      ),
    },
    {
      key: 'total',
      header: 'الإجمالي',
      render: (_value: unknown, row: LineRow) => (
        <span className="font-semibold tabular-nums" dir="ltr">
          {formatMoney(String(row.quantity * row.price))}
        </span>
      ),
    },
  ];

  return (
    <DataTable<LineRow>
      columns={columns}
      data={products as LineRow[]}
      keyField="id"
      emptyMessage="لا توجد أصناف في هذه الفاتورة"
    />
  );
}
