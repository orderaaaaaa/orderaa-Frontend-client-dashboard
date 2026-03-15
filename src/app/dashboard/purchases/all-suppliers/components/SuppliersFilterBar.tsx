'use client';

import { memo } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { SupplierFilters } from '../types';
import {
  REMAINING_AMOUNT_OPTIONS,
  PAID_AMOUNT_OPTIONS,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

        <SearchableSelect
          options={PAID_AMOUNT_OPTIONS}
          value={filters.paidAmount}
          onChange={(v) => onFilterChange('paidAmount', v)}
          placeholder="المدفوع"
          clearable
          onClear={() => onClearFilter('paidAmount')}
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
