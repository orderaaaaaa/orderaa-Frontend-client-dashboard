'use client';

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Input from '@/components/ui/Input';
import {
  activities,
  allDepartments,
  salesRates,
  searchOptions,
  topDeliveryRates,
  topSellers,
} from '../constants/filters';
import { useGovernoratesQuery } from '@/services/lookups';

type ClearableSelectProps = {
  value: string;
  onClear: () => void;
  children: React.ReactNode;
};

//TODO: talk ot nader about making a reusable ClearableSelect component in ui library or merge it with SearchableSelect
const ClearableSelect = ({
  value,
  onClear,
  children,
}: ClearableSelectProps) => {
  return (
    <div className="relative w-full">
      {children}

      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute left-10 top-1/2 -translate-y-1/2 z-20
                     text-gray-400 hover:text-primary cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const StoresFilters = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const [departmentValue, setDepartmentValue] = React.useState('');
  const [sellerValue, setSellerValue] = React.useState('');
  const [governmentValue, setGovernmentValue] = React.useState('');
  const [activityValue, setActivityValue] = React.useState('');
  const [deliveryValue, setDeliveryValue] = React.useState('');
  const [salesValue, setSalesValue] = React.useState('');
  const [searchValue, setSearchValue] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: governorates = [] } = useGovernoratesQuery();

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary">تصفية المتاجر</h3>

        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 px-4 h-[41px] rounded-sm border bg-white hover:bg-gray-50 transition"
        >
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <span className="font-semibold">
            {isOpen ? 'إغلاق الفلاتر' : 'عرض الفلاتر'}
          </span>
        </button>
      </div>

      {/* Collapsible content */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="relative">
          <div className="p-6 rounded-lg shadow-md bg-white">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن المتجر"
                icon={Search}
                inputClassName="h-[41px] !bg-primary/8 rounded-sm !text-primary !border-[#cbc7d5] text-xl font-semibold pr-10 pl-10"
              />

              <ClearableSelect
                value={departmentValue}
                onClear={() => setDepartmentValue('')}
              >
                <SearchableSelect
                  value={departmentValue}
                  onChange={setDepartmentValue}
                  options={allDepartments}
                  placeholder="جميع الأقسام"
                  searchPlaceholder="بحث..."
                  className="w-full"
                  triggerClassName="h-[41px] rounded-sm bg-gray-50 font-semibold text-lg"
                />
              </ClearableSelect>

              <ClearableSelect
                value={sellerValue}
                onClear={() => setSellerValue('')}
              >
                <SearchableSelect
                  value={sellerValue}
                  onChange={setSellerValue}
                  options={topSellers}
                  placeholder="الأكثر مبيعاً"
                  searchPlaceholder="بحث..."
                  className="w-full"
                  triggerClassName="h-[41px] rounded-sm bg-gray-50 font-semibold text-lg"
                />
              </ClearableSelect>

              <ClearableSelect
                value={governmentValue}
                onClear={() => setGovernmentValue('')}
              >
                <SearchableSelect
                  value={governmentValue}
                  onChange={setGovernmentValue}
                  options={governorates}
                  placeholder="جميع المحافظات"
                  searchPlaceholder="بحث..."
                  className="w-full"
                  triggerClassName="h-[41px] rounded-sm bg-gray-50 font-semibold text-lg"
                />
              </ClearableSelect>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ClearableSelect
                value={searchValue}
                onClear={() => setSearchValue('')}
              >
                <SearchableSelect
                  value={searchValue}
                  onChange={setSearchValue}
                  options={searchOptions}
                  placeholder="الاحدث"
                  searchPlaceholder="بحث..."
                  className="w-full"
                  triggerClassName="h-[41px] rounded-sm bg-gray-50 font-semibold text-lg"
                />
              </ClearableSelect>

              <ClearableSelect
                value={deliveryValue}
                onClear={() => setDeliveryValue('')}
              >
                <SearchableSelect
                  value={deliveryValue}
                  onChange={setDeliveryValue}
                  options={topDeliveryRates}
                  placeholder="أعلى نسب تسليم"
                  searchPlaceholder="بحث..."
                  className="w-full"
                  triggerClassName="h-[41px] rounded-sm bg-gray-50 font-semibold text-lg"
                />
              </ClearableSelect>

              <ClearableSelect
                value={activityValue}
                onClear={() => setActivityValue('')}
              >
                <SearchableSelect
                  value={activityValue}
                  onChange={setActivityValue}
                  options={activities}
                  placeholder="نشط"
                  searchPlaceholder="بحث..."
                  className="w-full"
                  triggerClassName="h-[41px] rounded-sm bg-gray-50 font-semibold text-lg"
                />
              </ClearableSelect>

              <ClearableSelect
                value={salesValue}
                onClear={() => setSalesValue('')}
              >
                <SearchableSelect
                  value={salesValue}
                  onChange={setSalesValue}
                  options={salesRates}
                  placeholder="معدل البيعات"
                  searchPlaceholder="بحث..."
                  className="w-full"
                  triggerClassName="h-[41px] rounded-sm bg-gray-50 font-semibold text-lg"
                />
              </ClearableSelect>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoresFilters;
