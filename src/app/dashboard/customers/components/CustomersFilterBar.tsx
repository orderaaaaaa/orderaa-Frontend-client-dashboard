'use client';

import { memo, useMemo } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  clientStatusOptions,
  buildBadgeFilterOptions,
  segmentOptions,
} from '../constants';
import { useOrderStatusesQuery } from '@/services/orders';
import type { CustomerBadge } from '../types/customer';

export interface CustomerFilters {
  clientStatus: string;
  orderStatus: string;
  badge: string;
  segment: string;
}

interface CustomersFilterBarProps {
  filters: CustomerFilters;
  enabledBadges: readonly CustomerBadge[];
  onFilterChange: (key: keyof CustomerFilters, value: string) => void;
  onClearFilter: (key: keyof CustomerFilters) => void;
}

const CustomersFilterBar = memo(
  ({ filters, enabledBadges, onFilterChange, onClearFilter }: CustomersFilterBarProps) => {
    const { data: statusesData } = useOrderStatusesQuery();
    const badgeOptions = useMemo(
      () => buildBadgeFilterOptions(enabledBadges),
      [enabledBadges]
    );

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
          options={badgeOptions}
          value={filters.badge}
          onChange={(v) => onFilterChange('badge', v)}
          placeholder="نوع الشارة"
          clearable
          onClear={() => onClearFilter('badge')}
        />

        <SearchableSelect
          options={segmentOptions}
          value={filters.segment}
          onChange={(v) => onFilterChange('segment', v)}
          placeholder="جميع العملاء"
          clearable
          onClear={() => onClearFilter('segment')}
        />
      </div>
    );
  },
);

CustomersFilterBar.displayName = 'CustomersFilterBar';

export default CustomersFilterBar;
