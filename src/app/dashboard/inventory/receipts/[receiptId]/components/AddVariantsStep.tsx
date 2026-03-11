'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { LiaPlusSolid, LiaTimesSolid, LiaEditSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { MOCK_RECEIPT_PRODUCTS } from '../constants';
import { ReceiptProduct, SelectedVariant } from '../types';
import AddVariantsModal from './AddVariantsModal';

interface AddVariantsStepProps {
  onNext: () => void;
  productVariants: Record<number, SelectedVariant[]>;
  onProductVariantsChange: (variants: Record<number, SelectedVariant[]>) => void;
}

type ProductRow = ReceiptProduct & Record<string, unknown>;

const AddVariantsStep = memo(({ onNext, productVariants, onProductVariantsChange }: AddVariantsStepProps) => {
  const [selectedProduct, setSelectedProduct] = useState<ReceiptProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddVariant = useCallback((product: ReceiptProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleSaveVariants = useCallback(
    (variants: SelectedVariant[]) => {
      if (!selectedProduct) return;
      onProductVariantsChange({
        ...productVariants,
        [selectedProduct.id]: variants,
      });
    },
    [selectedProduct, productVariants, onProductVariantsChange]
  );

  const handleRemoveVariant = useCallback(
    (productId: number, variantId: number, color: string, size: string) => {
      const current = productVariants[productId] ?? [];
      const filtered = current.filter(
        (v) => !(v.variantId === variantId && v.color === color && v.size === size)
      );
      if (filtered.length === 0) {
        const { [productId]: _, ...rest } = productVariants;
        onProductVariantsChange(rest);
      } else {
        onProductVariantsChange({ ...productVariants, [productId]: filtered });
      }
    },
    [productVariants, onProductVariantsChange]
  );

  const handleQuantityChange = useCallback(
    (productId: number, variantId: number, color: string, size: string, value: string) => {
      const num = parseInt(value, 10);
      const qty = isNaN(num) ? 0 : Math.max(0, num);
      const current = productVariants[productId] ?? [];
      const updated = current.map((v) =>
        v.variantId === variantId && v.color === color && v.size === size
          ? { ...v, quantity: qty }
          : v
      );
      onProductVariantsChange({ ...productVariants, [productId]: updated });
    },
    [productVariants, onProductVariantsChange]
  );

  const products = MOCK_RECEIPT_PRODUCTS as ProductRow[];

  const totalProducts = products.length;
  const totalItems = useMemo(
    () => products.reduce((sum, p) => sum + p.itemsCount, 0),
    [products]
  );

  const columns: DataTableColumn<ProductRow>[] = useMemo(
    () => [
      {
        key: 'image',
        header: 'صورة المنتج',
        className: 'w-20',
        render: (_value: unknown, row: ProductRow) => (
          <div className="flex items-center justify-center">
            <Image
              src={row.image as string}
              alt={row.name as string}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          </div>
        ),
      },
      {
        key: 'name',
        header: 'اسم المنتج',
      },
      {
        key: 'itemsCount',
        header: 'عدد القطع',
      },
      {
        key: 'actions',
        header: '',
        className: 'w-44',
        render: (_value: unknown, row: ProductRow) => {
          const variants = productVariants[row.id as number];
          const hasVariants = variants && variants.length > 0;
          return hasVariants ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs font-semibold flex items-center gap-1.5 border-primary text-primary hover:bg-primary hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleAddVariant(row as unknown as ReceiptProduct);
              }}
            >
              <LiaEditSolid className="w-4 h-4" />
              تعديل ({new Set(variants.map((v) => v.variantId)).size})
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="rounded-full text-xs font-semibold flex items-center gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                handleAddVariant(row as unknown as ReceiptProduct);
              }}
            >
              <LiaPlusSolid className="w-4 h-4" />
              إضافة متغير
            </Button>
          );
        },
      },
    ],
    [handleAddVariant, productVariants]
  );

  const renderSubRow = useCallback(
    (row: ProductRow) => {
      const variants = productVariants[row.id as number];
      if (!variants || variants.length === 0) return null;

      return (
        <div className="bg-gray-50/80 px-4 sm:px-6 py-3 flex flex-wrap gap-2">
          {variants.map((v) => (
            <div
              key={`${v.variantId}-${v.color}-${v.size}`}
              className="flex items-center gap-2 bg-white border border-primary/20 rounded-full px-3 py-1.5 text-xs"
            >
              <span className="font-semibold text-gray-800">{v.variantName}</span>
              <span className="text-gray-400">|</span>
              <span className="text-primary font-medium">{v.color}</span>
              <span className="text-gray-400">|</span>
              <span className="text-primary font-medium">{v.size}</span>
              <span className="text-gray-400">|</span>
              <Input
                type="number"
                value={v.quantity}
                onChange={(e) =>
                  handleQuantityChange(row.id as number, v.variantId, v.color, v.size, e.target.value)
                }
                min={0}
                className="w-16"
                inputClassName="!py-0.5 !px-1.5 text-center text-xs !rounded-full !bg-white"
              />
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 min-w-0 p-0 text-gray-400 hover:text-red-500 transition-colors"
                onClick={() =>
                  handleRemoveVariant(row.id as number, v.variantId, v.color, v.size)
                }
              >
                <LiaTimesSolid className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      );
    },
    [productVariants, handleRemoveVariant]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-gray-800">مرحلة إضافة المتغيرات</h2>
        <p className="text-sm text-gray-500">
          يرجاء التاكد من عدد القطع كل صنف قبل تحديد المتغيرات
        </p>
      </div>

      <DataTable
        columns={columns}
        data={products}
        keyField="id"
        emptyMessage="لا توجد منتجات في هذا الاستلام"
        renderSubRow={renderSubRow}
      />

      <div className="flex flex-row items-center justify-between px-4">
        <p className="text-base font-bold text-gray-800">
          إجمالي المنتجات {totalProducts}
        </p>
        <p className="text-base font-bold text-gray-800">
          إجمالي عدد القطع {totalItems} قطعة
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          variant="default"
          size="lg"
          className="rounded-full font-semibold px-12"
          onClick={onNext}
        >
          التالي
        </Button>
      </div>

      {selectedProduct && (
        <AddVariantsModal
          key={selectedProduct.id}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          existingVariants={productVariants[selectedProduct.id]}
          onSave={handleSaveVariants}
        />
      )}
    </div>
  );
});

AddVariantsStep.displayName = 'AddVariantsStep';

export default AddVariantsStep;
