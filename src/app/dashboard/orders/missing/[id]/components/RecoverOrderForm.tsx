'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import Order from '@/app/dashboard/upload-products/manual/Order';
import ClientInformation from '@/app/dashboard/upload-products/manual/ClientInformation';
import OrderDetails from '@/app/dashboard/upload-products/manual/OrderDetails';
import ShippingSection from '@/app/dashboard/upload-products/manual/ShippingSection';
import ConfirmationSection from '@/app/dashboard/upload-products/manual/ConfirmationSection';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import { buildManualOrderPayload } from '@/utils/manualOrder/payload';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useRecoverMissingOrder } from '@/services/missingOrders';
import type {
  MissingOrderDetail,
  MissingOrderErrorBody,
  OrderPaymentStatus,
  RecoverMissingOrderPayload,
} from '@/types/missing-orders';
import { recoverOrderSchema } from '../schema';
import type { RecoverOrderFormData } from '../schema';
import { buildMissingOrderPrefill } from '../utils/prefill';
import RecoverPaymentSection from './RecoverPaymentSection';
import { DismissDialog } from './DismissDialog';

interface RecoverOrderFormProps {
  id: number;
  row: MissingOrderDetail;
}

function isMissingOrderErrorBody(value: unknown): value is MissingOrderErrorBody {
  return typeof value === 'object' && value !== null;
}

export function RecoverOrderForm({ id, row }: RecoverOrderFormProps) {
  const router = useRouter();
  const [isDismissOpen, setIsDismissOpen] = useState(false);
  const { defaultValues, initialProducts, highlightFields } = useMemo(
    () => buildMissingOrderPrefill(row),
    [row],
  );

  const {
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<RecoverOrderFormData>({
    resolver: zodResolver(recoverOrderSchema),
    defaultValues,
  });

  const selectedProducts = useProductDropdownStore((state) => state.selectedProducts);
  const [productsError, setProductsError] = useState<string | null>(null);
  const { mutateAsync: recover } = useRecoverMissingOrder(id);

  useEffect(() => {
    useProductDropdownStore.getState().setSelectedProducts(initialProducts);
    return () => {
      useProductDropdownStore.getState().setSelectedProducts([]);
    };
  }, [initialProducts]);

  useEffect(() => {
    if (highlightFields.length > 0) {
      trigger(highlightFields as (keyof RecoverOrderFormData)[]);
    }
  }, [highlightFields, trigger]);

  const formValues = watch();

  const handlePaymentStatusChange = (status: OrderPaymentStatus) => {
    setValue('payment.paymentStatus', status);
    clearErrors('payment.paymentStatus');
    if (status === 'CASH_ON_DELIVERY') {
      setValue('payment.prepaidAmount', '');
      clearErrors('payment.prepaidAmount');
    }
  };

  const onSubmit = async (data: RecoverOrderFormData) => {
    setProductsError(null);

    if (!selectedProducts || selectedProducts.length === 0) {
      setProductsError('يجب اختيار منتج واحد على الأقل');
      return;
    }

    const basePayload = buildManualOrderPayload({
      utmSource: data.orderSource.utmSource,
      pageName: data.orderSource.pageName,
      customer: {
        name: data.customer.name,
        phoneNumbers: data.customer.phoneNumbers,
        address: data.customer.address,
        notes: data.customer.notes,
      },
      shipping: {
        shippingCompany: data.shipping.shippingCompany,
        governorate: data.shipping.governorate,
        city: data.shipping.city,
        shippingCost: data.shipping.shippingCost || '',
        returnShippingCost: data.shipping.returnShippingCost || '',
        shippingType: data.shipping.shippingType,
        returnShipmentContent: data.shipping.returnShipmentContent,
      },
      paymentMethod: data.payment.paymentMethod,
      needsConfirmation: data.needsConfirmation,
      total: data.total,
      packagingNotes: data.packagingNotes,
      selectedProducts: selectedProducts.map((p) => ({
        id: p.id,
        quantity: p.quantity || 1,
        attributeOptionIds: p.attributeOptionIds || [],
      })),
    });

    const payload: RecoverMissingOrderPayload = {
      ...basePayload,
      paymentStatus: data.payment.paymentStatus,
      prepaidAmount: data.payment.prepaidAmount ? Number(data.payment.prepaidAmount) : null,
    };

    try {
      await recover(payload);
      toast.success('تم إنشاء الطلب بنجاح!');
      router.back();
    } catch (err: any) {
      const status = err?.response?.status;
      const body: unknown = err?.response?.data;

      if (
        status === 409 &&
        isMissingOrderErrorBody(body) &&
        body.code === 'ORDER_ALREADY_EXISTS'
      ) {
        toast.success(`تم إنشاء هذا الطلب بالفعل — ${body.orderCode ?? ''}`);
        router.back();
        return;
      }

      const message = isMissingOrderErrorBody(body) ? body.message : undefined;
      toast.error(
        Array.isArray(message)
          ? message.join('\n')
          : message || 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.',
      );

      if (status === 500) {
        toast.error('تواصل مع الدعم');
      }
    }
  };

  const failingProductIndex = row.failureProductIndex;

  return (
    <form onSubmit={handleFormSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-[26px]">
        <Order
          utmSource={formValues.orderSource.utmSource}
          pageName={formValues.orderSource.pageName}
          onUtmSourceChange={(v) => {
            setValue('orderSource.utmSource', v);
            clearErrors('orderSource.utmSource');
          }}
          onPageNameChange={(v) => {
            setValue('orderSource.pageName', v);
            clearErrors('orderSource.pageName');
          }}
          errors={{
            utmSource: errors.orderSource?.utmSource?.message,
            pageName: errors.orderSource?.pageName?.message,
          }}
        />

        <ClientInformation
          name={formValues.customer.name}
          phoneNumbers={formValues.customer.phoneNumbers}
          address={formValues.customer.address}
          notes={formValues.customer.notes || ''}
          onNameChange={(v) => {
            setValue('customer.name', v);
            clearErrors('customer.name');
          }}
          onPhoneNumbersChange={(v) => {
            setValue('customer.phoneNumbers', v);
            clearErrors('customer.phoneNumbers');
          }}
          onAddressChange={(v) => {
            setValue('customer.address', v);
            clearErrors('customer.address');
          }}
          onNotesChange={(v) => {
            setValue('customer.notes', v);
          }}
          errors={{
            name: errors.customer?.name?.message,
            phoneNumbers: errors.customer?.phoneNumbers?.message,
            address: errors.customer?.address?.message,
          }}
        />

        <OrderDetails
          total={formValues.total || ''}
          packagingNotes={formValues.packagingNotes || ''}
          onTotalChange={(v) => {
            setValue('total', v);
            clearErrors('total');
          }}
          onPackagingNotesChange={(v) => {
            setValue('packagingNotes', v);
          }}
          errors={{ products: productsError || undefined, total: errors.total?.message }}
          failingProductIndex={failingProductIndex}
        />

        <ShippingSection
          shippingCompany={formValues.shipping.shippingCompany}
          governorate={formValues.shipping.governorate}
          city={formValues.shipping.city}
          shippingCost={formValues.shipping.shippingCost || ''}
          returnShippingCost={formValues.shipping.returnShippingCost || ''}
          shippingType={formValues.shipping.shippingType}
          returnShipmentContent={formValues.shipping.returnShipmentContent || ''}
          onShippingCompanyChange={(v) => {
            setValue('shipping.shippingCompany', v);
            clearErrors('shipping.shippingCompany');
          }}
          onGovernorateChange={(v) => {
            setValue('shipping.governorate', v);
            clearErrors('shipping.governorate');
          }}
          onCityChange={(v) => {
            setValue('shipping.city', v);
            clearErrors('shipping.city');
          }}
          onShippingCostChange={(v) => {
            setValue('shipping.shippingCost', v);
            clearErrors('shipping.shippingCost');
          }}
          onReturnShippingCostChange={(v) => {
            setValue('shipping.returnShippingCost', v);
            clearErrors('shipping.returnShippingCost');
          }}
          onShippingTypeChange={(v) => {
            setValue('shipping.shippingType', v);
            clearErrors('shipping.shippingType');
          }}
          onReturnShipmentContentChange={(v) => {
            setValue('shipping.returnShipmentContent', v);
            clearErrors('shipping.returnShipmentContent');
          }}
          errors={{
            shippingCompany: errors.shipping?.shippingCompany?.message,
            governorate: errors.shipping?.governorate?.message,
            city: errors.shipping?.city?.message,
            shippingCost: errors.shipping?.shippingCost?.message,
            returnShippingCost: errors.shipping?.returnShippingCost?.message,
            shippingType: errors.shipping?.shippingType?.message,
            returnShipmentContent: errors.shipping?.returnShipmentContent?.message,
          }}
        />

        <RecoverPaymentSection
          paymentMethod={formValues.payment.paymentMethod}
          onPaymentMethodChange={(v) => {
            setValue('payment.paymentMethod', v);
            clearErrors('payment.paymentMethod');
          }}
          paymentStatus={formValues.payment.paymentStatus}
          onPaymentStatusChange={handlePaymentStatusChange}
          prepaidAmount={formValues.payment.prepaidAmount}
          onPrepaidAmountChange={(v) => {
            setValue('payment.prepaidAmount', v);
            clearErrors('payment.prepaidAmount');
          }}
          errors={{
            paymentMethod: errors.payment?.paymentMethod?.message,
            paymentStatus: errors.payment?.paymentStatus?.message,
            prepaidAmount: errors.payment?.prepaidAmount?.message,
          }}
        />

        <ConfirmationSection
          needsConfirmation={formValues.needsConfirmation}
          onNeedsConfirmationChange={(v) => {
            setValue('needsConfirmation', v);
          }}
        />

        <div className="flex justify-end gap-3 ml-6">
          <Can code={PERMISSION_CODES.ORDERS_MISSING_MANAGE}>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-full font-bold"
              onClick={() => setIsDismissOpen(true)}
            >
              استبعاد
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-40 rounded-full font-bold"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⟳</span>
                  جاري الإرسال...
                </>
              ) : (
                'قبول'
              )}
            </Button>
          </Can>
        </div>
      </div>

      <DismissDialog
        id={id}
        isOpen={isDismissOpen}
        onOpenChange={setIsDismissOpen}
        onDismissed={() => router.back()}
      />
    </form>
  );
}
