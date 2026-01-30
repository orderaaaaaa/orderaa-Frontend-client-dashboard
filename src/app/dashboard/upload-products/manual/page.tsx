'use client';
import {
  LiaPlusSolid,
  LiaCheckCircleSolid,
  LiaExclamationCircleSolid,
} from 'react-icons/lia';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from '@/components/ui/alert';
import ClientInformation from './ClientInformation';
import Order from './Order';
import OrderDetails from './OrderDetails';
import ShippingAndPayment from './ShippingAndPayment';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import Products from './Products';
import { buildManualOrderPayload } from '@/utils/manualOrder/payload';
import { createManualOrder } from '@/lib/api/manualOrdersApi';
import { manualOrderSchema, ManualOrderFormData } from './schema';

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
        platform: '',
        pageName: '',
      },
      customer: {
        customerName: '',
        phoneNumber: '',
        governorate: '',
        area: '',
        address: '',
        notes: '',
      },
      shippingPayment: {
        shipping: false,
        shippingCost: '',
        includeShipping: false,
        paymentMethod: '',
        needsConfirmation: false,
      },
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const formValues = watch();

  const onSubmit = async (data: ManualOrderFormData) => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setProductsError(null);

    if (!selectedProducts || selectedProducts.length === 0) {
      setProductsError('يجب اختيار منتج واحد على الأقل');
      const errorElement = document.querySelector('[data-field-error="products"]');
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const payload = buildManualOrderPayload({
        platform: data.orderSource.platform,
        pageName: data.orderSource.pageName,
        customerName: data.customer.customerName,
        phoneNumber: data.customer.phoneNumber,
        governorate: data.customer.governorate,
        area: data.customer.area,
        address: data.customer.address,
        notes: data.customer.notes,
        selectedProducts,
        shippingPayment: data.shippingPayment,
      });

      await createManualOrder(payload);

      setSubmitSuccess(true);
      reset();
      useProductDropdownStore.getState().setSelectedProducts([]);

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error creating manual order:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.'
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
      if (errors.orderSource?.platform) return 'platform';
      if (errors.orderSource?.pageName) return 'pageName';
      if (errors.customer?.customerName) return 'customerName';
      if (errors.customer?.phoneNumber) return 'phoneNumber';
      if (errors.customer?.governorate) return 'governorate';
      if (errors.customer?.area) return 'area';
      if (errors.customer?.address) return 'address';
      if (errors.customer?.notes) return 'notes';
      if (errors.shippingPayment?.shippingCost) return 'shippingCost';
      if (errors.shippingPayment?.paymentMethod) return 'paymentMethod';
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
      {submitSuccess && (
        <div className="mx-6 mb-4">
          <Alert className="bg-green-50 border-green-200 text-green-700">
            <LiaCheckCircleSolid className="text-green-600" />
            <AlertTitle>تم إنشاء الطلب بنجاح!</AlertTitle>
          </Alert>
        </div>
      )}

      {submitError && (
        <div className="mx-6 mb-4">
          <Alert variant="destructive">
            <LiaExclamationCircleSolid />
            <AlertTitle>خطأ: {submitError}</AlertTitle>
          </Alert>
        </div>
      )}

      <div className="flex flex-col gap-[26px]">
        <Order
          platform={formValues.orderSource.platform}
          pageName={formValues.orderSource.pageName}
          onPlatformChange={(v) => {
            setValue('orderSource.platform', v);
            clearErrors('orderSource.platform');
          }}
          onPageNameChange={(v) => {
            setValue('orderSource.pageName', v);
            clearErrors('orderSource.pageName');
          }}
          errors={{
            platform: errors.orderSource?.platform?.message,
            pageName: errors.orderSource?.pageName?.message,
          }}
        />
        <OrderDetails errors={{ products: productsError || undefined }} />
        {selectedProducts.length > 0 && <Products />}

        <ClientInformation
          customerName={formValues.customer.customerName}
          phoneNumber={formValues.customer.phoneNumber}
          governorate={formValues.customer.governorate}
          area={formValues.customer.area}
          address={formValues.customer.address}
          notes={formValues.customer.notes}
          onCustomerNameChange={(v) => {
            setValue('customer.customerName', v);
            clearErrors('customer.customerName');
          }}
          onPhoneNumberChange={(v) => {
            setValue('customer.phoneNumber', v);
            clearErrors('customer.phoneNumber');
          }}
          onGovernorateChange={(v) => {
            setValue('customer.governorate', v);
            clearErrors('customer.governorate');
          }}
          onAreaChange={(v) => {
            setValue('customer.area', v);
            clearErrors('customer.area');
          }}
          onAddressChange={(v) => {
            setValue('customer.address', v);
            clearErrors('customer.address');
          }}
          onNotesChange={(v) => {
            setValue('customer.notes', v);
            clearErrors('customer.notes');
          }}
          errors={{
            customerName: errors.customer?.customerName?.message,
            phoneNumber: errors.customer?.phoneNumber?.message,
            governorate: errors.customer?.governorate?.message,
            area: errors.customer?.area?.message,
            address: errors.customer?.address?.message,
            notes: errors.customer?.notes?.message,
          }}
        />
        <ShippingAndPayment
          shipping={formValues.shippingPayment.shipping}
          shippingCost={formValues.shippingPayment.shippingCost}
          includeShipping={formValues.shippingPayment.includeShipping}
          paymentMethod={formValues.shippingPayment.paymentMethod}
          needsConfirmation={formValues.shippingPayment.needsConfirmation}
          onShippingChange={(v) => {
            setValue('shippingPayment.shipping', v);
            clearErrors('shippingPayment.shippingCost');
          }}
          onShippingCostChange={(v) => {
            setValue('shippingPayment.shippingCost', v);
            clearErrors('shippingPayment.shippingCost');
          }}
          onIncludeShippingChange={(v) => {
            setValue('shippingPayment.includeShipping', v);
            clearErrors('shippingPayment.paymentMethod');
          }}
          onPaymentMethodChange={(v) => {
            setValue('shippingPayment.paymentMethod', v);
            clearErrors('shippingPayment.paymentMethod');
          }}
          onNeedsConfirmationChange={(v) => {
            setValue('shippingPayment.needsConfirmation', v);
          }}
          errors={{
            shippingCost: errors.shippingPayment?.shippingCost?.message,
            paymentMethod: errors.shippingPayment?.paymentMethod?.message,
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
                <LiaPlusSolid className="w-6 h-6" />
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
