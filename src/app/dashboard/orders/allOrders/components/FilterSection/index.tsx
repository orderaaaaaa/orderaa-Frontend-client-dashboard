'use client';

import React, { useState } from 'react';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { FilterOptions } from '@/types/orders';
import FilterPanelRHF, { FilterKey, FILTER_DEFINITIONS } from './FilterPanelRHF';
import { LiaSlidersHSolid, LiaFilterSolid, LiaAngleDownSolid } from 'react-icons/lia';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

type FilterSectionProps = {
  control: Control<OrderFiltersFormData>;
  errors: FieldErrors<OrderFiltersFormData>;
  options?: FilterOptions;
  setValue?: UseFormSetValue<OrderFiltersFormData>;
};

const FilterSection = React.memo(function FilterSection({
  control,
  errors,
  options = {
    productOptions: [],
    sizeColorOptions: [],
    governorateOptions: [],
    areaOptions: [],
  },
  setValue,
}: FilterSectionProps) {
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const addFilter = (filterKey: FilterKey) => {
    if (!activeFilters.includes(filterKey)) {
      setActiveFilters([...activeFilters, filterKey]);
    }
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const removeFilter = (filterKey: FilterKey) => {
    setActiveFilters(activeFilters.filter(f => f !== filterKey));
    if (setValue && filterKey !== 'employeeName' && filterKey !== 'latest' && filterKey !== 'newest') {
      setValue(filterKey as keyof OrderFiltersFormData, '', {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const availableFilters = FILTER_DEFINITIONS.filter(f => !activeFilters.includes(f.key));
  const filteredOptions = availableFilters.filter(f =>
    f.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl py-[3px] mt-6">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="inline-flex items-center text-lg gap-3 rounded-md text-gray-800 font-medium">
          <LiaSlidersHSolid className="w-5 h-5" />
          الفلتر
        </div>

        <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              className="flex items-center gap-2 bg-[#5D24E1] text-white rounded-lg py-2.5 px-4 text-base font-medium hover:bg-[#4A1DB8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A1DB8]"
            >
              <LiaFilterSolid className="w-5 h-5" />
              <span>اضف فلتر</span>
              <LiaAngleDownSolid
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[220px] p-0 border border-gray-200"
          >
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث..."
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
                autoFocus
              />
            </div>

            <ul className="max-h-48 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-gray-500 text-base text-center">
                  {availableFilters.length === 0 ? 'تم اضافة جميع الفلاتر' : 'لا توجد نتائج'}
                </li>
              ) : (
                filteredOptions.map((filter) => (
                  <li
                    key={filter.key}
                    className="px-3 py-2 cursor-pointer text-gray-700 text-base hover:bg-[#5D24E1] hover:text-white transition-colors"
                    onClick={() => addFilter(filter.key)}
                  >
                    {filter.label}
                  </li>
                ))
              )}
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      {activeFilters.length > 0 && (
        <FilterPanelRHF
          control={control}
          errors={errors}
          options={options}
          setValue={setValue}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
        />
      )}
    </div>
  );
});

export default FilterSection;
