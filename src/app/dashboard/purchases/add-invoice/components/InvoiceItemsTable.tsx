'use client';

import { memo, useMemo } from 'react';
import { LiaPlusSolid, LiaTrashAltSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { InvoiceItem } from '../types';

interface ItemFieldError {
  quantity?: { message?: string };
  pricePerItem?: { message?: string };
  name?: { message?: string };
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onQuantityChange: (index: number, value: number) => void;
  onPriceChange: (index: number, value: number) => void;
  onRemoveItem: (index: number) => void;
  onAddItemClick: () => void;
  itemErrors?: Record<number, ItemFieldError>;
}

const InvoiceItemsTable = memo(
  ({
    items,
    onQuantityChange,
    onPriceChange,
    onRemoveItem,
    onAddItemClick,
    itemErrors,
  }: InvoiceItemsTableProps) => {
    const grandTotal = useMemo(
      () => items.reduce((sum, item) => sum + item.quantity * item.pricePerItem, 0),
      [items],
    );

    const columns: DataTableColumn<InvoiceItem & Record<string, unknown>>[] = useMemo(
      () => [
        {
          key: 'name',
          header: 'اسم الصنف',
        },
        {
          key: 'quantity',
          header: 'الكمية',
          render: (_value: unknown, row: InvoiceItem & Record<string, unknown>) => {
            const index = items.findIndex((i) => i.id === row.id);
            return (
              <Input
                type="number"
                value={row.quantity || ''}
                onChange={(e) =>
                  onQuantityChange(index, Number(e.target.value) || 0)
                }
                placeholder="الكمية"
                className="min-w-15"
                error={itemErrors?.[index]?.quantity?.message}
              />
            );
          },
        },
        {
          key: 'pricePerItem',
          header: 'سعر الصنف',
          render: (_value: unknown, row: InvoiceItem & Record<string, unknown>) => {
            const index = items.findIndex((i) => i.id === row.id);
            return (
              <div className="flex items-center flex-row gap-2">
                <Input
                  type="number"
                  value={row.pricePerItem || ''}
                  onChange={(e) =>
                    onPriceChange(index, Number(e.target.value) || 0)
                  }
                  placeholder="السعر"
                  className="min-w-15"
                  error={itemErrors?.[index]?.pricePerItem?.message}
                />
                جنيه
              </div>
            );
          },
        },
        {
          key: 'total',
          header: 'الاجمالي',
          render: (_value: unknown, row: InvoiceItem & Record<string, unknown>) => (
            <span className="font-semibold">
              {(row.quantity * row.pricePerItem).toLocaleString()} جنيه
            </span>
          ),
        },
        {
          key: 'actions',
          header: '',
          className: 'w-12',
          render: (_value: unknown, row: InvoiceItem & Record<string, unknown>) => {
            const index = items.findIndex((i) => i.id === row.id);
            return (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemoveItem(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <LiaTrashAltSolid className="w-4 h-4" />
              </Button>
            );
          },
        },
      ],
      [items, onQuantityChange, onPriceChange, onRemoveItem, itemErrors],
    );

    const tableData = items as (InvoiceItem & Record<string, unknown>)[];

    return (
      <div className="sm:px-8 flex flex-col gap-4">
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="default"
            className="w-fit flex items-center gap-2 rounded-full font-semibold text-xs sm:text-sm"
            onClick={onAddItemClick}
          >
            <LiaPlusSolid className="w-5 h-5" />
            <span>اضافة صنف</span>
          </Button>
        </div>

        <div>
          <DataTable
            columns={columns}
            data={tableData}
            keyField="id"
            emptyMessage="لا توجد اصناف، قم باضافة اصناف للفاتورة"
          />

          {items.length > 0 && (
            <div className="flex justify-end px-2 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold">
                <span className="text-gray-800">الاجمالي الكلي</span>
                <span className="text-primary">{grandTotal.toLocaleString()} جنيه</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

InvoiceItemsTable.displayName = 'InvoiceItemsTable';

export default InvoiceItemsTable;
