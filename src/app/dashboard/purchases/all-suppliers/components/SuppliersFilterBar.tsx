'use client';

import { memo } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { SupplierFilters } from '../types';
import {
  MOCK_SUPPLIER_NAME_OPTIONS,
  MOCK_PURCHASES_OPTIONS,
  MOCK_REMAINING_OPTIONS,
  MOCK_PAID_OPTIONS,
  MOCK_INVOICES_COUNT_OPTIONS,
} from '../constants';

interface SuppliersFilterBarProps {
  filters: SupplierFilters;
  onFilterChange: <K extends keyof SupplierFilters>(
    key: K,
    value: SupplierFilters[K],
  ) => void;
  onClearFilter: (key: keyof SupplierFilters) => void;
}

const SuppliersFilterBar = memo(
  ({ filters, onFilterChange, onClearFilter }: SuppliersFilterBarProps) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <SearchableSelect
          options={MOCK_SUPPLIER_NAME_OPTIONS}
          value={filters.supplierName}
          onChange={(v) => onFilterChange('supplierName', v)}
          placeholder="المورد"
          clearable
          onClear={() => onClearFilter('supplierName')}
        />

        <SearchableSelect
          options={MOCK_PURCHASES_OPTIONS}
          value={filters.purchases}
          onChange={(v) => onFilterChange('purchases', v)}
          placeholder="المشتريات"
          clearable
          onClear={() => onClearFilter('purchases')}
        />

        <SearchableSelect
          options={MOCK_REMAINING_OPTIONS}
          value={filters.remainingAmount}
          onChange={(v) => onFilterChange('remainingAmount', v)}
          placeholder="المتبقي للمورد"
          clearable
          onClear={() => onClearFilter('remainingAmount')}
        />

        <SearchableSelect
          options={MOCK_PAID_OPTIONS}
          value={filters.paidAmount}
          onChange={(v) => onFilterChange('paidAmount', v)}
          placeholder="المدفوع"
          clearable
          onClear={() => onClearFilter('paidAmount')}
        />

        <SearchableSelect
          options={MOCK_INVOICES_COUNT_OPTIONS}
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
