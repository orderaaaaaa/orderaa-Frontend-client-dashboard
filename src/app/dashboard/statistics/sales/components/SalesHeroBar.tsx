'use client';

import DateRangeFilter from '@/components/ui/DateRangeFilter';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { Switch } from '@/components/ui/switch';
import type { TimePeriod } from '@/utils/dateRangeUtils';
import { SALES_COPY } from '../constants';
import { ScopeChips } from './ScopeChips';
import type { SalesStatisticsFilterOptions } from '../types';

interface SalesHeroBarProps {
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: TimePeriod | '';
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
  onTimePeriodChange: (period: TimePeriod | '') => void;
  storeIds: string[];
  carrierKeys: string[];
  pageNames: string[];
  onStoreIdsChange: (values: string[]) => void;
  onCarrierKeysChange: (values: string[]) => void;
  onPageNamesChange: (values: string[]) => void;
  approvedOnly: boolean;
  onApprovedOnlyChange: (value: boolean) => void;
  onClearScope: () => void;
  selectionCount: number;
  filterOptions?: SalesStatisticsFilterOptions;
  filterOptionsLoading: boolean;
  filterOptionsError: boolean;
  isFetching: boolean;
}

export function SalesHeroBar({
  fromDate,
  toDate,
  timePeriod,
  onFromDateChange,
  onToDateChange,
  onTimePeriodChange,
  storeIds,
  carrierKeys,
  pageNames,
  onStoreIdsChange,
  onCarrierKeysChange,
  onPageNamesChange,
  approvedOnly,
  onApprovedOnlyChange,
  onClearScope,
  selectionCount,
  filterOptions,
  filterOptionsLoading,
  filterOptionsError,
  isFetching,
}: SalesHeroBarProps) {
  const emptyMessage = filterOptionsError ? SALES_COPY.filterOptionsErrorMessage : undefined;

  return (
    <div className="relative bg-card text-card-foreground border border-border rounded-2xl shadow-sm p-4 sm:p-6 overflow-hidden">
      {isFetching && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" aria-hidden="true" />
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold">{SALES_COPY.pageTitle}</h1>
          <p className="text-muted-foreground text-sm">{SALES_COPY.subtitle}</p>
        </div>

        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          timePeriod={timePeriod}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
          onTimePeriodChange={onTimePeriodChange}
        />
      </div>

      <div className="border-t border-border mt-4 pt-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <MultiSelectDropdown
            value={storeIds}
            onChange={onStoreIdsChange}
            options={filterOptions?.stores ?? []}
            placeholder={SALES_COPY.storePlaceholder}
            emptyMessage={emptyMessage}
            loading={filterOptionsLoading}
            showSelectAll
            widthClass="w-full sm:w-[200px]"
          />
          <MultiSelectDropdown
            value={carrierKeys}
            onChange={onCarrierKeysChange}
            options={filterOptions?.carriers ?? []}
            placeholder={SALES_COPY.carrierPlaceholder}
            emptyMessage={emptyMessage}
            loading={filterOptionsLoading}
            showSelectAll
            widthClass="w-full sm:w-[200px]"
          />
          <MultiSelectDropdown
            value={pageNames}
            onChange={onPageNamesChange}
            options={filterOptions?.pages ?? []}
            placeholder={SALES_COPY.pagePlaceholder}
            emptyMessage={emptyMessage}
            loading={filterOptionsLoading}
            showSelectAll
            widthClass="w-full sm:w-[200px]"
          />

          <div className="flex items-center gap-2">
            <Switch checked={approvedOnly} onCheckedChange={onApprovedOnlyChange} />
            <span className="text-sm text-foreground">{SALES_COPY.approvedOnlyLabel}</span>
          </div>

          {selectionCount > 0 && (
            <button
              type="button"
              onClick={onClearScope}
              className="text-sm text-muted-foreground hover:text-foreground sm:ms-auto"
            >
              {SALES_COPY.clearAll}
            </button>
          )}
        </div>

        <ScopeChips
          storeIds={storeIds}
          carrierKeys={carrierKeys}
          pageNames={pageNames}
          storeOptions={filterOptions?.stores}
          carrierOptions={filterOptions?.carriers}
          pageOptions={filterOptions?.pages}
          onRemoveStore={(key) => onStoreIdsChange(storeIds.filter((id) => id !== key))}
          onRemoveCarrier={(key) => onCarrierKeysChange(carrierKeys.filter((id) => id !== key))}
          onRemovePage={(key) => onPageNamesChange(pageNames.filter((id) => id !== key))}
        />
      </div>
    </div>
  );
}
