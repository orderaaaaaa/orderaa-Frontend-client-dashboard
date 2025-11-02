'use client';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import ClientInformation from './ClientInformation';
import Order from './Order';
import OrderDetails from './OrderDetails';
import ShippingAndPayment from './ShippingAndPayment';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import Products from './Products';
import { buildManualOrderPayload } from '@/utils/manualOrder/payload';
import {
  validateManualOrder,
  ManualFormErrors as ManualFormErrorsType,
} from '@/utils/manualOrder/validation';
import { createManualOrder } from '@/lib/api/manualOrdersApi';

type ManualFormErrors = ManualFormErrorsType;

function Manual() {
  const selectedProducts = useProductDropdownStore(
    (state) => state.selectedProducts
  );

  // Order source
  const [orderSource, setOrderSource] = useState<{
    platform: string;
    pageName: string;
  }>({
    platform: '',
    pageName: '',
  });

  // Client information
  const [customer, setCustomer] = useState<{
    customerName: string;
    phoneNumber: string;
    governorate: string;
    area: string;
    address: string;
    notes: string;
  }>({
    customerName: '',
    phoneNumber: '',
    governorate: '',
    area: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<ManualFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Clear error for a specific field when user starts typing
  const clearFieldError = (field: keyof ManualFormErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors and success message
    setSubmitError(null);
    setSubmitSuccess(false);

    const productsMapped = selectedProducts.map((p) => ({
      productId: p.id,
      variantId: p.variant?.id,
      quantity: 1,
      price: Number(p.price) || 0,
    }));

    const nextErrors = validateManualOrder(
      {
        platform: orderSource.platform,
        pageName: orderSource.pageName,
        customerName: customer.customerName,
        phoneNumber: customer.phoneNumber,
        governorate: customer.governorate,
        area: customer.area,
        address: customer.address,
        notes: customer.notes,
      },
      productsMapped
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // Scroll to first error
      const firstErrorField = Object.keys(nextErrors)[0];
      const errorElement = document.querySelector(
        `[data-field-error="${firstErrorField}"]`
      );
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildManualOrderPayload({
        platform: orderSource.platform,
        pageName: orderSource.pageName,
        customerName: customer.customerName,
        phoneNumber: customer.phoneNumber,
        governorate: customer.governorate,
        area: customer.area,
        address: customer.address,
        notes: customer.notes,
        selectedProducts,
      });

      await createManualOrder(payload);
      
      // Success - reset form and show success message
      setSubmitSuccess(true);
      setOrderSource({ platform: '', pageName: '' });
      setCustomer({
        customerName: '',
        phoneNumber: '',
        governorate: '',
        area: '',
        address: '',
        notes: '',
      });
      useProductDropdownStore.getState().setSelectedProducts([]);
      setErrors({});
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error creating manual order:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Success Message */}
      {submitSuccess && (
        <div className="mx-6 mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg" dir="rtl">
          <p className="font-semibold">✓ تم إنشاء الطلب بنجاح!</p>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="mx-6 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" dir="rtl">
          <p className="font-semibold">✗ خطأ: {submitError}</p>
        </div>
      )}

      <div className="flex flex-col gap-[26px]">
        <Order
          platform={orderSource.platform}
          pageName={orderSource.pageName}
          onPlatformChange={(v) => {
            clearFieldError('platform');
            setOrderSource((prev) => ({ ...prev, platform: v }));
          }}
          onPageNameChange={(v) => {
            clearFieldError('pageName');
            setOrderSource((prev) => ({ ...prev, pageName: v }));
          }}
          errors={{ platform: errors.platform, pageName: errors.pageName }}
        />
        <OrderDetails />
        {errors.products && (
          <div className="px-6" dir="rtl" data-field-error="products">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{errors.products}</p>
            </div>
          </div>
        )}
        {selectedProducts.length > 0 && <Products />}

        <ClientInformation
          customerName={customer.customerName}
          phoneNumber={customer.phoneNumber}
          governorate={customer.governorate}
          area={customer.area}
          address={customer.address}
          notes={customer.notes}
          onCustomerNameChange={(v) => {
            clearFieldError('customerName');
            setCustomer((prev) => ({ ...prev, customerName: v }));
          }}
          onPhoneNumberChange={(v) => {
            clearFieldError('phoneNumber');
            setCustomer((prev) => ({ ...prev, phoneNumber: v }));
          }}
          onGovernorateChange={(v) => {
            clearFieldError('governorate');
            setCustomer((prev) => ({ ...prev, governorate: v }));
          }}
          onAreaChange={(v) => {
            clearFieldError('area');
            setCustomer((prev) => ({ ...prev, area: v }));
          }}
          onAddressChange={(v) => {
            clearFieldError('address');
            setCustomer((prev) => ({ ...prev, address: v }));
          }}
          onNotesChange={(v) => {
            clearFieldError('notes');
            setCustomer((prev) => ({ ...prev, notes: v }));
          }}
          errors={{
            customerName: errors.customerName,
            phoneNumber: errors.phoneNumber,
            governorate: errors.governorate,
            area: errors.area,
            address: errors.address,
            notes: errors.notes,
          }}
        />
        <ShippingAndPayment />
        <div className="flex justify-end ml-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex py-2 gap-2 text-md items-center text-white w-40 px-5 rounded-full font-bold transition-opacity ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                : 'bg-[#5D24E1] cursor-pointer hover:bg-[#4a1fa8]'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⟳</span>
                جاري الإرسال...
              </>
            ) : (
              <>
                <Plus className="font-bold w-6 h-6" />
                إضافة طلب
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default Manual;
