'use client';

import { memo } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Input from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/datepicker';
import { ReceiptFilters } from '../types';
import {
  MOCK_SUPPLIER_OPTIONS,
  MOCK_EMPLOYEE_OPTIONS,
} from '../constants';

interface ReceiptsFilterBarProps {
  filters: ReceiptFilters;
  onFilterChange: <K extends keyof ReceiptFilters>(
    key: K,
    value: ReceiptFilters[K],
  ) => void;
  onClearFilter: (key: keyof ReceiptFilters) => void;
  onFromDateChange: (date: Date | null) => void;
}

const ReceiptsFilterBar = memo(
  ({
    filters,
    onFilterChange,
    onClearFilter,
    onFromDateChange,
  }: ReceiptsFilterBarProps) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <DatePicker
            selected={filters.fromDate}
            onChange={onFromDateChange}
            placeholder="تاريخ الانشاء"
            isClearable
          />
        </div>

        <div className="flex flex-col gap-1">
          <Input
            inputClassName="bg-white py-1.5 md:py-2 text-sm md:text-base rounded border-gray-300"
            type="number"
            placeholder="عدد القطع"
            value={filters.itemsCount}
            onChange={(e) => onFilterChange('itemsCount', e.target.value)}
            clearable
            onClear={() => onClearFilter('itemsCount')}
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
      </div>
    );
  },
);

ReceiptsFilterBar.displayName = 'ReceiptsFilterBar';

export default ReceiptsFilterBar;
