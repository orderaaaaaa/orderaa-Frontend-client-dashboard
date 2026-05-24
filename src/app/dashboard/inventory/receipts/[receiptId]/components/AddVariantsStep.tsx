'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { IconType } from 'react-icons';
import { LiaPlusSolid, LiaTimesSolid, LiaExclamationCircleSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { SelectedVariant } from '../types';
import AddVariantsModal from './AddVariantsModal';

export interface InvoiceProductRow {
  id: number;
  productId: number;
  name: string;
  quantity: number;
}

interface AddVariantsStepProps {
  products: InvoiceProductRow[];
  onNext: () => void;
  productVariants: Record<number, SelectedVariant[]>;
  onProductVariantsChange: (variants: Record<number, SelectedVariant[]>) => void;
  nextLabel?: string;
  nextIcon?: IconType;
  nextDisabled?: boolean;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/60x60/eeeeee/333?text=%E2%80%94';

type ProductRow = InvoiceProductRow & Record<string, unknown>;

function variantKey(v: SelectedVariant): string {
  return [...v.attributeOptionIds].sort((a, b) => a - b).join('-');
}

const AddVariantsStep = memo(
  ({
    products,
    onNext,
    productVariants,
    onProductVariantsChange,
    nextLabel,
    nextIcon: NextIcon,
    nextDisabled,
  }: AddVariantsStepProps) => {
    const [selectedProduct, setSelectedProduct] = useState<InvoiceProductRow | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddVariant = useCallback((product: InvoiceProductRow) => {
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
        const current = productVariants[selectedProduct.id] ?? [];
        const byKey = new Map(current.map((v) => [variantKey(v), v]));
        for (const v of variants) {
          if (!byKey.has(variantKey(v))) byKey.set(variantKey(v), v);
        }
        onProductVariantsChange({
          ...productVariants,
          [selectedProduct.id]: Array.from(byKey.values()),
        });
      },
      [selectedProduct, productVariants, onProductVariantsChange],
    );

    const handleRemoveVariant = useCallback(
      (invoiceProductId: number, key: string) => {
        const current = productVariants[invoiceProductId] ?? [];
        const filtered = current.filter((v) => variantKey(v) !== key);
        if (filtered.length === 0) {
          const { [invoiceProductId]: _, ...rest } = productVariants;
          onProductVariantsChange(rest);
        } else {
          onProductVariantsChange({ ...productVariants, [invoiceProductId]: filtered });
        }
      },
      [productVariants, onProductVariantsChange],
    );

    const handleQuantityChange = useCallback(
      (invoiceProductId: number, key: string, value: string) => {
        const num = parseInt(value, 10);
        const qty = isNaN(num) ? 0 : Math.max(0, num);
        const current = productVariants[invoiceProductId] ?? [];
        const updated = current.map((v) => (variantKey(v) === key ? { ...v, quantity: qty } : v));
        onProductVariantsChange({ ...productVariants, [invoiceProductId]: updated });
      },
      [productVariants, onProductVariantsChange],
    );

    const totalProducts = products.length;
    const totalItems = useMemo(
      () => products.reduce((sum, p) => sum + p.quantity, 0),
      [products],
    );

    const enteredByProduct = useCallback(
      (productId: number) =>
        (productVariants[productId] ?? []).reduce((sum, v) => sum + (v.quantity || 0), 0),
      [productVariants],
    );

    const totalEntered = useMemo(
      () => products.reduce((sum, p) => sum + enteredByProduct(p.id), 0),
      [products, enteredByProduct],
    );

    const isCountComplete = useMemo(
      () => products.length > 0 && products.every((p) => enteredByProduct(p.id) === p.quantity),
      [products, enteredByProduct],
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
                src={PLACEHOLDER_IMAGE}
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
          key: 'quantity',
          header: 'عدد القطع',
        },
        {
          key: 'actions',
          header: '',
          className: 'w-44',
          render: (_value: unknown, row: ProductRow) => {
            const variants = productVariants[row.id as number];
            const count = variants?.length ?? 0;
            return (
              <Button
                variant="default"
                size="sm"
                className="rounded-full text-xs font-semibold flex items-center gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddVariant(row as InvoiceProductRow);
                }}
              >
                <LiaPlusSolid className="w-4 h-4" />
                إضافة متغير{count > 0 ? ` (${count})` : ''}
              </Button>
            );
          },
        },
      ],
      [handleAddVariant, productVariants],
    );

    const renderSubRow = useCallback(
      (row: ProductRow) => {
        const variants = productVariants[row.id as number];
        if (!variants || variants.length === 0) return null;

        return (
          <div className="bg-gray-50/80 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:flex-wrap items-start gap-2">
            {variants.map((v) => {
              const key = variantKey(v);
              const displayLabel = v.attributeLabels.length > 0 ? v.attributeLabels.join(' | ') : 'بدون متغير';
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-white border border-primary/20 rounded-full px-3 py-1.5 text-xs w-fit"
                >
                  <span className="text-primary font-medium">{displayLabel}</span>
                  <span className="text-gray-400">|</span>
                  <Input
                    type="number"
                    value={v.quantity}
                    onChange={(e) => handleQuantityChange(row.id as number, key, e.target.value)}
                    min={0}
                    className="w-16"
                    inputClassName="!py-0.5 !px-1.5 text-center text-xs !rounded-full !bg-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5 min-w-0 p-0 text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => handleRemoveVariant(row.id as number, key)}
                  >
                    <LiaTimesSolid className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        );
      },
      [productVariants, handleRemoveVariant, handleQuantityChange],
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
          data={products as ProductRow[]}
          keyField="id"
          emptyMessage="لا توجد منتجات في هذا الاستلام"
          renderSubRow={renderSubRow}
        />

        <div className="flex flex-row items-center justify-between px-4">
          <p className="text-base font-bold text-gray-800">إجمالي المنتجات {totalProducts}</p>
          <p
            className={clsx(
              'text-base font-bold',
              isCountComplete ? 'text-gray-800' : 'text-red-600',
            )}
          >
            إجمالي عدد القطع المُدخلة {totalEntered} / {totalItems} قطعة
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            variant="default"
            size="lg"
            className="rounded-full font-semibold flex items-center gap-2 px-12"
            onClick={onNext}
            disabled={nextDisabled || !isCountComplete}
          >
            {NextIcon && <NextIcon className="w-5 h-5" />}
            {nextLabel ?? 'التالي'}
          </Button>
        </div>

        {selectedProduct && (
          <AddVariantsModal
            key={selectedProduct.id}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            productId={selectedProduct.productId}
            productName={selectedProduct.name}
            existingVariants={productVariants[selectedProduct.id]}
            onSave={handleSaveVariants}
          />
        )}
      </div>
    );
  },
);

AddVariantsStep.displayName = 'AddVariantsStep';

export default AddVariantsStep;
