import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, SlidersVertical } from 'lucide-react';
import Dropdown from '@/components/ui/Dropdown';
import {
  activityTypeOptions,
  clientStatusOptions,
  customerOptions,
  orderStatusOptions,
} from '../constants/SearchConst';
import debounce from 'lodash/debounce';

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
  const [timePeriodChange, setTimePeriodChange] = useState('');
  const [allCustomers, setAllCustomers] = useState('');

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

      let apiStatus: string | undefined;
      if (value === 'active') {
        apiStatus = 'false';
      } else if (value === 'frozen') {
        apiStatus = 'true';
      } else {
        apiStatus = '';
      }

      onClientStatusChange(apiStatus);
    },
    [onClientStatusChange]
  );

  const handleOrderStatusChange = useCallback(
    (value: string) => {
      setOrderStatus(value);

      let apiStatus: string | undefined;
      if (value === 'all') {
        apiStatus = '';
      } else {
        apiStatus = value;
      }

      onOrderStatusChange(apiStatus);
    },
    [onOrderStatusChange]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="bg-white w-[97%] mx-auto rounded-lg shadow-md mb-6">
      <div className="p-6">
        <div className="flex flex-row-reverse items-center gap-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-12 py-2.5 rounded-lg transition-all cursor-pointer ${
              isFilterOpen
                ? 'bg-[#5d24e1] text-white shadow-lg'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <SlidersVertical className="w-5 h-5" />
            <p className="font-medium">فلاتر متقدمة</p>
          </button>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="البحث بالاسم، رقم الهاتف، البريد الالكتروني أو الكود"
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#5d24e1] focus:border-transparent text-right placeholder-gray-400 placeholder:font-semibold"
              dir="rtl"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5d24e1]" />
          </div>
        </div>
      </div>

      {/* Extended Filters */}
      {isFilterOpen && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-5 gap-4">
            {/* Client Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                حالة العميل
              </label>
              <Dropdown
                value={clientStatus}
                onChange={handleClientStatusChange}
                options={clientStatusOptions}
                placeholder="حالة العميل"
                readOnly={true}
                selectClassName="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-md font-semibold bg-white hover:bg-gray-50 text-right"
                arrowClassName="absolute cursor-pointer px-3 left-0 top-1/2 transform -translate-y-1/2 text-gray-500"
                dropdownClassName="absolute z-10 left-0 right-0 bg-white rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg border border-gray-200"
              />
            </div>

            {/* Order Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                حالة الطلب
              </label>
              <Dropdown
                value={orderStatus}
                onChange={handleOrderStatusChange}
                options={orderStatusOptions}
                placeholder="حالة الطلب"
                readOnly={true}
                selectClassName="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-md font-semibold bg-white hover:bg-gray-50 text-right"
                arrowClassName="absolute cursor-pointer px-3 left-0 top-1/2 transform -translate-y-1/2 text-gray-500"
                dropdownClassName="absolute z-10 left-0 right-0 bg-white rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg border border-gray-200"
              />
            </div>

            {/* Activity Type Dropdown - Kept but not functional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                نوع الشارة
              </label>
              <Dropdown
                value={activityType}
                onChange={setActivityType}
                options={activityTypeOptions}
                placeholder="نوع الشاره"
                readOnly={true}
                selectClassName="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-md font-semibold bg-white hover:bg-gray-50 text-right"
                arrowClassName="absolute cursor-pointer px-3 left-0 top-1/2 transform -translate-y-1/2 text-gray-500"
                dropdownClassName="absolute z-10 left-0 right-0 bg-white rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg border border-gray-200"
              />
            </div>

            {/* All Customers Dropdown - Kept but not functional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                جميع العملاء
              </label>
              <Dropdown
                value={allCustomers}
                onChange={setAllCustomers}
                options={customerOptions}
                placeholder="جميع العملاء"
                readOnly={true}
                selectClassName="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-md font-semibold bg-white hover:bg-gray-50 text-right"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
