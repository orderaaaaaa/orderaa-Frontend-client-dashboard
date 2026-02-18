'use client';

import { useCallback, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { LiaCheckSolid } from 'react-icons/lia';
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

export function AddInvoiceContent() {
  const router = useRouter();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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

  const { append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });

  const creator = watch('creator');
  const nickname = watch('nickname');
  const items = watch('items');
  const invoiceImage = watch('invoiceImage');

  const handleQuantityChange = useCallback(
    (index: number, value: number) => {
      const safeValue = Math.max(0, value);
      const item = items[index];
      if (!item) return;
      update(index, {
        ...item,
        quantity: safeValue,
        total: safeValue * item.pricePerItem,
      });
    },
    [update, items],
  );

  const handlePriceChange = useCallback(
    (index: number, value: number) => {
      const safeValue = Math.max(0, value);
      const item = items[index];
      if (!item) return;
      update(index, {
        ...item,
        pricePerItem: safeValue,
        total: item.quantity * safeValue,
      });
    },
    [update, items],
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
    },
    [],
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
          onQuantityChange={handleQuantityChange}
          onPriceChange={handlePriceChange}
          onRemoveItem={handleRemoveItem}
          onAddItemClick={handleOpenProductModal}
          itemErrors={errors.items as Record<number, { quantity?: { message?: string }; pricePerItem?: { message?: string }; name?: { message?: string } }> | undefined}
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
          <div className="w-24 h-24 rounded-full border-2 border-green-200 flex items-center justify-center">
            <LiaCheckSolid className="w-12 h-12 text-green-500" />
          </div>
          <p className="text-lg font-bold text-gray-800">
            تم إضافة فاتورة جديدة بنجاح
          </p>
          <Button
            type="button"
            variant="default"
            className="rounded-full px-10"
            onClick={() => router.push('/dashboard/purchases/all-invoices')}
          >
            العودة للفواتير
          </Button>
        </div>
      </BaseModal>
    </div>
  );
}
