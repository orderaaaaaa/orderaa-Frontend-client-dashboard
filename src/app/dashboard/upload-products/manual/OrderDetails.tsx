'use client';

import React, { useMemo, useEffect, useRef, useState } from 'react';
import ProductDropdown from '@/components/productDropdown';
import EditProductModal from '@/components/OrderDetails/EditProductModal';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import {
  LiaPlusSolid,
  LiaMinusSolid,
  LiaTrashSolid,
  LiaEditSolid,
} from 'react-icons/lia';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { OrderDetailsProps } from './types';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { roundMoney } from '@/utils/money';

function toPrice(price: string): number {
  const value = Number(price);
  return Number.isFinite(value) ? value : 0;
}

interface ProductTableRow {
  id: number;
  index: number;
  name: string;
  image: string;
  price: string;
  quantity: number;
  selectedVariants: Array<{ attribute: string; option: string }>;
  variantKey: string;
  sourceIndex?: number;
  variantEdited: boolean;
}

function OrderDetails({
  total,
  packagingNotes,
  onTotalChange,
  onPackagingNotesChange,
  errors,
  failingProductIndex = null,
}: OrderDetailsProps) {
  const selectedProducts = useProductDropdownStore(
    (state) => state.selectedProducts
  );
  const setSelectedProducts = useProductDropdownStore(
    (state) => state.setSelectedProducts
  );

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const getVariantKey = (product: (typeof selectedProducts)[0]) => {
    return JSON.stringify(
      [...product.selectedVariants].sort((a, b) => a.attribute.localeCompare(b.attribute))
    );
  };

  const updateQuantity = (productId: number, variantKey: string, delta: number) => {
    const updatedProducts = selectedProducts.map((p) => {
      const currentKey = getVariantKey(p);
      if (p.id === productId && currentKey === variantKey) {
        const newQuantity = Math.max(1, (p.quantity || 1) + delta);
        return { ...p, quantity: newQuantity };
      }
      return p;
    });
    setSelectedProducts(updatedProducts);
  };

  const removeProduct = (productId: number, variantKey: string) => {
    const updatedProducts = selectedProducts.filter(
      (p) => !(p.id === productId && getVariantKey(p) === variantKey)
    );
    setSelectedProducts(updatedProducts);
  };

  const replaceVariant = (
    index: number,
    attributeOptionIds: number[],
    chosenValues: Record<string, string>
  ) => {
    const current = selectedProducts[index];
    if (!current) return;
    const edited = {
      ...current,
      selectedVariants: Object.entries(chosenValues).map(
        ([attribute, option]) => ({ attribute, option })
      ),
      attributeOptionIds,
      variantEdited: true,
    };
    const editedKey = getVariantKey(edited);
    const twinIndex = selectedProducts.findIndex(
      (p, i) => i !== index && p.id === edited.id && getVariantKey(p) === editedKey
    );
    const twin = twinIndex === -1 ? undefined : selectedProducts[twinIndex];
    const keepsBothBindings =
      twin !== undefined &&
      twin.sourceIndex !== undefined &&
      edited.sourceIndex !== undefined &&
      twin.sourceIndex !== edited.sourceIndex;
    if (twin === undefined || keepsBothBindings) {
      setSelectedProducts(
        selectedProducts.map((p, i) => (i === index ? edited : p))
      );
      return;
    }
    setSelectedProducts(
      selectedProducts.flatMap((p, i) => {
        if (i === index) return [];
        if (i === twinIndex) {
          return [
            {
              ...p,
              quantity: (p.quantity || 1) + (edited.quantity || 1),
              sourceIndex: p.sourceIndex ?? edited.sourceIndex,
              variantEdited: true,
            },
          ];
        }
        return [p];
      })
    );
  };

  const editingProduct =
    editingIndex === null ? undefined : selectedProducts[editingIndex];
  const editingVariants = useMemo(
    () =>
      Object.fromEntries(
        (editingProduct?.selectedVariants ?? []).map((variant) => [
          variant.attribute,
          variant.option,
        ])
      ),
    [editingProduct]
  );

  const calculatedTotal = useMemo(() => {
    return roundMoney(
      selectedProducts.reduce((sum, product) => {
        const price = toPrice(product.price);
        const quantity = product.quantity || 1;
        return sum + price * quantity;
      }, 0)
    );
  }, [selectedProducts]);

  const onTotalChangeRef = useRef(onTotalChange);
  onTotalChangeRef.current = onTotalChange;

  const prevCalculatedTotalRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevCalculatedTotalRef.current !== calculatedTotal) {
      prevCalculatedTotalRef.current = calculatedTotal;
      onTotalChangeRef.current(String(calculatedTotal));
    }
  }, [calculatedTotal]);

  const tableData: ProductTableRow[] = useMemo(() => {
    return selectedProducts.map((product, index) => ({
      id: product.id,
      index,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: product.quantity || 1,
      selectedVariants: product.selectedVariants,
      variantKey: getVariantKey(product),
      sourceIndex: product.sourceIndex,
      variantEdited: product.variantEdited === true,
    }));
  }, [selectedProducts]);

  const renderProduct = (row: ProductTableRow) => {
    const isFailing =
      failingProductIndex !== null &&
      row.sourceIndex === failingProductIndex &&
      !row.variantEdited;
    return (
      <div
        className={
          isFailing
            ? 'border-2 border-red-500 rounded-lg p-2'
            : undefined
        }
      >
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 overflow-hidden rounded border border-gray-200 bg-gray-100 flex-shrink-0">
            {row.image ? (
              <img
                src={row.image}
                alt={row.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                لا صورة
              </div>
            )}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-semibold text-sm break-words">{row.name}</span>
            {row.selectedVariants.map((variant) => (
              <span
                key={variant.attribute}
                className="text-gray-600 text-xs"
              >
                {variant.attribute}: {variant.option}
              </span>
            ))}
          </div>
        </div>
        {isFailing && (
          <p className="text-red-600 text-xs mt-1">اختر خيارات هذا المنتج</p>
        )}
        <button
          type="button"
          aria-label={`تعديل خيارات ${row.name}`}
          onClick={(e) => {
            e.stopPropagation();
            setEditingIndex(row.index);
          }}
          className="mt-2 min-h-10 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <LiaEditSolid className="w-4 h-4" />
          تعديل الخيارات
        </button>
      </div>
    );
  };

  const renderQuantity = (row: ProductTableRow) => (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`إنقاص كمية ${row.name}`}
        onClick={(e) => {
          e.stopPropagation();
          updateQuantity(row.id, row.variantKey, -1);
        }}
        disabled={row.quantity <= 1}
        className="size-10 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <LiaMinusSolid className="w-4 h-4" />
      </button>
      <span
        aria-live="polite"
        className="text-gray-700 font-medium min-w-[1.5rem] text-center text-sm"
      >
        {row.quantity}
      </span>
      <button
        type="button"
        aria-label={`زيادة كمية ${row.name}`}
        onClick={(e) => {
          e.stopPropagation();
          updateQuantity(row.id, row.variantKey, 1);
        }}
        className="size-10 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 cursor-pointer"
      >
        <LiaPlusSolid className="w-4 h-4" />
      </button>
    </div>
  );

  const renderLineTotal = (row: ProductTableRow) => (
    <span className="text-gray-700 font-medium text-sm whitespace-nowrap">
      {roundMoney(toPrice(row.price) * row.quantity)} ج.م
    </span>
  );

  const renderRemove = (row: ProductTableRow) => (
    <button
      type="button"
      aria-label={`حذف ${row.name}`}
      onClick={(e) => {
        e.stopPropagation();
        removeProduct(row.id, row.variantKey);
      }}
      className="size-10 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
    >
      <LiaTrashSolid className="w-5 h-5" />
    </button>
  );

  const columns: DataTableColumn<Record<string, unknown>>[] = [
    {
      key: 'product',
      header: 'المنتج',
      className: 'min-w-[120px]',
      render: (_, rowData) => renderProduct(rowData as unknown as ProductTableRow),
    },
    {
      key: 'quantity',
      header: 'الكمية',
      className: 'text-center min-w-[100px]',
      render: (_, rowData) => renderQuantity(rowData as unknown as ProductTableRow),
    },
    {
      key: 'total',
      header: 'الإجمالي',
      className: 'text-center min-w-[80px]',
      render: (_, rowData) => renderLineTotal(rowData as unknown as ProductTableRow),
    },
    {
      key: 'actions',
      header: 'حذف',
      className: 'text-center w-[50px]',
      render: (_, rowData) => renderRemove(rowData as unknown as ProductTableRow),
    },
  ];

  const renderMobileRow = (rowData: Record<string, unknown>) => {
    const row = rowData as unknown as ProductTableRow;
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">{renderProduct(row)}</div>
          {renderRemove(row)}
        </div>
        <div className="flex items-center justify-between gap-3">
          {renderQuantity(row)}
          {renderLineTotal(row)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">تفاصيل المنتج</h1>
        <div className="mb-5" data-field-error="products">
          <div className="mb-1">
            <label className="block font-medium text-[16px]">
              اسم المنتج <span className="text-red-500">*</span>
            </label>
          </div>
          <ProductDropdown
            placeholder="ابحث عن منتج"
            className="w-full"
            selectClassName={`border-2 w-full bg-white p-2 rounded-sm ${errors?.products && 'border-red-500'
              }`}
          />
          {errors?.products && (
            <p className="text-red-600 text-sm mt-2">{errors.products}</p>
          )}
        </div>

        {selectedProducts.length > 0 && (
          <>
            <div className="mt-6">
              <DataTable
                columns={columns}
                data={tableData as unknown as Record<string, unknown>[]}
                keyField="index"
                className="border-0 shadow-none"
                renderMobileRow={renderMobileRow}
              />
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center gap-4">
              <label className="text-lg font-semibold text-gray-700 whitespace-nowrap">
                المجموع الكلي:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  name="total"
                  type="text"
                  value={total}
                  onChange={(e) => onTotalChange(e.target.value)}
                  className="w-32 text-center font-semibold"
                  inputClassName="bg-white"
                  error={errors?.total}
                />
                <span className="text-lg font-semibold text-gray-700">ج.م</span>
              </div>
            </div>
          </>
        )}

        {editingProduct && (
          <EditProductModal
            isOpen={editingIndex !== null}
            onClose={() => setEditingIndex(null)}
            onSave={(attributeOptionIds, chosenValues) => {
              if (editingIndex !== null) {
                replaceVariant(editingIndex, attributeOptionIds, chosenValues);
              }
            }}
            productId={editingProduct.id}
            currentVariants={editingVariants}
          />
        )}

        <div className="mt-6">
          <div className="mb-1">
            <label className="block font-medium text-[16px]">
              ملاحظات التغليف
            </label>
          </div>
          <Textarea
            name="packagingNotes"
            placeholder="ملاحظات التغليف"
            className="max-w-[1158px] h-[120px] bg-white"
            value={packagingNotes}
            onChange={(e) => onPackagingNotesChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
