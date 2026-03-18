'use client';

import { memo } from 'react';
import { LiaTagSolid, LiaUserTieSolid, LiaMoneyBillWaveSolid } from 'react-icons/lia';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Input from '@/components/ui/Input';

export type PaymentStatus = 'unpaid' | 'partial' | 'full';

const PAYMENT_STATUS_OPTIONS = [
  { key: 'unpaid', value: 'غير مدفوع' },
  { key: 'partial', value: 'مدفوع جزئي' },
  { key: 'full', value: 'مدفوع كلي' },
];

interface InvoiceDropdownsProps {
  supplierId: number | undefined;
  onSupplierChange: (value: number) => void;
  supplierOptions: { key: string; value: string }[];
  employeeId: number | undefined;
  onEmployeeChange: (value: number) => void;
  employeeOptions: { key: string; value: string }[];
  paymentStatus: PaymentStatus;
  onPaymentStatusChange: (status: PaymentStatus) => void;
  partialAmount: string;
  onPartialAmountChange: (value: string) => void;
  errors?: { supplierId?: string };
}

const InvoiceDropdowns = memo(
  ({
    supplierId,
    onSupplierChange,
    supplierOptions,
    employeeId,
    onEmployeeChange,
    employeeOptions,
    paymentStatus,
    onPaymentStatusChange,
    partialAmount,
    onPartialAmountChange,
    errors,
  }: InvoiceDropdownsProps) => {
    return (
      <div className="sm:px-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-base font-normal">
            <LiaTagSolid className="w-6 h-6 text-primary" />
            <span>المورد</span>
          </label>
          <SearchableSelect
            value={supplierId !== undefined ? String(supplierId) : ''}
            onChange={(val) => onSupplierChange(Number(val))}
            options={supplierOptions}
            placeholder="اختر المورد"
            error={errors?.supplierId}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-base font-normal">
            <LiaUserTieSolid className="w-6 h-6 text-primary" />
            <span>الموظف</span>
          </label>
          <SearchableSelect
            value={employeeId !== undefined ? String(employeeId) : ''}
            onChange={(val) => onEmployeeChange(Number(val))}
            options={employeeOptions}
            placeholder="اختر الموظف"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-base font-normal">
            <LiaMoneyBillWaveSolid className="w-6 h-6 text-primary" />
            <span>حالة الدفع</span>
          </label>
          <SearchableSelect
            value={paymentStatus}
            onChange={(val) => onPaymentStatusChange(val as PaymentStatus)}
            options={PAYMENT_STATUS_OPTIONS}
            placeholder="اختر حالة الدفع"
          />
        </div>
        {paymentStatus === 'partial' && (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-base font-normal">
              <LiaMoneyBillWaveSolid className="w-6 h-6 text-primary" />
              <span>المبلغ المدفوع</span>
            </label>
            <Input
              type="number"
              value={partialAmount}
              onChange={(e) => onPartialAmountChange(e.target.value)}
              placeholder="ادخل المبلغ المدفوع"
            />
          </div>
        )}
      </div>
    );
  },
);

InvoiceDropdowns.displayName = 'InvoiceDropdowns';

export default InvoiceDropdowns;
