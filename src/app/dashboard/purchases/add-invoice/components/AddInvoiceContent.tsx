'use client';

import { useCallback, useRef, useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import ProductSelectionModal, {
  SelectableProduct,
  SelectedVariant,
} from '@/components/ui/product-selection-modal';
import AddInvoiceHeader from './AddInvoiceHeader';
import InvoiceDropdowns, { type PaymentStatus } from './InvoiceDropdowns';
import InvoiceItemsTable from './InvoiceItemsTable';
import InvoiceImageSection from './InvoiceImageSection';
import { addInvoiceSchema, AddInvoiceFormData } from '../schema';
import { InvoiceMode } from '../types';
import { useCreateSupplierInvoiceMutation, useSuppliersQuery } from '@/services/suppliers';
import { useEmployeesQuery } from '@/services/employees';
import { uploadFile } from '@/lib/api/upload';

export function AddInvoiceContent() {
  const router = useRouter();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState<InvoiceMode>('singular');
  const [withVariants, setWithVariants] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [partialAmount, setPartialAmount] = useState('');

  const createInvoiceMutation = useCreateSupplierInvoiceMutation();

  const { data: suppliersData } = useSuppliersQuery({ limit: 200 });
  const suppliers = suppliersData?.data ?? [];

  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ key: String(s.id), value: s.name })),
    [suppliers],
  );

  const { data: employeesData } = useEmployeesQuery();
  const employeeOptions = useMemo(
    () => (employeesData ?? []).map((e) => ({ key: String(e.id), value: e.fullName })),
    [employeesData],
  );

  const {
    control,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<AddInvoiceFormData>({
    resolver: zodResolver(addInvoiceSchema),
    defaultValues: {
      invoiceType: 'PURCHASE',
      supplierId: undefined,
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

  const invoiceType = watch('invoiceType');
  const supplierId = watch('supplierId');
  const createdByEmployeeId = watch('createdByEmployeeId');
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
        pricePerPiece: pieceCount > 0 ? item.pricePerItem / pieceCount : 0,
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
        pricePerPiece: pieceCount > 0 ? safeValue / pieceCount : 0,
      });
    },
    [update, items],
  );

  const handlePieceCountChange = useCallback(
    (index: number, value: number) => {
      const safeValue = Math.max(0, value);
      const item = items[index];
      if (!item) return;
      update(index, {
        ...item,
        pieceCount: safeValue,
        pricePerPiece: safeValue > 0 ? item.pricePerItem / safeValue : 0,
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
        const variantSuffix = product.selectedVariants?.length
          ? ` - ${product.selectedVariants.map((v) => v.option).join(' - ')}`
          : '';
        const variantKey = product.selectedVariants?.length
          ? product.selectedVariants.map((v) => v.option).join('_')
          : '';
        const uniqueId = variantKey
          ? `${product.id}_${variantKey}`
          : `${product.id}_${Date.now()}`;
        append({
          id: uniqueId,
          productId: product.id,
          name: `${product.name}${variantSuffix}`,
          quantity: 0,
          pricePerItem: 0,
          total: 0,
          pieceCount: 0,
          pricePerPiece: 0,
          variants: product.selectedVariants ?? [],
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
    async (data: AddInvoiceFormData) => {
      setSubmitError(null);
      try {
        let images: string[] | undefined;

        if (data.invoiceImage && data.invoiceImage.length > 0) {
          const file = data.invoiceImage[0];
          const uploadResponse = await uploadFile(file);
          if (uploadResponse?.url) {
            images = [uploadResponse.url];
          }
        }

        const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.pricePerItem, 0);
        let resolvedPaymentAmount: number | undefined;
        if (paymentStatus === 'full') {
          resolvedPaymentAmount = totalAmount;
        } else if (paymentStatus === 'partial') {
          resolvedPaymentAmount = Number(partialAmount) || undefined;
        }

        await createInvoiceMutation.mutateAsync({
          type: data.invoiceType,
          supplierId: data.supplierId,
          createdByEmployeeId: data.createdByEmployeeId,
          paymentAmount: resolvedPaymentAmount,
          externalInvoiceNumber: data.externalInvoiceNumber,
          products: data.items.map((item) => ({
            productId: item.productId,
            quantity: invoiceMode === 'package' ? (item.quantity ?? 0) * (item.pieceCount ?? 0) : item.quantity,
            price: invoiceMode === 'package' ? (item.pricePerPiece ?? 0) : item.pricePerItem,
            packageCount: invoiceMode === 'package' ? item.quantity : undefined,
            piecesPerPackage: invoiceMode === 'package' ? item.pieceCount : undefined,
            attributeOptionIds: (item.variants ?? []).map((v) => v.attributeOptionId).filter((id): id is number => id !== undefined),
          })),
          images,
        });
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          router.push('/dashboard/purchases/all-invoices');
        }, 2000);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setSubmitError(axiosErr?.response?.data?.message || 'حدث خطأ أثناء إضافة الفاتورة');
      }
    },
    [createInvoiceMutation, router],
  );

  const imageFile =
    invoiceImage && invoiceImage instanceof FileList && invoiceImage.length > 0
      ? invoiceImage[0]
      : null;

  const existingVariantCombos = useMemo(() => {
    const map = new Map<number, SelectedVariant[][]>();
    for (const item of items ?? []) {
      if (item.variants?.length) {
        const existing = map.get(item.productId) ?? [];
        existing.push(item.variants);
        map.set(item.productId, existing);
      }
    }
    return map;
  }, [items]);

  const existingNoVariantProductIds = useMemo(
    () =>
      (items ?? [])
        .filter((item) => !item.variants?.length)
        .map((item) => String(item.productId)),
    [items],
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-8 pb-8"
      >
        <AddInvoiceHeader />

        <InvoiceDropdowns
          supplierId={supplierId}
          onSupplierChange={(value) =>
            setValue('supplierId', value, { shouldValidate: true })
          }
          supplierOptions={supplierOptions}
          employeeId={createdByEmployeeId}
          onEmployeeChange={(value) => setValue('createdByEmployeeId', value)}
          employeeOptions={employeeOptions}
          paymentStatus={paymentStatus}
          onPaymentStatusChange={setPaymentStatus}
          partialAmount={partialAmount}
          onPartialAmountChange={setPartialAmount}
          errors={{
            supplierId: errors.supplierId?.message,
          }}
        />

        <InvoiceItemsTable
          items={items ?? []}
          mode={invoiceMode}
          invoiceType={invoiceType ?? ''}
          onInvoiceTypeChange={(value) =>
            setValue('invoiceType', value as 'PURCHASE' | 'RETURN', { shouldValidate: true })
          }
          invoiceTypeError={errors.invoiceType?.message}
          withVariants={withVariants}
          onWithVariantsChange={setWithVariants}
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

        {submitError && (
          <p className="sm:px-8 text-red-500 text-sm">{submitError}</p>
        )}

        <div className="flex items-center justify-end sm:px-8">
          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={createInvoiceMutation.isPending}
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
        existingProductIds={existingNoVariantProductIds}
        existingVariantCombos={existingVariantCombos}
        allowVariants={withVariants}
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
