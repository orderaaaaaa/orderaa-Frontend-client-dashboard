'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { LiaPlusSolid, LiaTrashAltSolid, LiaCubeSolid, LiaCubesSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import ToggleGroup from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { InvoiceItem, InvoiceMode } from '../types';
import { INVOICE_TYPES } from '../constants';
import { formatMoney } from '@/utils/formatMoney';

interface ItemFieldError {
  count?: { message?: string };
  unitPrice?: { message?: string };
  piecesPerPackage?: { message?: string };
  name?: { message?: string };
}

const INVOICE_MODE_OPTIONS: { value: InvoiceMode; label: string; icon: React.ReactNode }[] = [
  { value: 'singular', label: 'قطعة', icon: <LiaCubeSolid className="w-4 h-4" /> },
  { value: 'package', label: 'باكدج', icon: <LiaCubesSolid className="w-4 h-4" /> },
];

type InvoiceRow = InvoiceItem & Record<string, unknown>;

const LOCK_HINT_ID = 'invoice-items-lock-hint';
const LOCK_HINT = 'لا يمكن تغيير نوع الإدخال أو المتغيرات بعد إضافة أصناف، احذف الأصناف أولاً';

function piecePriceLabel(row: InvoiceItem): string {
  const piecesPerPackage = row.piecesPerPackage || 0;
  const piecePrice = piecesPerPackage > 0 ? row.unitPrice / piecesPerPackage : 0;
  return piecePrice > 0 ? formatMoney(String(piecePrice)) : '-';
}

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
      () => items.reduce((sum, item) => sum + item.count * item.unitPrice, 0),
      [items],
    );

    const indexOf = useCallback(
      (row: InvoiceRow) => items.findIndex((i) => i.id === row.id),
      [items],
    );

    const renderCountInput = useCallback(
      (row: InvoiceRow, index: number, className?: string) => (
        <Input
          type="number"
          inputMode="numeric"
          aria-label={`${isPackage ? 'عدد الطرود' : 'العدد'} — ${row.name}`}
          value={row.count || ''}
          onChange={(e) => onQuantityChange(index, Number(e.target.value) || 0)}
          placeholder={isPackage ? 'عدد الطرود' : 'العدد'}
          className={className}
          error={itemErrors?.[index]?.count?.message}
        />
      ),
      [isPackage, onQuantityChange, itemErrors],
    );

    const renderPriceInput = useCallback(
      (row: InvoiceRow, index: number, className?: string) => (
        <Input
          type="number"
          inputMode="decimal"
          aria-label={`${isPackage ? 'سعر الطرد' : 'سعر الصنف'} — ${row.name}`}
          value={row.unitPrice || ''}
          onChange={(e) => onPriceChange(index, Number(e.target.value) || 0)}
          placeholder="السعر"
          className={className}
          error={itemErrors?.[index]?.unitPrice?.message}
        />
      ),
      [isPackage, onPriceChange, itemErrors],
    );

    const renderPiecesInput = useCallback(
      (row: InvoiceRow, index: number, className?: string) => (
        <Input
          type="number"
          inputMode="numeric"
          aria-label={`عدد القطع في الطرد — ${row.name}`}
          value={row.piecesPerPackage || ''}
          onChange={(e) => onPieceCountChange(index, Number(e.target.value) || 0)}
          placeholder="عدد القطع في الطرد"
          className={className}
          error={itemErrors?.[index]?.piecesPerPackage?.message}
        />
      ),
      [onPieceCountChange, itemErrors],
    );

    const renderRemoveButton = useCallback(
      (row: InvoiceRow, index: number) => (
        <Button
          type="button"
          variant="ghost"
          size="touch"
          aria-label={`حذف الصنف ${row.name}`}
          onClick={() => onRemoveItem(index)}
          className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <LiaTrashAltSolid className="w-5 h-5" />
        </Button>
      ),
      [onRemoveItem],
    );

    const columns: DataTableColumn<InvoiceRow>[] = useMemo(() => {
      const cols: DataTableColumn<InvoiceRow>[] = [
        {
          key: 'name',
          header: 'اسم الصنف',
        },
        {
          key: 'count',
          header: isPackage ? 'عدد الطرود' : 'العدد',
          render: (_value: unknown, row: InvoiceRow) =>
            renderCountInput(row, indexOf(row), 'min-w-15'),
        },
        {
          key: 'unitPrice',
          header: isPackage ? 'سعر الطرد' : 'سعر الصنف',
          render: (_value: unknown, row: InvoiceRow) => (
            <div className="flex items-center flex-row gap-2">
              {renderPriceInput(row, indexOf(row), 'min-w-15')}
              ج.م
            </div>
          ),
        },
        {
          key: 'total',
          header: 'الإجمالي',
          render: (_value: unknown, row: InvoiceRow) => (
            <span className="font-semibold whitespace-nowrap">
              {formatMoney(String(row.count * row.unitPrice))}
            </span>
          ),
        },
      ];

      if (isPackage) {
        cols.push(
          {
            key: 'piecesPerPackage',
            header: 'عدد القطع في الطرد',
            render: (_value: unknown, row: InvoiceRow) =>
              renderPiecesInput(row, indexOf(row), 'min-w-15'),
          },
          {
            key: 'piecePrice',
            header: 'سعر القطعة',
            render: (_value: unknown, row: InvoiceRow) => (
              <span className="font-semibold whitespace-nowrap">{piecePriceLabel(row)}</span>
            ),
          },
        );
      }

      cols.push({
        key: 'actions',
        header: 'حذف',
        className: 'w-12',
        render: (_value: unknown, row: InvoiceRow) => renderRemoveButton(row, indexOf(row)),
      });

      return cols;
    }, [isPackage, indexOf, renderCountInput, renderPriceInput, renderPiecesInput, renderRemoveButton]);

    const renderMobileRow = useCallback(
      (row: InvoiceRow) => {
        const index = indexOf(row);
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-gray-800 break-words min-w-0 pt-2">{row.name}</span>
              {renderRemoveButton(row, index)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-medium text-gray-600">
                  {isPackage ? 'عدد الطرود' : 'العدد'}
                </span>
                {renderCountInput(row, index)}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-medium text-gray-600">
                  {isPackage ? 'سعر الطرد (ج.م)' : 'سعر الصنف (ج.م)'}
                </span>
                {renderPriceInput(row, index)}
              </div>
              {isPackage && (
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-medium text-gray-600">عدد القطع في الطرد</span>
                  {renderPiecesInput(row, index)}
                </div>
              )}
              {isPackage && (
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-medium text-gray-600">سعر القطعة</span>
                  <span className="font-semibold py-3">{piecePriceLabel(row)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
              <span className="text-xs font-medium text-gray-600">الإجمالي</span>
              <span className="font-semibold">{formatMoney(String(row.count * row.unitPrice))}</span>
            </div>
          </div>
        );
      },
      [isPackage, indexOf, renderCountInput, renderPriceInput, renderPiecesInput, renderRemoveButton],
    );

    const tableData = items as InvoiceRow[];
    const hasItems = items.length > 0;

    return (
      <div className="sm:px-8 flex flex-col gap-4">
        <div className="flex items-center flex-col sm:flex-row justify-between gap-2">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <ToggleGroup
                options={INVOICE_MODE_OPTIONS}
                value={mode}
                onChange={onModeChange}
                disabled={hasItems}
              />
              <SearchableSelect
                value={invoiceType}
                onChange={onInvoiceTypeChange}
                options={INVOICE_TYPES}
                placeholder="نوع الفاتورة"
                error={invoiceTypeError}
                widthClass="w-40"
              />

              <label className="flex items-center gap-2 min-h-10">
                <span className="text-sm font-semibold text-gray-700">إضافة متغيرات</span>
                <Switch
                  checked={withVariants}
                  onCheckedChange={onWithVariantsChange}
                  disabled={hasItems}
                  aria-describedby={hasItems ? LOCK_HINT_ID : undefined}
                />
              </label>
            </div>
            {hasItems && (
              <p id={LOCK_HINT_ID} className="text-xs text-gray-600 text-center sm:text-start">
                {LOCK_HINT}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="default"
            className="w-fit self-end sm:self-auto flex items-center gap-2 rounded-full font-semibold text-xs sm:text-sm h-10"
            onClick={onAddItemClick}
          >
            <LiaPlusSolid className="w-5 h-5" />
            <span>إضافة صنف</span>
          </Button>
        </div>

        <div>
          <DataTable
            columns={columns}
            data={tableData}
            keyField="id"
            emptyMessage="لا توجد أصناف، قم بإضافة أصناف للفاتورة"
            renderMobileRow={renderMobileRow}
          />

          {items.length > 0 && (
            <div className="flex justify-end px-2 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold">
                <span className="text-gray-800">الإجمالي الكلي</span>
                <span className="text-primary">{formatMoney(String(grandTotal))}</span>
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
