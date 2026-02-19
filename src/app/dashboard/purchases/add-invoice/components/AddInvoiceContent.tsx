'use client';

import { useCallback, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import ProductSelectionModal, {
  SelectableProduct,
} from '@/components/ui/product-selection-modal';
import AddInvoiceHeader from './AddInvoiceHeader';
import InvoiceDropdowns from './InvoiceDropdowns';
import InvoiceItemsTable from './InvoiceItemsTable';
import InvoiceImageSection from './InvoiceImageSection';
import { addInvoiceSchema, AddInvoiceFormData } from '../schema';
import { InvoiceMode } from '../types';

export function AddInvoiceContent() {
  const router = useRouter();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState<InvoiceMode>('singular');

  const {
    control,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<AddInvoiceFormData>({
    resolver: zodResolver(addInvoiceSchema),
    defaultValues: {
      creator: '',
      nickname: '',
      items: [],
      invoiceImage: undefined,
    },
  });

  const { append, remove, update, replace } = useFieldArray({
    control,
    name: 'items',
  });

  const savedSingularItems = useRef<AddInvoiceFormData['items']>([]);
  const savedPackageItems = useRef<AddInvoiceFormData['items']>([]);

  const creator = watch('creator');
  const nickname = watch('nickname');
  const items = watch('items');
  const invoiceImage = watch('invoiceImage');

  const handleQuantityChange = useCallback(
    (index: number, value: number) => {
      const safeValue = Math.max(0, value);
      const item = items[index];
      if (!item) return;
      const newTotal = safeValue * item.pricePerItem;
      const pieceCount = item.pieceCount || 0;
      update(index, {
        ...item,
        quantity: safeValue,
        total: newTotal,
        pricePerPiece: pieceCount > 0 ? newTotal / pieceCount : 0,
      });
    },
    [update, items],
  );

  const handlePriceChange = useCallback(
    (index: number, value: number) => {
      const safeValue = Math.max(0, value);
      const item = items[index];
      if (!item) return;
      const newTotal = item.quantity * safeValue;
      const pieceCount = item.pieceCount || 0;
      update(index, {
        ...item,
        pricePerItem: safeValue,
        total: newTotal,
        pricePerPiece: pieceCount > 0 ? newTotal / pieceCount : 0,
      });
    },
    [update, items],
  );

  const handlePieceCountChange = useCallback(
    (index: number, value: number) => {
      const safeValue = Math.max(0, value);
      const item = items[index];
      if (!item) return;
      const total = item.quantity * item.pricePerItem;
      update(index, {
        ...item,
        pieceCount: safeValue,
        pricePerPiece: safeValue > 0 ? total / safeValue : 0,
      });
    },
    [update, items],
  );

  const handleModeChange = useCallback(
    (newMode: InvoiceMode) => {
      if (newMode === invoiceMode) return;
      const currentItems = items ?? [];
      if (invoiceMode === 'singular') {
        savedSingularItems.current = currentItems;
        replace(savedPackageItems.current);
      } else {
        savedPackageItems.current = currentItems;
        replace(savedSingularItems.current);
      }
      setInvoiceMode(newMode);
    },
    [invoiceMode, items, replace],
  );

  const handleOpenProductModal = useCallback(() => {
    setIsProductModalOpen(true);
  }, []);

  const handleAddProducts = useCallback(
    (products: SelectableProduct[]) => {
      products.forEach((product) => {
        append({
          id: String(product.id),
          name: product.name,
          quantity: 0,
          pricePerItem: 0,
          total: 0,
          pieceCount: 0,
          pricePerPiece: 0,
        });
      });
      setIsProductModalOpen(false);
    },
    [append],
  );

  const handleRemoveItem = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  const handleImageChange = useCallback(
    (file: File | null) => {
      if (file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        setValue('invoiceImage', dataTransfer.files);
      } else {
        setValue('invoiceImage', undefined);
      }
    },
    [setValue],
  );

  const onSubmit = useCallback(
    (data: AddInvoiceFormData) => {
      console.log('Invoice Data:', data);
      setIsSuccessModalOpen(true);
      setTimeout(() => {
        router.push('/dashboard/purchases/all-invoices');
      }, 3000);
    },
    [router],
  );

  const imageFile =
    invoiceImage && invoiceImage instanceof FileList && invoiceImage.length > 0
      ? invoiceImage[0]
      : null;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-8 pb-8"
      >
        <AddInvoiceHeader />

        <InvoiceDropdowns
          creator={creator}
          nickname={nickname}
          onCreatorChange={(value) =>
            setValue('creator', value, { shouldValidate: true })
          }
          onNicknameChange={(value) =>
            setValue('nickname', value, { shouldValidate: true })
          }
          errors={{
            creator: errors.creator?.message,
            nickname: errors.nickname?.message,
          }}
        />

        <InvoiceItemsTable
          items={items ?? []}
          mode={invoiceMode}
          onModeChange={handleModeChange}
          onQuantityChange={handleQuantityChange}
          onPriceChange={handlePriceChange}
          onPieceCountChange={handlePieceCountChange}
          onRemoveItem={handleRemoveItem}
          onAddItemClick={handleOpenProductModal}
          itemErrors={errors.items as Record<number, { quantity?: { message?: string }; pricePerItem?: { message?: string }; pieceCount?: { message?: string }; name?: { message?: string } }> | undefined}
        />
        {errors.items?.message && (
          <p className="sm:px-8 text-red-500 text-sm -mt-6">
            {errors.items.message}
          </p>
        )}

        <InvoiceImageSection
          value={imageFile}
          onChange={handleImageChange}
          error={errors.invoiceImage?.message as string}
        />

        <div className="flex items-center justify-end sm:px-8">
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full sm:w-auto rounded-full font-semibold text-sm sm:text-base px-12"
          >
            حفظ الفاتورة
          </Button>
        </div>
      </form>

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onConfirm={handleAddProducts}
        existingProductIds={(items ?? []).map((item) => item.id)}
      />

      <BaseModal
        isOpen={isSuccessModalOpen}
        onClose={() => router.push('/dashboard/purchases/all-invoices')}
        title=""
        showFooter={false}
      >
        <div className="flex flex-col items-center gap-6 py-4">
          <svg
            className="w-24 h-24"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="48"
              cy="48"
              r="46"
              stroke="#bbf7d0"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-[draw-circle_0.6s_ease-out_forwards]"
              style={{
                strokeDasharray: 289,
                strokeDashoffset: 289,
              }}
            />
            <path
              d="M28 50 L42 64 L68 34"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-[draw-check_0.4s_ease-out_0.5s_forwards]"
              style={{
                strokeDasharray: 80,
                strokeDashoffset: 80,
              }}
            />
          </svg>
          <p className="text-lg font-bold text-gray-800">
            تم إضافة فاتورة جديدة بنجاح
          </p>
        </div>
      </BaseModal>
    </div>
  );
}
