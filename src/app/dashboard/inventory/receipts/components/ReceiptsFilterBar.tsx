'use client';

import { memo } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Input from '@/components/ui/Input';
import { ReceiptFilters } from '../types';
import { INVOICE_TYPE_OPTIONS } from '../constants';

interface ReceiptsFilterBarProps {
  filters: ReceiptFilters;
  onFilterChange: <K extends keyof ReceiptFilters>(
    key: K,
    value: ReceiptFilters[K],
  ) => void;
  onClearFilter: (key: keyof ReceiptFilters) => void;
  supplierOptions: { key: string; value: string }[];
  employeeOptions: { key: string; value: string }[];
}

const ReceiptsFilterBar = memo(
  ({
    filters,
    onFilterChange,
    onClearFilter,
    supplierOptions,
    employeeOptions,
  }: ReceiptsFilterBarProps) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1">
          <SearchableSelect
            options={supplierOptions}
            value={filters.supplierName}
            onChange={(v) => onFilterChange('supplierName', v)}
            placeholder="اسم المورد"
            clearable
            onClear={() => onClearFilter('supplierName')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <SearchableSelect
            options={INVOICE_TYPE_OPTIONS}
            value={filters.transactionType}
            onChange={(v) => onFilterChange('transactionType', v)}
            placeholder="نوع الفاتورة"
            clearable
            onClear={() => onClearFilter('transactionType')}
          />
        </div>

        <div className="flex flex-row gap-2">
          <Input
            inputClassName="bg-white py-1.5 md:py-2 text-sm md:text-base rounded border-gray-300"
            type="number"
            placeholder="المبلغ من"
            value={filters.totalAmountFrom}
            onChange={(e) => onFilterChange('totalAmountFrom', e.target.value)}
            clearable
            onClear={() => onClearFilter('totalAmountFrom')}
          />
          <Input
            inputClassName="bg-white py-1.5 md:py-2 text-sm md:text-base rounded border-gray-300"
            type="number"
            placeholder="المبلغ الى"
            value={filters.totalAmountTo}
            onChange={(e) => onFilterChange('totalAmountTo', e.target.value)}
            clearable
            onClear={() => onClearFilter('totalAmountTo')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <SearchableSelect
            options={employeeOptions}
            value={filters.employeeName}
            onChange={(v) => onFilterChange('employeeName', v)}
            placeholder="اسم الموظف"
            clearable
            onClear={() => onClearFilter('employeeName')}
          />
        </div>
      </div>
    );
  },
);

ReceiptsFilterBar.displayName = 'ReceiptsFilterBar';

export default ReceiptsFilterBar;
