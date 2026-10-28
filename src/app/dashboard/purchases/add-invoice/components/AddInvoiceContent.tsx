'use client';

import { formatNumber } from '@/utils/format';
import { useCallback, useRef, useState, useMemo, type ReactNode } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
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
import {
  buildProductsPayload,
  invoiceFormDefaults,
  partialAmountOfInvoice,
  paymentStatusOfInvoice,
  payloadTotal,
  variantKeyOf,
} from '../utils';
import {
  MONEY_DECIMALS_MESSAGE,
  hasAtMostTwoDecimals,
  moneyCents,
} from '@/utils/money';
import { getApiErrorMessage, getApiErrorStatus } from '@/utils/apiError';
import {
  useCreateSupplierInvoiceMutation,
  useSuppliersQuery,
  useSupplierInvoiceByIdQuery,
  useUpdateSupplierInvoiceMutation,
} from '@/services/suppliers';
import type { SupplierInvoiceApiItem, UpdateSupplierInvoiceDto } from '@/lib/api/suppliers';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import {
  SUPPLIER_INVOICE_APPROVED_MESSAGE,
  SUPPLIER_INVOICE_NOT_FOUND_MESSAGE,
  supplierInvoiceErrorMessage,
  supplierInvoiceErrorStatus,
} from '@/lib/api/supplierInvoiceErrors';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { useEmployeesQuery } from '@/services/employees';
import { uploadFile } from '@/lib/api/upload';
import { StickyFormFooter } from '@/components/ui/sticky-form-footer';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

interface AddInvoiceFormProps {
  initialInvoice?: SupplierInvoiceApiItem;
}

function AddInvoiceForm({ initialInvoice }: AddInvoiceFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = initialInvoice !== undefined;
  const canAttribute = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_ATTRIBUTE);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState<InvoiceMode>(() =>
    initialInvoice?.entryMode === 'PACKAGE' ? 'package' : 'singular',
  );
  const [withVariants, setWithVariants] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [initialPayment] = useState(() => ({
    status: paymentStatusOfInvoice(initialInvoice),
    amount: partialAmountOfInvoice(initialInvoice),
  }));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialPayment.status);
  const [partialAmount, setPartialAmount] = useState(initialPayment.amount);
  const [partialError, setPartialError] = useState<string | null>(null);

  const createInvoiceMutation = useCreateSupplierInvoiceMutation();
  const updateInvoiceMutation = useUpdateSupplierInvoiceMutation(initialInvoice?.id ?? 0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AddInvoiceFormData>({
    resolver: zodResolver(addInvoiceSchema),
    defaultValues: initialInvoice
      ? invoiceFormDefaults(initialInvoice, invoiceMode)
      : {
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

  const invoiceTotal = useMemo(
    () => payloadTotal(buildProductsPayload(items ?? [], invoiceMode)),
    [items, invoiceMode],
  );

  const isSaving =
    isSubmitting || createInvoiceMutation.isPending || isUploadingImage;
  const hasUnsavedChanges =
    !isSuccessModalOpen &&
    (isEdit
      ? isDirty ||
        (invoiceImage !== undefined && invoiceImage !== null) ||
        paymentStatus !== initialPayment.status ||
        partialAmount.trim() !== initialPayment.amount
      : (items?.length ?? 0) > 0 ||
        supplierId !== undefined ||
        createdByEmployeeId !== undefined ||
        (invoiceImage !== undefined && invoiceImage !== null) ||
        invoiceType !== 'PURCHASE' ||
        paymentStatus !== 'unpaid' ||
        partialAmount.trim() !== '');
  const guard = useUnsavedChangesGuard(hasUnsavedChanges && !isSaving);

  const handleInvoiceTypeChange = useCallback(
    (value: string) => {
      setValue('invoiceType', value as 'PURCHASE' | 'RETURN', { shouldValidate: true });
      if (value === 'RETURN') {
        setPaymentStatus('unpaid');
        setPartialAmount('');
        setPartialError(null);
      }
    },
    [setValue],
  );

  const handlePaymentStatusChange = useCallback((status: PaymentStatus) => {
    setPaymentStatus(status);
    setPartialError(null);
  }, []);

  const handlePartialAmountChange = useCallback((value: string) => {
    setPartialAmount(value);
    setPartialError(null);
  }, []);

  const handleQuantityChange = useCallback(
    (index: number, value: number) => {
      const safeValue = Math.max(0, value);
      const item = items[index];
      if (!item) return;
      const newTotal = safeValue * item.unitPrice;
      const piecesPerPackage = item.piecesPerPackage || 0;
      update(index, {
        ...item,
        count: safeValue,
        total: newTotal,
        piecePrice: piecesPerPackage > 0 ? item.unitPrice / piecesPerPackage : 0,
      });
    },
    [update, items],
  );

  const handlePriceChange = useCallback(
    (index: number, value: number) => {
      const safeValue = Math.max(0, value);
      const item = items[index];
      if (!item) return;
      const newTotal = item.count * safeValue;
      const piecesPerPackage = item.piecesPerPackage || 0;
      update(index, {
        ...item,
        unitPrice: safeValue,
        total: newTotal,
        piecePrice: piecesPerPackage > 0 ? safeValue / piecesPerPackage : 0,
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
        piecesPerPackage: safeValue,
        piecePrice: safeValue > 0 ? item.unitPrice / safeValue : 0,
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
      const takenKeys = new Set(
        isEdit
          ? (items ?? []).map((item) =>
              variantKeyOf(item.productId, (item.variants ?? []).map((v) => v.attributeOptionId)),
            )
          : [],
      );
      products.forEach((product) => {
        const key = variantKeyOf(
          product.id,
          (product.selectedVariants ?? []).map((v) => v.attributeOptionId),
        );
        if (isEdit) {
          if (takenKeys.has(key)) return;
          takenKeys.add(key);
        }
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
          count: 0,
          unitPrice: 0,
          total: 0,
          piecesPerPackage: 0,
          piecePrice: 0,
          variants: product.selectedVariants ?? [],
        });
      });
      setIsProductModalOpen(false);
    },
    [append, isEdit, items],
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
      const products = buildProductsPayload(data.items, invoiceMode);
      const totalAmount = payloadTotal(products);
      let resolvedPaymentAmount: number | undefined;
      if (data.invoiceType === 'PURCHASE') {
        if (paymentStatus === 'full') {
          resolvedPaymentAmount = totalAmount;
        } else if (paymentStatus === 'partial') {
          if (!hasAtMostTwoDecimals(partialAmount)) {
            setPartialError(MONEY_DECIMALS_MESSAGE);
            return;
          }
          const partialCents = moneyCents(Number(partialAmount) || 0);
          if (partialCents <= 0) {
            setPartialError('أدخل المبلغ المدفوع');
            return;
          }
          if (partialCents > moneyCents(totalAmount)) {
            setPartialError(`المبلغ المدفوع لا يمكن أن يتجاوز إجمالي الفاتورة (${formatNumber(totalAmount)} ج.م)`);
            return;
          }
          resolvedPaymentAmount = Number(partialAmount);
        }
      }

      try {
        let images: string[] | undefined;

        if (data.invoiceImage && data.invoiceImage.length > 0) {
          const file = data.invoiceImage[0];
          setIsUploadingImage(true);
          let uploadResponse;
          try {
            uploadResponse = await uploadFile(file);
          } finally {
            setIsUploadingImage(false);
          }
          if (uploadResponse?.url) {
            images = [uploadResponse.url];
          }
        }

        if (initialInvoice) {
          const body: UpdateSupplierInvoiceDto = { products };
          if (data.invoiceType === 'PURCHASE') {
            body.paymentAmount = resolvedPaymentAmount ?? 0;
          }
          if (images) {
            body.images = images;
          }
          if (
            canAttribute &&
            data.createdByEmployeeId !== undefined &&
            data.createdByEmployeeId !== initialInvoice.createdByEmployeeId
          ) {
            body.createdByEmployeeId = data.createdByEmployeeId;
          }
          await updateInvoiceMutation.mutateAsync(body);
          toast.success('تم حفظ تعديلات الفاتورة');
          router.push(`/dashboard/purchases/all-invoices/${initialInvoice.id}`);
          return;
        }

        await createInvoiceMutation.mutateAsync({
          type: data.invoiceType,
          supplierId: data.supplierId,
          createdByEmployeeId: data.createdByEmployeeId,
          paymentAmount: resolvedPaymentAmount,
          externalInvoiceNumber: data.externalInvoiceNumber,
          entryMode: invoiceMode === 'package' ? 'PACKAGE' : 'SINGULAR',
          products,
          images,
        });
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          router.push('/dashboard/purchases/all-invoices');
        }, 2000);
      } catch (err: unknown) {
        if (initialInvoice) {
          toast.error(supplierInvoiceErrorMessage(err, 'حدث خطأ أثناء حفظ الفاتورة'));
          const status = getApiErrorStatus(err);
          if (status === 404 || status === 409) {
            await invalidateAndWait(queryClient, [
              [QUERY_KEYS.SUPPLIER_INVOICES],
              [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, initialInvoice.id],
            ]);
          }
          return;
        }
        setSubmitError(getApiErrorMessage(err, 'حدث خطأ أثناء إضافة الفاتورة'));
      }
    },
    [
      createInvoiceMutation,
      updateInvoiceMutation,
      initialInvoice,
      canAttribute,
      queryClient,
      router,
      paymentStatus,
      partialAmount,
      invoiceMode,
    ],
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
        className="flex flex-col gap-8"
      >
        <AddInvoiceHeader isEdit={isEdit} code={initialInvoice?.code} />

        <InvoiceDropdowns
          supplierId={supplierId}
          supplierLocked={isEdit}
          onSupplierChange={(value) =>
            setValue('supplierId', value, { shouldValidate: true })
          }
          supplierOptions={supplierOptions}
          employeeId={createdByEmployeeId}
          creatorLocked={isEdit && !canAttribute}
          onEmployeeChange={(value) => setValue('createdByEmployeeId', value)}
          employeeOptions={employeeOptions}
          showPayment={invoiceType === 'PURCHASE'}
          invoiceTotal={invoiceTotal}
          paymentStatus={paymentStatus}
          onPaymentStatusChange={handlePaymentStatusChange}
          partialAmount={partialAmount}
          onPartialAmountChange={handlePartialAmountChange}
          partialError={partialError}
          errors={{
            supplierId: errors.supplierId?.message,
          }}
        />

        <InvoiceItemsTable
          items={items ?? []}
          mode={invoiceMode}
          invoiceType={invoiceType ?? ''}
          onInvoiceTypeChange={handleInvoiceTypeChange}
          invoiceTypeError={errors.invoiceType?.message}
          withVariants={withVariants}
          onWithVariantsChange={setWithVariants}
          structureLocked={isEdit}
          onModeChange={handleModeChange}
          onQuantityChange={handleQuantityChange}
          onPriceChange={handlePriceChange}
          onPieceCountChange={handlePieceCountChange}
          onRemoveItem={handleRemoveItem}
          onAddItemClick={handleOpenProductModal}
          itemErrors={errors.items as Record<number, { count?: { message?: string }; unitPrice?: { message?: string }; piecesPerPackage?: { message?: string }; name?: { message?: string } }> | undefined}
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

        <StickyFormFooter
          isDirty={hasUnsavedChanges}
          isSaving={isSaving}
          status={
            isUploadingImage
              ? 'جارٍ رفع الصورة…'
              : isSaving
                ? 'جارٍ حفظ الفاتورة...'
                : `إجمالي الفاتورة: ${formatNumber(invoiceTotal)} ج.م`
          }
        >
          <Button
            type="submit"
            variant="default"
            disabled={isSaving || isSuccessModalOpen}
            loading={isSaving}
            loadingText={isUploadingImage ? 'جارٍ رفع الصورة…' : 'جارٍ الحفظ...'}
            className="min-h-10 rounded-full font-semibold text-sm sm:text-base px-10"
          >
            {isEdit ? 'حفظ التعديلات' : 'حفظ الفاتورة'}
          </Button>
        </StickyFormFooter>
      </form>

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onConfirm={handleAddProducts}
        existingProductIds={existingNoVariantProductIds}
        existingVariantCombos={existingVariantCombos}
        allowVariants={withVariants}
      />

      <UnsavedChangesDialog
        isOpen={guard.pendingHref !== null}
        onStay={guard.cancelLeave}
        onLeave={guard.confirmLeave}
        message="إذا غادرت الصفحة الآن ستفقد بيانات الفاتورة التي أدخلتها."
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

function AddInvoiceNotice({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <EmptyState
      title={title}
      action={
        action ?? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/purchases/all-invoices">العودة إلى الفواتير</Link>
          </Button>
        )
      }
    />
  );
}

function EditInvoiceRoute({ invoiceId }: { invoiceId: number }) {
  const isValidId = Number.isInteger(invoiceId) && invoiceId > 0;
  const canUpdate = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_UPDATE);
  const { data: invoice, isPending, isError, error, refetch } = useSupplierInvoiceByIdQuery(
    isValidId ? invoiceId : undefined,
  );

  if (!isValidId || (isError && supplierInvoiceErrorStatus(error) === 404)) {
    return <AddInvoiceNotice title={SUPPLIER_INVOICE_NOT_FOUND_MESSAGE} />;
  }
  if (!canUpdate) {
    return <AddInvoiceNotice title="ليست لديك صلاحية تعديل فواتير الموردين" />;
  }
  if (isPending) {
    return <PageLoading message="جاري تحميل الفاتورة..." />;
  }
  if (!invoice) {
    return <ErrorState error={error} fallback="تعذّر تحميل الفاتورة" onRetry={() => void refetch()} />;
  }

  const detailAction = (
    <Button asChild variant="outline" className="rounded-full">
      <Link href={`/dashboard/purchases/all-invoices/${invoice.id}`}>عرض الفاتورة</Link>
    </Button>
  );

  if (invoice.isApproved) {
    return <AddInvoiceNotice title={SUPPLIER_INVOICE_APPROVED_MESSAGE} action={detailAction} />;
  }
  if (invoice.type === 'PAID') {
    return (
      <AddInvoiceNotice
        title="المدفوعات المستقلة لا تُعدَّل من نموذج الفاتورة"
        action={detailAction}
      />
    );
  }

  return <AddInvoiceForm key={invoice.id} initialInvoice={invoice} />;
}

interface AddInvoiceContentProps {
  invoiceId?: number;
}

export function AddInvoiceContent({ invoiceId }: AddInvoiceContentProps) {
  const canCreate = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_CREATE);

  if (invoiceId === undefined) {
    if (!canCreate) {
      return <AddInvoiceNotice title="ليست لديك صلاحية إضافة فواتير الموردين" />;
    }
    return <AddInvoiceForm />;
  }

  return <EditInvoiceRoute invoiceId={invoiceId} />;
}
