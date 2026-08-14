import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, SlidersVertical, X as XIcon } from 'lucide-react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  activityTypeOptions,
  clientStatusOptions,
  customerOptions,
} from '../constants/SearchConst';
import debounce from 'lodash/debounce';
import { useOrderStatusesQuery } from '@/services/orders';

interface CustomerSearchProps {
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: string;
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
  onTimePeriodChange: (period: string) => void;
  onSearchChange: (search: string) => void;
  onClientStatusChange: (status: string) => void;
  onOrderStatusChange: (status: string) => void;
}

export default function CustomerSearch({
  fromDate,
  toDate,
  timePeriod,
  onFromDateChange,
  onToDateChange,
  onTimePeriodChange,
  onSearchChange,
  onClientStatusChange,
  onOrderStatusChange,
}: CustomerSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [clientStatus, setClientStatus] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [activityType, setActivityType] = useState('');
  const [allCustomers, setAllCustomers] = useState('');

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

  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        onSearchChange(searchTerm);
      }, 500),
    [onSearchChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleClientStatusChange = useCallback(
    (value: string) => {
      setClientStatus(value);
      const apiStatus =
        value === 'active' ? 'false' : value === 'frozen' ? 'true' : '';
      onClientStatusChange(apiStatus);
    },
    [onClientStatusChange]
  );

  const handleOrderStatusChange = useCallback(
    (value: string) => {
      setOrderStatus(value);
      onOrderStatusChange(value === 'all' ? '' : value);
    },
    [onOrderStatusChange]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="bg-white w-[95%] md:w-[97%] mx-auto rounded-lg shadow-md mb-6">
      <div className="p-4 md:p-6">
        {/* Main Search Row */}
        <div className="flex flex-col-reverse md:flex-row-reverse items-stretch md:items-center gap-4">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-6 md:px-12 py-2.5 rounded-lg transition-all cursor-pointer border ${isFilterOpen
                ? 'bg-primary text-white shadow-md border-primary'
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
          >
            <SlidersVertical className="w-5 h-5" />
            <span className="font-medium whitespace-nowrap">فلاتر متقدمة</span>
          </button>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="البحث بالاسم، رقم الهاتف، أو الكود..."
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right placeholder-gray-400"
              dir="rtl"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  debouncedSearch.cancel();
                  onSearchChange('');
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Filters */}
      {isFilterOpen && (
        <div className="px-4 md:px-6 pb-6 border-t border-gray-50 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Client Status */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 text-right">
                حالة العميل
              </label>
              <SearchableSelect
                value={clientStatus}
                onChange={handleClientStatusChange}
                options={clientStatusOptions}
                placeholder="اختر الحالة"
                widthClass="w-full"
                clearable
                triggerClassName="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm font-semibold bg-white text-right"
              />
            </div>

            {/* Order Status */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 text-right">
                حالة الطلب
              </label>
              <SearchableSelect
                value={orderStatus}
                onChange={handleOrderStatusChange}
                options={orderStatusOptions}
                placeholder="اختر حالة الطلب"
                widthClass="w-full"
                clearable
                triggerClassName="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm font-semibold bg-white text-right"
              />
            </div>

            {/* Activity Type */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 text-right">
                نوع الشارة
              </label>
              <SearchableSelect
                value={activityType}
                onChange={setActivityType}
                options={activityTypeOptions}
                placeholder="نوع الشاره"
                widthClass="w-full"
                clearable
                triggerClassName="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm font-semibold bg-white text-right"
              />
            </div>

            {/* All Customers */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 text-right">
                جميع العملاء
              </label>
              <SearchableSelect
                value={allCustomers}
                onChange={setAllCustomers}
                options={customerOptions}
                placeholder="عرض الجميع"
                widthClass="w-full"
                clearable
                triggerClassName="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm font-semibold bg-white text-right"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
