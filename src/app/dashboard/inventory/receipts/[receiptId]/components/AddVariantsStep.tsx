'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { LiaPlusSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { MOCK_RECEIPT_PRODUCTS } from '../constants';
import { ReceiptProduct } from '../types';
import AddVariantsModal from './AddVariantsModal';

interface AddVariantsStepProps {
  onNext: () => void;
}

type ProductRow = ReceiptProduct & Record<string, unknown>;

const AddVariantsStep = memo(({ onNext }: AddVariantsStepProps) => {
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
        className: 'w-40',
        render: (_value: unknown, row: ProductRow) => (
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
        ),
      },
    ],
    [handleAddVariant]
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

      <AddVariantsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productName={selectedProduct?.name ?? ''}
      />
    </div>
  );
});

AddVariantsStep.displayName = 'AddVariantsStep';

export default AddVariantsStep;
