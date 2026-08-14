'use client';

import { memo, useMemo } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { clientStatusOptions, activityTypeOptions, customerOptions } from '../constants';
import { useOrderStatusesQuery } from '@/services/orders';

interface CustomerFilters {
  clientStatus: string;
  orderStatus: string;
  activityType: string;
  allCustomers: string;
}

interface CustomersFilterBarProps {
  filters: CustomerFilters;
  onFilterChange: (key: keyof CustomerFilters, value: string) => void;
  onClearFilter: (key: keyof CustomerFilters) => void;
}

const CustomersFilterBar = memo(
  ({ filters, onFilterChange, onClearFilter }: CustomersFilterBarProps) => {
    const { data: statusesData } = useOrderStatusesQuery();

    const orderStatusOptions = useMemo(() => {
      const baseOption = { key: 'all', value: 'جميع الحالات' };
      if (!statusesData) return [baseOption];
      // Filter options stay permission-scoped — not the full label dictionary.
      const dynamicOptions = statusesData.statuses.map((status) => ({
        key: status.key,
        value: status.label,
      }));
      return [baseOption, ...dynamicOptions];
    }, [statusesData]);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SearchableSelect
          options={clientStatusOptions}
          value={filters.clientStatus}
          onChange={(v) => onFilterChange('clientStatus', v)}
          placeholder="حالة العميل"
          clearable
          onClear={() => onClearFilter('clientStatus')}
        />

        <SearchableSelect
          options={orderStatusOptions}
          value={filters.orderStatus}
          onChange={(v) => onFilterChange('orderStatus', v)}
          placeholder="حالة الطلب"
          clearable
          onClear={() => onClearFilter('orderStatus')}
        />

        <SearchableSelect
          options={activityTypeOptions}
          value={filters.activityType}
          onChange={(v) => onFilterChange('activityType', v)}
          placeholder="نوع الشارة"
          clearable
          onClear={() => onClearFilter('activityType')}
        />

        <SearchableSelect
          options={customerOptions}
          value={filters.allCustomers}
          onChange={(v) => onFilterChange('allCustomers', v)}
          placeholder="جميع العملاء"
          clearable
          onClear={() => onClearFilter('allCustomers')}
        />
      </div>
    );
  },
);

CustomersFilterBar.displayName = 'CustomersFilterBar';

export default CustomersFilterBar;
