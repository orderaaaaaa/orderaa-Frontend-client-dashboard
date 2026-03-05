'use client';

import { memo } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Input from '@/components/ui/Input';
import { InvoiceFilters } from '../types';
import {
  MOCK_SUPPLIER_OPTIONS,
  MOCK_INVOICE_TYPE_OPTIONS,
  MOCK_EMPLOYEE_OPTIONS,
  MOCK_ACCEPTANCE_STATUS_OPTIONS,
} from '../constants';

interface InvoicesFilterBarProps {
  filters: InvoiceFilters;
  onFilterChange: <K extends keyof InvoiceFilters>(
    key: K,
    value: InvoiceFilters[K],
  ) => void;
  onClearFilter: (key: keyof InvoiceFilters) => void;
}

const InvoicesFilterBar = memo(
  ({ filters, onFilterChange, onClearFilter }: InvoicesFilterBarProps) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="flex flex-col gap-1">
          <SearchableSelect
            options={MOCK_SUPPLIER_OPTIONS}
            value={filters.supplierName}
            onChange={(v) => onFilterChange('supplierName', v)}
            placeholder="اسم المورد"
            clearable
            onClear={() => onClearFilter('supplierName')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <SearchableSelect
            options={MOCK_INVOICE_TYPE_OPTIONS}
            value={filters.transactionType}
            onChange={(v) => onFilterChange('transactionType', v)}
            placeholder="نوع الفاتورة"
            clearable
            onClear={() => onClearFilter('transactionType')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            inputClassName="bg-white py-1.5 md:py-2 text-sm md:text-base rounded border-gray-300"
            type="number"
            placeholder="مبلغ الفاتورة"
            value={filters.totalAmount}
            onChange={(e) => onFilterChange('totalAmount', e.target.value)}
            clearable
            onClear={() => onClearFilter('totalAmount')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <SearchableSelect
            options={MOCK_EMPLOYEE_OPTIONS}
            value={filters.employeeName}
            onChange={(v) => onFilterChange('employeeName', v)}
            placeholder="اسم الموظف"
            clearable
            onClear={() => onClearFilter('employeeName')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <SearchableSelect
            options={MOCK_ACCEPTANCE_STATUS_OPTIONS}
            value={filters.acceptanceStatus}
            onChange={(v) => onFilterChange('acceptanceStatus', v)}
            placeholder="حالة القبول"
            clearable
            onClear={() => onClearFilter('acceptanceStatus')}
          />
        </div>
      </div>
    );
  },
);

InvoicesFilterBar.displayName = 'InvoicesFilterBar';

export default InvoicesFilterBar;
