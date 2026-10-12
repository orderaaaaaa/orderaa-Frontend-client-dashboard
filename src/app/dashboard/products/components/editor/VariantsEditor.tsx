'use client';

import React, { useMemo } from 'react';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import { Link2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { ProductDetail, ProductDetailVariant } from '../../types/products';
import { PRODUCT_EDIT_LIMITS } from '../../types/products';
import { VARIANT_DELETE_REASON_LABELS } from '../../utils/productApiError';
import { CompactField } from '../CompactField';
import { VariantImagePicker } from './VariantImagePicker';
import {
  type NewVariantRow,
  type VariantEdit,
  type VariantPatch,
  applyVariantPatch,
  emptyNewVariantRow,
  existingRowKey,
} from './editorModel';

interface VariantsEditorProps {
  detail: ProductDetail;
  edits: Record<number, VariantPatch>;
  onEdit: (variantId: number, patch: VariantPatch) => void;
  newRows: NewVariantRow[];
  onNewRowsChange: (rows: NewVariantRow[]) => void;
  rowErrors: Record<string, string>;
  attributesDirty: boolean;
  imageChoices: string[];
  onDelete: (variant: ProductDetailVariant) => void;
  deletingId: number | null;
  disabled?: boolean;
}

type Row = {
  id: string;
  variant?: ProductDetailVariant;
  newRow?: NewVariantRow;
} & Record<string, unknown>;

const variantLabel = (variant: ProductDetailVariant) =>
  variant.labels.length === 0
    ? 'المنتج بدون خصائص'
    : variant.labels.map((label) => label.option).join(' / ');

export function VariantsEditor({
  detail,
  edits,
  onEdit,
  newRows,
  onNewRowsChange,
  rowErrors,
  attributesDirty,
  imageChoices,
  onDelete,
  deletingId,
  disabled = false,
}: VariantsEditorProps) {
  const rows: Row[] = useMemo(
    () => [
      ...detail.variants.map((variant) => ({
        id: existingRowKey(variant.id),
        variant,
      })),
      ...newRows.map((newRow) => ({ id: newRow.key, newRow })),
    ],
    [detail.variants, newRows],
  );

  const updateNewRow = (key: string, patch: Partial<NewVariantRow>) =>
    onNewRowsChange(
      newRows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );

  const editOf = (row: Row): VariantEdit | undefined =>
    row.variant
      ? applyVariantPatch(row.variant, edits[row.variant.id])
      : row.newRow;

  const setField = (row: Row, patch: VariantPatch) => {
    const current = editOf(row);
    if (!current) return;
    if (row.variant) onEdit(row.variant.id, patch);
    else if (row.newRow) updateNewRow(row.newRow.key, patch);
  };

  const rowName = (row: Row) =>
    row.variant ? variantLabel(row.variant) : 'متغير جديد';

  const renderIdentity = (row: Row) => {
    if (row.variant) {
      return (
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 break-words">
            {variantLabel(row.variant)}
          </p>
          {row.variant.deleteConfirmation === 'HAS_EXTERNAL_LINK' && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              <Link2 className="size-3" aria-hidden />
              مرتبط بالمتجر
            </span>
          )}
        </div>
      );
    }
    const newRow = row.newRow as NewVariantRow;
    return (
      <div className="flex flex-wrap gap-2">
        {detail.attributes.map((attribute) => {
          const selectId = `${newRow.key}-attr-${attribute.id}`;
          return (
            <div key={attribute.id} className="flex min-w-[8rem] flex-1 flex-col gap-1">
              <label htmlFor={selectId} className="text-xs font-medium text-gray-600">
                {attribute.name}
              </label>
              <select
                id={selectId}
                value={newRow.optionByAttribute[attribute.id] ?? ''}
                disabled={disabled}
                onChange={(event) =>
                  updateNewRow(newRow.key, {
                    optionByAttribute: {
                      ...newRow.optionByAttribute,
                      [attribute.id]:
                        event.target.value === ''
                          ? undefined
                          : Number(event.target.value),
                    },
                  })
                }
                className="min-h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">اختر</option>
                {attribute.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    );
  };

  const renderField = (
    row: Row,
    field: 'sku' | 'barcode' | 'price',
    label: string,
    hideLabel: boolean,
  ) => {
    const edit = editOf(row);
    const pricePlaceholder =
      detail.price !== null ? String(detail.price) : undefined;
    return (
      <CompactField
        label={`${label} ${rowName(row)}`}
        hideLabel={hideLabel}
        value={edit?.[field] ?? ''}
        disabled={disabled}
        type={field === 'price' ? 'number' : 'text'}
        inputMode={field === 'price' ? 'decimal' : undefined}
        min={field === 'price' ? 0 : undefined}
        placeholder={field === 'price' ? pricePlaceholder : undefined}
        onChange={(event) => setField(row, { [field]: event.target.value })}
      />
    );
  };

  const renderImage = (row: Row) => (
    <VariantImagePicker
      value={editOf(row)?.image ?? null}
      choices={imageChoices}
      label={rowName(row)}
      disabled={disabled}
      onChange={(image) => setField(row, { image })}
    />
  );

  const renderAction = (row: Row) => {
    if (row.newRow) {
      const key = row.newRow.key;
      return (
        <Button
          type="button"
          variant="ghost"
          size="touch"
          className="text-red-500 hover:bg-red-50"
          disabled={disabled}
          onClick={() => onNewRowsChange(newRows.filter((item) => item.key !== key))}
          aria-label="إزالة المتغير الجديد"
        >
          <LiaTimesSolid className="size-5" />
        </Button>
      );
    }
    const variant = row.variant as ProductDetailVariant;
    if (!variant.deletable) {
      return (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="touch"
            disabled
            aria-label={`حذف المتغير ${variantLabel(variant)}`}
            aria-describedby={`${row.id}-blocked`}
          >
            <Trash2 className="size-4" />
          </Button>
          <span id={`${row.id}-blocked`} className="text-xs text-gray-500">
            لا يمكن الحذف:{' '}
            {variant.notDeletableReason
              ? VARIANT_DELETE_REASON_LABELS[variant.notDeletableReason]
              : 'مستخدم'}
          </span>
        </div>
      );
    }
    return (
      <Button
        type="button"
        variant="ghost"
        size="touch"
        className="text-red-500 hover:bg-red-50"
        disabled={disabled || deletingId === variant.id}
        onClick={() => onDelete(variant)}
        aria-label={`حذف المتغير ${variantLabel(variant)}`}
      >
        <Trash2 className="size-4" />
      </Button>
    );
  };

  const renderRowError = (row: Row) =>
    rowErrors[row.id] ? (
      <p role="alert" className="text-xs text-red-500">
        {rowErrors[row.id]}
      </p>
    ) : null;

  const columns: DataTableColumn<Row>[] = [
    {
      key: 'identity',
      header: 'المتغير',
      className: 'min-w-[10rem] align-top',
      render: (_value, row) => (
        <div className="space-y-1">
          {renderIdentity(row)}
          {renderRowError(row)}
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      className: 'align-top',
      render: (_value, row) => renderField(row, 'sku', 'SKU', true),
    },
    {
      key: 'barcode',
      header: 'الباركود',
      className: 'align-top',
      render: (_value, row) => renderField(row, 'barcode', 'الباركود', true),
    },
    {
      key: 'price',
      header: 'السعر',
      className: 'w-32 align-top',
      render: (_value, row) => renderField(row, 'price', 'السعر', true),
    },
    {
      key: 'image',
      header: 'الصورة',
      className: 'w-16 align-top',
      render: (_value, row) => renderImage(row),
    },
    {
      key: 'action',
      header: 'حذف',
      className: 'w-40 align-top',
      render: (_value, row) => renderAction(row),
    },
  ];

  const canAddRows =
    detail.attributes.length > 0 &&
    detail.variants.length + newRows.length < PRODUCT_EDIT_LIMITS.variants;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        اترك سعر المتغير فارغاً ليأخذ سعر المنتج. لا يمكن حذف متغير عليه طلبات أو مخزون أو فواتير.
      </p>
      <DataTable<Row>
        columns={columns}
        data={rows}
        emptyMessage="لا توجد متغيرات"
        renderMobileRow={(row) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">{renderIdentity(row)}</div>
              {renderImage(row)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {renderField(row, 'sku', 'SKU', false)}
              {renderField(row, 'barcode', 'الباركود', false)}
              <div className="col-span-2">
                {renderField(row, 'price', 'السعر', false)}
              </div>
            </div>
            {renderRowError(row)}
            <div className="flex justify-end">{renderAction(row)}</div>
          </div>
        )}
      />
      {attributesDirty && (
        <p className="text-xs text-amber-700">
          القيم الجديدة للخصائص تظهر هنا بعد حفظ الخصائص.
        </p>
      )}
      {canAddRows && (
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-10 border-dashed text-primary hover:bg-primary hover:text-white"
          disabled={disabled}
          onClick={() => onNewRowsChange([...newRows, emptyNewVariantRow()])}
        >
          <LiaPlusSolid className="w-5 h-5" />
          إضافة متغير
        </Button>
      )}
    </div>
  );
}
