'use client';

import { memo } from 'react';
import { LiaTagSolid } from 'react-icons/lia';
import SearchableSelect from '@/components/ui/SearchableSelect';

interface InvoiceDropdownsProps {
  supplierId: number | undefined;
  onSupplierChange: (value: number) => void;
  supplierOptions: { key: string; value: string }[];
  errors?: { supplierId?: string };
}

const InvoiceDropdowns = memo(
  ({
    supplierId,
    onSupplierChange,
    supplierOptions,
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
      </div>
    );
  },
);

InvoiceDropdowns.displayName = 'InvoiceDropdowns';

export default InvoiceDropdowns;
