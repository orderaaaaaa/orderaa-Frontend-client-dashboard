'use client';

import React, { memo, useMemo } from 'react';
import { LiaPlusSolid, LiaTrashAltSolid, LiaCubeSolid, LiaCubesSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import ToggleGroup from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { InvoiceItem, InvoiceMode } from '../types';
import { INVOICE_TYPES } from '../constants';

interface ItemFieldError {
  quantity?: { message?: string };
  pricePerItem?: { message?: string };
  pieceCount?: { message?: string };
  name?: { message?: string };
}

const INVOICE_MODE_OPTIONS: { value: InvoiceMode; label: string; icon: React.ReactNode }[] = [
  { value: 'singular', label: 'قطعة', icon: <LiaCubeSolid className="w-4 h-4" /> },
  { value: 'package', label: 'باكدج', icon: <LiaCubesSolid className="w-4 h-4" /> },
];

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  mode: InvoiceMode;
  invoiceType: string;
  onInvoiceTypeChange: (value: string) => void;
  invoiceTypeError?: string;
  withVariants: boolean;
  onWithVariantsChange: (value: boolean) => void;
  onModeChange: (mode: InvoiceMode) => void;
  onQuantityChange: (index: number, value: number) => void;
  onPriceChange: (index: number, value: number) => void;
  onPieceCountChange: (index: number, value: number) => void;
  onRemoveItem: (index: number) => void;
  onAddItemClick: () => void;
  itemErrors?: Record<number, ItemFieldError>;
}

const InvoiceItemsTable = memo(
  ({
    items,
    mode,
    invoiceType,
    onInvoiceTypeChange,
    invoiceTypeError,
    withVariants,
    onWithVariantsChange,
    onModeChange,
    onQuantityChange,
    onPriceChange,
    onPieceCountChange,
    onRemoveItem,
    onAddItemClick,
    itemErrors,
  }: InvoiceItemsTableProps) => {
    const isPackage = mode === 'package';

    const grandTotal = useMemo(
      () => items.reduce((sum, item) => sum + item.quantity * item.pricePerItem, 0),
      [items],
    );

    const columns: DataTableColumn<InvoiceItem & Record<string, unknown>>[] = useMemo(() => {
      const cols: DataTableColumn<InvoiceItem & Record<string, unknown>>[] = [
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
          header: isPackage ? 'سعر الباكدج' : 'سعر الصنف',
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
      ];

      if (isPackage) {
        cols.push(
          {
            key: 'pieceCount',
            header: 'عدد القطع',
            render: (_value: unknown, row: InvoiceItem & Record<string, unknown>) => {
              const index = items.findIndex((i) => i.id === row.id);
              return (
                <Input
                  type="number"
                  value={row.pieceCount || ''}
                  onChange={(e) =>
                    onPieceCountChange(index, Number(e.target.value) || 0)
                  }
                  placeholder="عدد القطع"
                  className="min-w-15"
                  error={itemErrors?.[index]?.pieceCount?.message}
                />
              );
            },
          },
          {
            key: 'pricePerPiece',
            header: 'سعر القطعة',
            render: (_value: unknown, row: InvoiceItem & Record<string, unknown>) => {
              const pieceCount = row.pieceCount as number || 0;
              const pricePerPiece = pieceCount > 0 ? row.pricePerItem / pieceCount : 0;
              return (
                <span className="font-semibold">
                  {pricePerPiece > 0 ? `${pricePerPiece.toLocaleString(undefined, { maximumFractionDigits: 2 })} جنيه` : '-'}
                </span>
              );
            },
          },
        );
      }

      cols.push({
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
      });

      return cols;
    }, [items, isPackage, onQuantityChange, onPriceChange, onPieceCountChange, onRemoveItem, itemErrors]);

    const tableData = items as (InvoiceItem & Record<string, unknown>)[];
    const hasItems = items.length > 0;

    return (
      <div className="sm:px-8 flex flex-col gap-4">
        <div className="flex items-center flex-col sm:flex-row justify-between gap-2">
          <div className="flex items-center gap-4">
            <ToggleGroup
              options={INVOICE_MODE_OPTIONS}
              value={mode}
              onChange={onModeChange}
              disabled={hasItems}
              disabledTooltip="لا يمكن تغيير النوع بعد اضافة اصناف، قم بحذف الاصناف اولا"
            />
            <SearchableSelect
              value={invoiceType}
              onChange={onInvoiceTypeChange}
              options={INVOICE_TYPES}
              placeholder="نوع الفاتورة"
              error={invoiceTypeError}
              widthClass="w-40"
            />

            <label
              className="flex items-center gap-2"
              title={hasItems ? 'لا يمكن تغيير النوع بعد اضافة اصناف، قم بحذف الاصناف اولا' : undefined}
            >
              <span className="text-sm font-semibold text-gray-700">إضافة متغيرات</span>
              <Switch
                checked={withVariants}
                onCheckedChange={onWithVariantsChange}
                disabled={hasItems}
              />
            </label>
          </div>

          <Button
            type="button"
            variant="default"
            className="w-fit self-end sm:self-auto flex items-center gap-2 rounded-full font-semibold text-xs sm:text-sm"
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
