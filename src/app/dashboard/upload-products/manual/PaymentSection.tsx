'use client';

import React, { useMemo } from 'react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import usePaymentMethods from '@/hooks/usePaymentMethods';
import { PaymentSectionProps } from './types';

function PaymentSection({
  paymentMethod,
  onPaymentMethodChange,
  errors,
}: PaymentSectionProps) {
  const { paymentMethods, isLoading } = usePaymentMethods(true);

  const paymentMethodMap = useMemo(() => {
    const map: Record<string, string> = {};
    paymentMethods.forEach((method) => {
      map[method.key] = method.label;
    });
    return map;
  }, [paymentMethods]);

  const paymentMethodReverseMap = useMemo(() => {
    const map: Record<string, string> = {};
    paymentMethods.forEach((method) => {
      map[method.label] = method.key;
    });
    return map;
  }, [paymentMethods]);

  const paymentMethodOptions = useMemo(
    () => paymentMethods.map((m) => m.label),
    [paymentMethods]
  );

  const handleChange = (label: string) => {
    const key = paymentMethodReverseMap[label] || '';
    onPaymentMethodChange(key);
  };

  const displayValue = paymentMethod ? paymentMethodMap[paymentMethod] || '' : '';

  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">طريقة الدفع</h1>
        <div className="max-w-[502px]" data-field-error="paymentMethod">
          <div className="mb-1">
            <label className="block font-medium text-[16px]">
              اختر طريقة الدفع <span className="text-red-500">*</span>
            </label>
          </div>
          <SearchableSelect
            value={displayValue}
            onValueChange={handleChange}
            options={paymentMethodOptions}
            placeholder="اختر طريقة الدفع"
            searchPlaceholder="بحث..."
            emptyMessage="لا توجد طرق دفع متاحة"
            noResultsMessage="لا توجد نتائج للبحث"
            triggerClassName={`w-full rounded-lg h-12 ${errors?.paymentMethod ? 'border-red-500' : 'border-[#CED4DA]'}`}
            loading={isLoading}
            searchThreshold={5}
          />
          {errors?.paymentMethod && (
            <p className="text-red-500 text-sm mt-2">{errors.paymentMethod}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentSection;
