'use client';

import { memo } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Input from '@/components/ui/Input';
import { SupplierFilters } from '../types';
import {
  REMAINING_AMOUNT_OPTIONS,
  INVOICES_COUNT_OPTIONS,
} from '../constants';

interface SuppliersFilterBarProps {
  filters: SupplierFilters;
  onFilterChange: <K extends keyof SupplierFilters>(
    key: K,
    value: SupplierFilters[K],
  ) => void;
  onClearFilter: (key: keyof SupplierFilters) => void;
  supplierOptions: { key: string; value: string }[];
}

const SuppliersFilterBar = memo(
  ({ filters, onFilterChange, onClearFilter, supplierOptions }: SuppliersFilterBarProps) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <SearchableSelect
          options={supplierOptions}
          value={filters.supplierName}
          onChange={(v) => onFilterChange('supplierName', v)}
          placeholder="المورد"
          clearable
          onClear={() => onClearFilter('supplierName')}
        />

        <SearchableSelect
          options={REMAINING_AMOUNT_OPTIONS}
          value={filters.remainingAmount}
          onChange={(v) => onFilterChange('remainingAmount', v)}
          placeholder="المتبقي للمورد"
          clearable
          onClear={() => onClearFilter('remainingAmount')}
        />

        <Input
          inputClassName="bg-white py-1.5 md:py-2 text-sm md:text-base rounded border-gray-300"
          type="number"
          placeholder="المدفوع من"
          value={filters.paidAmountFrom}
          onChange={(e) => onFilterChange('paidAmountFrom', e.target.value)}
          clearable
          onClear={() => onClearFilter('paidAmountFrom')}
        />

        <Input
          inputClassName="bg-white py-1.5 md:py-2 text-sm md:text-base rounded border-gray-300"
          type="number"
          placeholder="المدفوع الى"
          value={filters.paidAmountTo}
          onChange={(e) => onFilterChange('paidAmountTo', e.target.value)}
          clearable
          onClear={() => onClearFilter('paidAmountTo')}
        />

        <SearchableSelect
          options={INVOICES_COUNT_OPTIONS}
          value={filters.invoicesCount}
          onChange={(v) => onFilterChange('invoicesCount', v)}
          placeholder="عدد الفواتير"
          clearable
          onClear={() => onClearFilter('invoicesCount')}
        />
      </div>
    );
  },
);

SuppliersFilterBar.displayName = 'SuppliersFilterBar';

export default SuppliersFilterBar;
