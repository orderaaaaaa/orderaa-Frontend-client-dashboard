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
import { locationSaveErrorTextOf } from '@/types/locationOptions';
import { manualOrderSchema, ManualOrderFormData } from './schema';
import { useMerchantSettings } from '@/app/dashboard/store-settings/hooks/useStoreSettings';
import { StickyFormFooter } from '@/components/ui/sticky-form-footer';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

const DIRTY = { shouldDirty: true } as const;

function Manual() {
  const selectedProducts = useProductDropdownStore(
    (state) => state.selectedProducts
  );

  const {
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    reset,
    resetField,
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
        shippingCompanyId: '',
        governorateOption: '',
        cityOption: '',
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
      resetField('shipping.returnShippingCost', {
        defaultValue: String(settings.defaultReturnShippingCost),
      });
    }
  }, [settings?.defaultReturnShippingCost, resetField]);

  useEffect(() => {
    useProductDropdownStore.getState().setSelectedProducts([]);
    return () => {
      useProductDropdownStore.getState().setSelectedProducts([]);
    };
  }, []);

  const [productsError, setProductsError] = useState<string | null>(null);

  const formValues = watch();
  const hasUnsavedChanges =
    !isSubmitting && (isDirty || selectedProducts.length > 0);
  const guard = useUnsavedChangesGuard(hasUnsavedChanges);

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
          shippingCompanyId: data.shipping.shippingCompanyId,
          governorateOption: data.shipping.governorateOption,
          cityOption: data.shipping.cityOption,
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
    } catch (err: unknown) {
      toast.error(
        locationSaveErrorTextOf(err, 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.')
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
      if (errors.shipping?.shippingCompanyId) return 'shippingCompanyId';
      if (errors.shipping?.governorateOption) return 'governorate';
      if (errors.shipping?.cityOption) return 'city';
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
            setValue('orderSource.utmSource', v, DIRTY);
            clearErrors('orderSource.utmSource');
          }}
          onPageNameChange={(v) => {
            setValue('orderSource.pageName', v, DIRTY);
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
            setValue('total', v, DIRTY);
            clearErrors('total');
          }}
          onPackagingNotesChange={(v) => {
            setValue('packagingNotes', v, DIRTY);
          }}
          errors={{ products: productsError || undefined, total: errors.total?.message }}
        />

        <ClientInformation
          name={formValues.customer.name}
          phoneNumbers={formValues.customer.phoneNumbers}
          address={formValues.customer.address}
          notes={formValues.customer.notes || ''}
          onNameChange={(v) => {
            setValue('customer.name', v, DIRTY);
            clearErrors('customer.name');
          }}
          onPhoneNumbersChange={(v) => {
            setValue('customer.phoneNumbers', v, DIRTY);
            clearErrors('customer.phoneNumbers');
          }}
          onAddressChange={(v) => {
            setValue('customer.address', v, DIRTY);
            clearErrors('customer.address');
          }}
          onNotesChange={(v) => {
            setValue('customer.notes', v, DIRTY);
          }}
          errors={{
            name: errors.customer?.name?.message,
            phoneNumbers: errors.customer?.phoneNumbers?.message,
            address: errors.customer?.address?.message,
          }}
        />

        <ShippingSection
          shippingCompanyId={formValues.shipping.shippingCompanyId}
          governorateOption={formValues.shipping.governorateOption}
          cityOption={formValues.shipping.cityOption}
          shippingCost={formValues.shipping.shippingCost || ''}
          returnShippingCost={formValues.shipping.returnShippingCost || ''}
          shippingType={formValues.shipping.shippingType}
          returnShipmentContent={formValues.shipping.returnShipmentContent || ''}
          onShippingCompanyChange={(v) => {
            setValue('shipping.shippingCompanyId', v, DIRTY);
            clearErrors('shipping.shippingCompanyId');
          }}
          onGovernorateOptionChange={(v) => {
            setValue('shipping.governorateOption', v, DIRTY);
            clearErrors('shipping.governorateOption');
          }}
          onCityOptionChange={(v) => {
            setValue('shipping.cityOption', v, DIRTY);
            clearErrors('shipping.cityOption');
          }}
          onShippingCostChange={(v) => {
            setValue('shipping.shippingCost', v, DIRTY);
            clearErrors('shipping.shippingCost');
          }}
          onReturnShippingCostChange={(v) => {
            setValue('shipping.returnShippingCost', v, DIRTY);
            clearErrors('shipping.returnShippingCost');
          }}
          onShippingTypeChange={(v) => {
            setValue('shipping.shippingType', v, DIRTY);
            clearErrors('shipping.shippingType');
          }}
          onReturnShipmentContentChange={(v) => {
            setValue('shipping.returnShipmentContent', v, DIRTY);
            clearErrors('shipping.returnShipmentContent');
          }}
          errors={{
            shippingCompanyId: errors.shipping?.shippingCompanyId?.message,
            governorateOption: errors.shipping?.governorateOption?.message,
            cityOption: errors.shipping?.cityOption?.message,
            shippingCost: errors.shipping?.shippingCost?.message,
            returnShippingCost: errors.shipping?.returnShippingCost?.message,
            shippingType: errors.shipping?.shippingType?.message,
            returnShipmentContent: errors.shipping?.returnShipmentContent?.message,
          }}
        />

        <PaymentSection
          paymentMethod={formValues.payment.paymentMethod}
          onPaymentMethodChange={(v) => {
            setValue('payment.paymentMethod', v, DIRTY);
            clearErrors('payment.paymentMethod');
          }}
          errors={{
            paymentMethod: errors.payment?.paymentMethod?.message,
          }}
        />

        <ConfirmationSection
          needsConfirmation={formValues.needsConfirmation}
          onNeedsConfirmationChange={(v) => {
            setValue('needsConfirmation', v, DIRTY);
          }}
        />

        <StickyFormFooter
          isDirty={hasUnsavedChanges}
          isSaving={isSubmitting}
          status={
            isSubmitting
              ? 'جاري إنشاء الطلب...'
              : hasUnsavedChanges
                ? 'الطلب لم يُضف بعد'
                : 'املأ بيانات الطلب ثم اضغط إضافة طلب'
          }
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            loadingText="جاري الإرسال..."
            className="min-h-10 min-w-40 rounded-full font-bold"
          >
            <LiaPlusSolid className="w-5 h-5 text-white" />
            إضافة طلب
          </Button>
        </StickyFormFooter>
      </div>
      <UnsavedChangesDialog
        isOpen={guard.pendingHref !== null}
        onStay={guard.cancelLeave}
        onLeave={guard.confirmLeave}
        message="إذا غادرت الصفحة الآن ستفقد بيانات الطلب التي أدخلتها."
      />
    </form>
  );
}

export default Manual;
