'use client';

import { useMemo } from 'react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import Input from '@/components/ui/Input';
import usePaymentMethods from '@/hooks/usePaymentMethods';
import { ORDER_PAYMENT_STATUS_LABELS } from '@/constants/missingOrders';
import type { OrderPaymentStatus } from '@/types/missing-orders';

const PAYMENT_STATUS_OPTIONS: OrderPaymentStatus[] = [
  'PAID',
  'CASH_ON_DELIVERY',
  'PARTIALLY_PAID',
];

interface RecoverPaymentSectionProps {
  paymentMethod: string;
  onPaymentMethodChange: (v: string) => void;
  paymentStatus: OrderPaymentStatus;
  onPaymentStatusChange: (v: OrderPaymentStatus) => void;
  prepaidAmount: string;
  onPrepaidAmountChange: (v: string) => void;
  errors?: {
    paymentMethod?: string;
    paymentStatus?: string;
    prepaidAmount?: string;
  };
}

function RecoverPaymentSection({
  paymentMethod,
  onPaymentMethodChange,
  paymentStatus,
  onPaymentStatusChange,
  prepaidAmount,
  onPrepaidAmountChange,
  errors,
}: RecoverPaymentSectionProps) {
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
    [paymentMethods],
  );

  const displayPaymentMethod = paymentMethod ? paymentMethodMap[paymentMethod] || '' : '';

  const isCashOnDelivery = paymentStatus === 'CASH_ON_DELIVERY';

  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">الدفع</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div data-field-error="paymentMethod">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                طريقة الدفع <span className="text-red-500">*</span>
              </label>
            </div>
            <SearchableSelect
              value={displayPaymentMethod}
              onValueChange={(label) => {
                const key = paymentMethodReverseMap[label] || '';
                onPaymentMethodChange(key);
              }}
              options={paymentMethodOptions}
              placeholder="اختر طريقة الدفع"
              triggerClassName={`w-full rounded-lg h-12 ${errors?.paymentMethod ? 'border-red-500' : 'border-[#CED4DA]'}`}
              loading={isLoading}
              searchThreshold={5}
            />
            {errors?.paymentMethod && (
              <p className="text-red-500 text-sm mt-2">{errors.paymentMethod}</p>
            )}
          </div>

          <div data-field-error="paymentStatus">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                حالة الدفع <span className="text-red-500">*</span>
              </label>
            </div>
            <SearchableSelect
              value={ORDER_PAYMENT_STATUS_LABELS[paymentStatus]}
              onValueChange={(label) => {
                const match = PAYMENT_STATUS_OPTIONS.find(
                  (status) => ORDER_PAYMENT_STATUS_LABELS[status] === label,
                );
                if (match) onPaymentStatusChange(match);
              }}
              options={PAYMENT_STATUS_OPTIONS.map((s) => ORDER_PAYMENT_STATUS_LABELS[s])}
              placeholder="اختر حالة الدفع"
              triggerClassName={`w-full rounded-lg h-12 ${errors?.paymentStatus ? 'border-red-500' : 'border-[#CED4DA]'}`}
              searchThreshold={5}
            />
            {errors?.paymentStatus && (
              <p className="text-red-500 text-sm mt-2">{errors.paymentStatus}</p>
            )}
          </div>

          <div data-field-error="prepaidAmount">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                المبلغ المدفوع مسبقاً {!isCashOnDelivery && <span className="text-red-500">*</span>}
              </label>
            </div>
            <Input
              name="prepaidAmount"
              type="number"
              placeholder="0.00"
              className="w-full"
              inputClassName="bg-white"
              value={prepaidAmount}
              disabled={isCashOnDelivery}
              onChange={(e) => onPrepaidAmountChange(e.target.value)}
              error={errors?.prepaidAmount}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">القيم مأخوذة من المتجر ويمكن تعديلها</p>
      </div>
    </div>
  );
}

export default RecoverPaymentSection;
