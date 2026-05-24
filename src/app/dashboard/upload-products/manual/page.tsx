'use client';
import { LiaPlusSolid } from 'react-icons/lia';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import ClientInformation from './ClientInformation';
import Order from './Order';
import OrderDetails from './OrderDetails';
import ShippingSection from './ShippingSection';
import PaymentSection from './PaymentSection';
import ConfirmationSection from './ConfirmationSection';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import { buildManualOrderPayload } from '@/utils/manualOrder/payload';
import { createManualOrder } from '@/lib/api/manualOrdersApi';
import { manualOrderSchema, ManualOrderFormData } from './schema';
import { useMerchantSettings } from '@/app/dashboard/store-settings/hooks/useStoreSettings';

function Manual() {
  const selectedProducts = useProductDropdownStore(
    (state) => state.selectedProducts
  );

  const {
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
  } = useForm<ManualOrderFormData>({
    resolver: zodResolver(manualOrderSchema),
    defaultValues: {
      orderSource: {
        utmSource: '',
        pageName: '',
      },
      customer: {
        name: '',
        phoneNumbers: [''],
        address: '',
        notes: '',
      },
      shipping: {
        shippingCompany: '',
        governorate: '',
        city: '',
        shippingCost: '',
        returnShippingCost: '',
        shippingType: 'DELIVERY',
        returnShipmentContent: '',
      },
      payment: {
        paymentMethod: 'CASH',
      },
      needsConfirmation: false,
      total: '',
      packagingNotes: '',
    },
  });

  const { settings } = useMerchantSettings();

  useEffect(() => {
    if (settings?.defaultReturnShippingCost != null) {
      setValue('shipping.returnShippingCost', String(settings.defaultReturnShippingCost));
    }
  }, [settings?.defaultReturnShippingCost, setValue]);

  const [productsError, setProductsError] = useState<string | null>(null);

  const formValues = watch();

  const onSubmit = async (data: ManualOrderFormData) => {
    setProductsError(null);

    if (!selectedProducts || selectedProducts.length === 0) {
      setProductsError('يجب اختيار منتج واحد على الأقل');
      const errorElement = document.querySelector('[data-field-error="products"]');
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const payload = buildManualOrderPayload({
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

      await createManualOrder(payload);

      toast.success('تم إنشاء الطلب بنجاح!');
      reset();
      useProductDropdownStore.getState().setSelectedProducts([]);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join('\n') : msg || 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.'
      );
    }
  };

  const handleInvalidSubmit = () => {
    if (!selectedProducts || selectedProducts.length === 0) {
      setProductsError('يجب اختيار منتج واحد على الأقل');
      const errorElement = document.querySelector('[data-field-error="products"]');
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const findFirstErrorField = (): string | null => {
      if (errors.orderSource?.utmSource) return 'utmSource';
      if (errors.orderSource?.pageName) return 'pageName';
      if (errors.customer?.name) return 'name';
      if (errors.customer?.phoneNumbers) return 'phoneNumbers';
      if (errors.customer?.address) return 'address';
      if (errors.shipping?.shippingCompany) return 'shippingCompany';
      if (errors.shipping?.governorate) return 'governorate';
      if (errors.shipping?.city) return 'city';
      if (errors.shipping?.shippingCost) return 'shippingCost';
      if (errors.shipping?.shippingType) return 'shippingType';
      if (errors.shipping?.returnShipmentContent) return 'returnShipmentContent';
      if (errors.payment?.paymentMethod) return 'paymentMethod';
      return null;
    };

    const firstErrorField = findFirstErrorField();
    if (firstErrorField) {
      const errorElement = document.querySelector(`[data-field-error="${firstErrorField}"]`);
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <form onSubmit={handleFormSubmit(onSubmit, handleInvalidSubmit)} noValidate>
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

        <PaymentSection
          paymentMethod={formValues.payment.paymentMethod}
          onPaymentMethodChange={(v) => {
            setValue('payment.paymentMethod', v);
            clearErrors('payment.paymentMethod');
          }}
          errors={{
            paymentMethod: errors.payment?.paymentMethod?.message,
          }}
        />

        <ConfirmationSection
          needsConfirmation={formValues.needsConfirmation}
          onNeedsConfirmationChange={(v) => {
            setValue('needsConfirmation', v);
          }}
        />

        <div className="flex justify-end ml-6">
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
              <>
                <LiaPlusSolid className="w-6 h-6 text-white" />
                إضافة طلب
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default Manual;
