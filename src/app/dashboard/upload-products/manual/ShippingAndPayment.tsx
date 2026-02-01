'use client';

import React, { useMemo } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { USER_MENU_OPTIONS } from '@/constants/dashboard-layout';
import Input from '@/components/ui/Input';
import ToggleField from './components/ToggleField';
import { ShippingAndPaymentProps } from './types';
import useShippingCompanies from '@/hooks/useShippingCompanies';

function ShippingAndPayment({
  shipping,
  shippingCompany,
  shippingCost,
  includeShipping,
  paymentMethod,
  needsConfirmation,
  onShippingChange,
  onShippingCompanyChange,
  onShippingCostChange,
  onIncludeShippingChange,
  onPaymentMethodChange,
  onNeedsConfirmationChange,
  errors,
}: ShippingAndPaymentProps) {
  const { shippingCompanies, isLoading: loadingShippingCompanies } =
    useShippingCompanies(shipping);

  const shippingCompanyOptions = useMemo(() => {
    return shippingCompanies.map((company) => ({
      key: company.key,
      label: company.label,
    }));
  }, [shippingCompanies]);
  return (
    <div className="relative bg-gray-50 flex items-center justify-center px-6 py-8 max-sm:px-0">
      <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm max-sm:p-5 p-8">
        <div className="space-y-12">
          <div className="border-b border-gray-100 pb-8">
            <ToggleField
              label="الشحن"
              description="يمكنك تفعيل الشحن لهذا الطلب"
              checked={shipping}
              onCheckedChange={onShippingChange}
            />

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                shipping ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="mb-4">
                <p className="text-gray-500 max-sm:text-[14px] text-[17px] mb-1">
                  اختر شركة الشحن
                </p>
                <SearchableSelect
                  value={shippingCompany}
                  onChange={onShippingCompanyChange}
                  options={shippingCompanyOptions}
                  placeholder="اختر شركة الشحن"
                  widthClass="max-w-[502px]"
                  triggerClassName="border-2 border-primary w-full bg-[#EAEAEA40] p-2 rounded-sm focus:!border-primary focus:ring-[1px] focus:!ring-primary/50"
                  loading={loadingShippingCompanies}
                />
              </div>
              <p className="text-gray-500 max-sm:text-[14px] text-[17px] mb-1">
                أضف تكلفة الشحن إلى هذا الطلب
              </p>
              <Input
                name="shipping"
                type="number"
                placeholder="..10000"
                className="max-w-[502px] bg-[#EAEAEA40] mt-3"
                value={shippingCost}
                onChange={(e) => onShippingCostChange(e.target.value)}
              />
              {errors?.shippingCost && (
                <p className="text-red-600 text-sm mt-2">{errors.shippingCost}</p>
              )}
            </div>
          </div>

          <div className="border-b border-gray-100 pb-8">
            <ToggleField
              label="طريقة الدفع"
              description="اختر طريقة الدفع المناسبة للطلب"
              checked={includeShipping}
              onCheckedChange={onIncludeShippingChange}
            />

            <div
              className={`transition-all duration-300 ease-in-out ${
                includeShipping ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
              }`}
            >
              <SearchableSelect
                value={paymentMethod}
                onChange={onPaymentMethodChange}
                options={USER_MENU_OPTIONS}
                placeholder="اختر طريقة الدفع"
                widthClass="max-w-[921px]"
                triggerClassName="border-2 border-primary w-full bg-[#EAEAEA40] p-2 rounded-sm focus:!border-primary focus:ring-[1px] focus:!ring-primary/50"
              />
              {errors?.paymentMethod && (
                <p className="text-red-600 text-sm mt-2">{errors.paymentMethod}</p>
              )}
            </div>
          </div>

          <div>
            <ToggleField
              label="يحتاج إلى تأكيد"
              description="تتطلب هذه الطلبية تأكيدًا قبل المعالجة"
              checked={needsConfirmation}
              onCheckedChange={onNeedsConfirmationChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingAndPayment;
