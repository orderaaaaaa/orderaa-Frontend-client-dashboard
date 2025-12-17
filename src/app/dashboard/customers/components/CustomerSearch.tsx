import React, { useState } from 'react';
import { Search, SlidersVertical } from 'lucide-react';
import Dropdown from '@/components/ui/Dropdown';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  activityTypeOptions,
  clientStatusOptions,
  codeOptions,
  customerOptions,
  orderStatusOptions,
} from '../constants/SearchConst';
interface CustomerHeaderProps {
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: string;
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
  onTimePeriodChange: (period: string) => void;
}

export default function CustomerHeader({
  fromDate,
  toDate,
  timePeriod,
  onFromDateChange,
  onToDateChange,
  onTimePeriodChange,
}: CustomerHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [clientStatus, setClientStatus] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [activityType, setActivityType] = useState('');
  const [allCustomers, setAllCustomers] = useState('');
  const [code, setCode] = useState('');

  return (
    <div className="bg-white w-[90%] rounded-lg shadow-md mb-6">
      <div className="p-6">
        <div className="flex flex-row-reverse items-center gap-4">
          {/* Advanced Filters Button */}
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
              placeholder="البحث بالاسم، رقم الهاتف، البريد الالكتروني أو الكود"
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#5d24e1] focus:border-transparent text-right placeholder-gray-400 placeholder:font-semibold"
              dir="rtl"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Extended Filters */}
      {isFilterOpen && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-5 gap-4">
            {/* Client Status Dropdown */}
            <Dropdown
              value={clientStatus}
              onChange={setClientStatus}
              options={clientStatusOptions}
              placeholder="حالة العميل"
              readOnly={true}
              selectClassName="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-md font-semibold bg-white hover:bg-gray-50 text-right"
              arrowClassName="absolute cursor-pointer px-3 left-0 top-1/2 transform -translate-y-1/2 text-gray-500"
              dropdownClassName="absolute z-10 left-0 right-0 bg-white rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg border border-gray-200"
            />

            {/* Order Status Dropdown */}
            <Dropdown
              value={orderStatus}
              onChange={setOrderStatus}
              options={orderStatusOptions}
              placeholder="حالة الطلب"
              readOnly={true}
              selectClassName="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-md font-semibold bg-white hover:bg-gray-50 text-right"
              arrowClassName="absolute cursor-pointer px-3 left-0 top-1/2 transform -translate-y-1/2 text-gray-500"
              dropdownClassName="absolute z-10 left-0 right-0 bg-white rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg border border-gray-200"
            />

            {/* Activity Type Dropdown */}
            <Dropdown
              value={activityType}
              onChange={setActivityType}
              options={activityTypeOptions}
              placeholder="نوع النشارة"
              readOnly={true}
              selectClassName="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-md font-semibold bg-white hover:bg-gray-50 text-right"
              arrowClassName="absolute cursor-pointer px-3 left-0 top-1/2 transform -translate-y-1/2 text-gray-500"
              dropdownClassName="absolute z-10 left-0 right-0 bg-white rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg border border-gray-200"
            />

            {/* All Customers Dropdown */}
            <Dropdown
              value={allCustomers}
              onChange={setAllCustomers}
              options={customerOptions}
              placeholder="جميع العملاء"
              readOnly={true}
              selectClassName="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-md font-semibold bg-white hover:bg-gray-50 text-right"
            />

            {/* Code SearchableSelect */}
            <div className="relative">
              <SearchableSelect
                value={code}
                onValueChange={setCode}
                options={codeOptions}
                placeholder="بحث"
                searchPlaceholder="بحث عن الكود..."
                emptyMessage="لا توجد أكواد متاحة"
                noResultsMessage="لا توجد نتائج للبحث"
                triggerClassName="w-full border border-gray-300 rounded-lg py-2.5 pl-3 text-md font-semibold bg-white hover:bg-gray-50 text-right"
                searchThreshold={3}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
