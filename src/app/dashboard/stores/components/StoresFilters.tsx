import React from 'react';
import { Search } from 'lucide-react';
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

const StoresFilters = ({}) => {
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
    <div className="mt-8 p-6 rounded-lg shadow-md bg-white">
      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن المتجر"
          icon={Search}
          className="w-fulls"
          inputClassName="h-[41px] text-base !bg-primary/8  rounded-sm !text-primary !border-[#cbc7d5] text-xl font-semibold pr-10 pl-10"
        />
        <SearchableSelect
          value={departmentValue}
          onChange={setDepartmentValue}
          options={allDepartments}
          placeholder="جميع الأقسام"
          searchPlaceholder="بحث..."
          className="w-full"
          triggerClassName="h-[41px] text-base rounded-sm bg-gray-50 font-semibold text-lg"
        />
        <SearchableSelect
          value={sellerValue}
          onChange={setSellerValue}
          options={topSellers}
          placeholder="الأكثر مبيعاً"
          searchPlaceholder="بحث..."
          className="w-full"
          triggerClassName="h-[41px] text-base rounded-sm bg-gray-50 font-semibold text-lg"
        />
        <SearchableSelect
          value={governmentValue}
          onChange={setGovernmentValue}
          options={governorates}
          placeholder="جميع المحافظات"
          searchPlaceholder="بحث..."
          className="w-full"
          triggerClassName="h-[41px] text-base rounded-sm bg-gray-50 font-semibold text-lg"
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchableSelect
          value={searchValue}
          onChange={setSearchValue}
          options={searchOptions}
          placeholder="الاحدث"
          searchPlaceholder="بحث..."
          className="w-full"
          triggerClassName="h-[41px] text-base rounded-sm bg-gray-50 font-semibold text-lg"
        />
        <SearchableSelect
          value={deliveryValue}
          onChange={setDeliveryValue}
          options={topDeliveryRates}
          placeholder="أعلى نسب تسليم"
          searchPlaceholder="بحث..."
          className="w-full"
          triggerClassName="h-[41px] text-base rounded-sm bg-gray-50 font-semibold text-lg"
        />
        <SearchableSelect
          value={activityValue}
          onChange={setActivityValue}
          options={activities}
          placeholder="نشط"
          searchPlaceholder="بحث..."
          className="w-full"
          triggerClassName="h-[41px] text-base rounded-sm bg-gray-50 font-semibold text-lg"
        />
        <SearchableSelect
          value={salesValue}
          onChange={setSalesValue}
          options={salesRates}
          placeholder="معدل البيعات"
          searchPlaceholder="بحث..."
          className="w-full"
          triggerClassName="h-[41px] text-base rounded-sm bg-gray-50 font-semibold text-lg"
        />
      </div>
    </div>
  );
};

export default StoresFilters;
