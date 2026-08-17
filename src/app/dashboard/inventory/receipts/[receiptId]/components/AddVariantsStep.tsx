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
        const incomingReal = variants.filter((v) => v.attributeOptionIds.length > 0);

        if (incomingReal.length === 0) {
          const existingQty = (productVariants[selectedProduct.id] ?? [])[0]?.quantity ?? variants[0]?.quantity ?? 0;
          onProductVariantsChange({
            ...productVariants,
            [selectedProduct.id]: [{ attributeOptionIds: [], attributeLabels: [], quantity: existingQty }],
          });
          return;
        }

        const current = (productVariants[selectedProduct.id] ?? []).filter(
          (v) => v.attributeOptionIds.length > 0,
        );
        const byKey = new Map(current.map((v) => [variantKey(v), v]));
        for (const v of incomingReal) {
          if (!byKey.has(variantKey(v))) byKey.set(variantKey(v), v);
        }
        onProductVariantsChange({
          ...productVariants,
          [selectedProduct.id]: Array.from(byKey.values()),
        });
      },
      [selectedProduct, productVariants, onProductVariantsChange],
    );

    const handleRowReceivedChange = useCallback(
      (invoiceProductId: number, value: string) => {
        const trimmed = value.trim();
        const qty: number | '' = trimmed === '' ? '' : Math.max(0, parseInt(trimmed, 10) || 0);
        const current = productVariants[invoiceProductId] ?? [];
        if (current.length > 1) return;
        const base = current[0] ?? { attributeOptionIds: [], attributeLabels: [], quantity: '' };
        onProductVariantsChange({
          ...productVariants,
          [invoiceProductId]: [{ ...base, quantity: qty }],
        });
      },
      [productVariants, onProductVariantsChange],
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
        const trimmed = value.trim();
        const qty: number | '' = trimmed === '' ? '' : Math.max(0, parseInt(trimmed, 10) || 0);
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
          key: 'received',
          header: 'الكمية المستلمة',
          className: 'w-40',
          render: (_value: unknown, row: ProductRow) => {
            const variants = productVariants[row.id as number] ?? [];
            const isMulti = variants.length > 1;
            const value = isMulti
              ? variants.reduce((sum, v) => sum + (typeof v.quantity === 'number' ? v.quantity : 0), 0)
              : (variants[0]?.quantity ?? '');
            return (
              <span
                className="inline-block"
                title={isMulti ? 'حدد الكمية لكل متغير بالأسفل' : undefined}
              >
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => handleRowReceivedChange(row.id as number, e.target.value)}
                  onFocus={(e) => e.currentTarget.select()}
                  onClear={() => handleRowReceivedChange(row.id as number, '')}
                  min={0}
                  clearable
                  disabled={isMulti}
                  placeholder="0"
                  className="w-28"
                />
              </span>
            );
          },
        },
        {
          key: 'difference',
          header: 'الفرق',
          className: 'w-32',
          // The per-product reconciliation: invoiced vs counted, live as it is
          // typed, so a mismatch is visible here rather than a surprise at
          // submit time — approving one rewrites the invoice's total amount.
          render: (_value: unknown, row: ProductRow) => {
            const entered = enteredByProduct(row.id as number);
            const invoiced = row.quantity as number;
            const difference = entered - invoiced;
            return (
              <span
                className={clsx(
                  'text-xs font-semibold whitespace-nowrap',
                  difference === 0 ? 'text-green-600' : 'text-amber-600',
                )}
                title={`المفوتر ${invoiced} — المُدخل ${entered}`}
              >
                {difference === 0
                  ? 'مطابق'
                  : `${difference > 0 ? '+' : ''}${difference}`}
              </span>
            );
          },
        },
        {
          key: 'actions',
          header: '',
          className: 'w-44',
          render: (_value: unknown, row: ProductRow) => {
            const variants = productVariants[row.id as number] ?? [];
            const count = variants.filter((v) => v.attributeOptionIds.length > 0).length;
            return (
              <Button
                variant="default"
                size="sm"
                className="rounded-full text-xs font-semibold flex items-center gap-1.5"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
      [handleAddVariant, handleRowReceivedChange, productVariants, enteredByProduct],
    );

    const renderSubRow = useCallback(
      (row: ProductRow) => {
        const variants = (productVariants[row.id as number] ?? []).filter(
          (v) => v.attributeOptionIds.length > 0,
        );
        if (variants.length === 0) return null;

        const showPerVariantQty = variants.length > 1;

        return (
          <div className="bg-gray-50/80 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:flex-wrap items-start gap-2">
            {variants.map((v) => {
              const key = variantKey(v);
              const displayLabel =
                v.attributeLabels.length > 0
                  ? v.attributeLabels.join(' | ')
                  : v.variantName ?? 'متغير';
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-white border border-primary/20 rounded-full px-3 py-1.5 text-xs w-fit"
                >
                  <span className="text-primary font-medium">{displayLabel}</span>
                   {showPerVariantQty && (
                     <>
                       <span className="text-gray-400">|</span>
                       <Input
                         type="number"
                         value={v.quantity}
                         onChange={(e) => handleQuantityChange(row.id as number, key, e.target.value)}
                         onFocus={(e) => e.currentTarget.select()}
                         onClear={() => handleQuantityChange(row.id as number, key, '')}
                         min={0}
                         clearable
                         className="w-16"
                         inputClassName="!py-0.5 !px-1.5 text-center text-xs !rounded-full !bg-white"
                       />
                     </>
                   )}
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
          {/* A supplier really can ship a different amount, so a mismatch is
              allowed through — it is confirmed at submit, not blocked here. */}
          {!isCountComplete && totalEntered > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <LiaExclamationCircleSolid className="w-4 h-4 shrink-0" />
              الكميات المُدخلة لا تطابق المفوتر — سيُطلب تأكيد قبل الحفظ
            </span>
          )}
          <Button
            variant="default"
            size="lg"
            className="rounded-full font-semibold flex items-center gap-2 px-12"
            onClick={onNext}
            disabled={nextDisabled || totalEntered === 0}
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
