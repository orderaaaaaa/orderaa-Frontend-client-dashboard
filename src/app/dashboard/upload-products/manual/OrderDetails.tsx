'use client';

import React, { useMemo } from 'react';
import ProductDropdown from '@/components/productDropdown';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import { LiaPlusSolid, LiaMinusSolid, LiaTrashSolid } from 'react-icons/lia';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { OrderDetailsProps } from './types';

interface ProductTableRow {
  id: number;
  index: number;
  name: string;
  image: string;
  price: string;
  quantity: number;
  selectedVariants: Array<{ label: string; value: string }>;
  variantKey: string;
}

function OrderDetails({ errors }: OrderDetailsProps) {
  const selectedProducts = useProductDropdownStore(
    (state) => state.selectedProducts
  );
  const setSelectedProducts = useProductDropdownStore(
    (state) => state.setSelectedProducts
  );

  const getVariantKey = (product: (typeof selectedProducts)[0]) => {
    return JSON.stringify(
      [...product.selectedVariants].sort((a, b) => a.label.localeCompare(b.label))
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

  const totalPrice = selectedProducts.reduce((sum, product) => {
    const price = parseInt(product.price) || 0;
    const quantity = product.quantity || 1;
    return sum + price * quantity;
  }, 0);

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
    }));
  }, [selectedProducts]);

  const columns = useMemo<DataTableColumn<Record<string, unknown>>[]>(
    () => [
      {
        key: 'product',
        header: 'المنتج',
        className: 'min-w-[120px]',
        render: (_, rowData) => {
          const row = rowData as unknown as ProductTableRow;
          return (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 overflow-hidden rounded border border-gray-200 bg-gray-100 flex-shrink-0">
                {row.image ? (
                  <img
                    src={row.image}
                    alt={row.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-[8px] sm:text-[10px]">
                    لا صورة
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-xs sm:text-sm">{row.name}</span>
                {row.selectedVariants.map((variant) => (
                  <span
                    key={variant.label}
                    className="text-gray-500 text-[10px] sm:text-xs"
                  >
                    {variant.label}: {variant.value}
                  </span>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        key: 'quantity',
        header: 'الكمية',
        className: 'text-center min-w-[100px]',
        render: (_, rowData) => {
          const row = rowData as unknown as ProductTableRow;
          return (
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(row.id, row.variantKey, -1);
                }}
                disabled={row.quantity <= 1}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <LiaMinusSolid className="w-3 h-3" />
              </button>
              <span className="text-gray-700 font-medium min-w-[1.5rem] text-center text-xs sm:text-sm">
                {row.quantity}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(row.id, row.variantKey, 1);
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                <LiaPlusSolid className="w-3 h-3" />
              </button>
            </div>
          );
        },
      },
      {
        key: 'total',
        header: 'الاجمالي',
        className: 'text-center min-w-[80px]',
        render: (_, rowData) => {
          const row = rowData as unknown as ProductTableRow;
          return (
            <span className="text-gray-700 font-medium text-xs sm:text-sm">
              {parseInt(row.price) * row.quantity} ج.م
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: '',
        className: 'text-center w-[50px]',
        render: (_, rowData) => {
          const row = rowData as unknown as ProductTableRow;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeProduct(row.id, row.variantKey);
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
            >
              <LiaTrashSolid className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          );
        },
      },
    ],
    [updateQuantity, removeProduct]
  );

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
            selectClassName={`border-2 w-full bg-[#EAEAEA40] p-2 rounded-sm ${
              errors?.products ? 'border-red-500' : 'border-primary'
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
              />
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-lg font-semibold text-gray-700">
                المجموع الكلي: {totalPrice} ج.م
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderDetails;
