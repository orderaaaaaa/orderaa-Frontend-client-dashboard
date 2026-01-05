'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { FilterOptions } from '@/types/orders';
import FilterPanelRHF, {
  FilterKey,
  FILTER_DEFINITIONS,
} from '@/app/dashboard/orders/allOrders/components/FilterSection/FilterPanelRHF';
import {
  LiaSlidersHSolid,
  LiaAngleDownSolid,
} from 'react-icons/lia';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { PrintStatusToggle } from './PrintStatusToggle';
import { PrintStatus } from '../../types';

interface FilterSectionProps {
  control: Control<OrderFiltersFormData>;
  errors: FieldErrors<OrderFiltersFormData>;
  options?: FilterOptions;
  setValue?: UseFormSetValue<OrderFiltersFormData>;
  initialFormFilters?: OrderFiltersFormData | null;
  printStatus: PrintStatus;
  onPrintStatusChange: (status: PrintStatus) => void;
  printedCount?: number;
  notPrintedCount?: number;
}

function getActiveFiltersFromFormValues(
  formFilters: OrderFiltersFormData | null | undefined
): FilterKey[] {
  if (!formFilters) return [];

  const activeKeys: FilterKey[] = [];

  for (const def of FILTER_DEFINITIONS) {
    if (def.key === 'employeeName') continue;

    const value = formFilters[def.key as keyof OrderFiltersFormData];
    if (value !== undefined && value !== '' && value !== null) {
      activeKeys.push(def.key);
    }
  }

  return activeKeys;
}

export function FilterSection({
  control,
  errors,
  options = {
    productOptions: [],
    sizeColorOptions: [],
    governorateOptions: [],
    areaOptions: [],
  },
  setValue,
  initialFormFilters,
  printStatus,
  onPrintStatusChange,
  printedCount = 0,
  notPrintedCount = 0,
}: FilterSectionProps) {
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>(() =>
    getActiveFiltersFromFormValues(initialFormFilters)
  );

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!initialFormFilters) return;

    const filtersFromUrl = getActiveFiltersFromFormValues(initialFormFilters);
    if (filtersFromUrl.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setActiveFilters((prev) => {
        const merged = new Set([...prev, ...filtersFromUrl]);
        return Array.from(merged);
      });
    }
  }, [initialFormFilters]);

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
    setActiveFilters(activeFilters.filter((f) => f !== filterKey));
    if (setValue && filterKey !== 'employeeName') {
      if (filterKey === 'newFirst') {
        setValue('newFirst', undefined, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        setValue(filterKey as keyof OrderFiltersFormData, '', {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  };

  const availableFilters = FILTER_DEFINITIONS.filter(
    (f) => !activeFilters.includes(f.key)
  );
  const filteredOptions = availableFilters.filter((f) =>
    f.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl py-[3px] mt-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="default"
                className="flex items-center gap-2 bg-primary text-white rounded-lg py-2.5 px-4 text-base font-medium hover:bg-[#4A1DB8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A1DB8]"
              >
                <LiaSlidersHSolid className="w-5 h-5" />
                <span>فلتر</span>
                <LiaAngleDownSolid
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
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
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
              </div>

              <ul className="max-h-48 overflow-y-auto py-1">
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-gray-500 text-base text-center">
                    {availableFilters.length === 0
                      ? 'تم اضافة جميع الفلاتر'
                      : 'لا توجد نتائج'}
                  </li>
                ) : (
                  filteredOptions.map((filter) => (
                    <li
                      key={filter.key}
                      className="px-3 py-2 cursor-pointer text-gray-700 text-base hover:bg-primary hover:text-white transition-colors"
                      onClick={() => addFilter(filter.key)}
                    >
                      {filter.label}
                    </li>
                  ))
                )}
              </ul>
            </PopoverContent>
          </Popover>

          {/* Placeholder Button (functionality TBD) */}
          <Button
            variant="outline"
            className="flex items-center gap-2 border-gray-300 text-gray-600 rounded-lg py-2.5 px-4 text-base font-medium hover:bg-gray-50 transition-colors"
            disabled
          >
            <span>زر إضافي</span>
          </Button>

          {/* Placeholder Filter with 2 options (functionality TBD) */}
          <Button
            variant="outline"
            className="flex items-center gap-2 border-gray-300 text-gray-600 rounded-lg py-2.5 px-4 text-base font-medium hover:bg-gray-50 transition-colors"
            disabled
          >
            <span>فلتر إضافي</span>
            <LiaAngleDownSolid className="w-4 h-4" />
          </Button>
        </div>

        {/* Print Status Toggle */}
        <PrintStatusToggle
          value={printStatus}
          onChange={onPrintStatusChange}
          printedCount={printedCount}
          notPrintedCount={notPrintedCount}
        />
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
}
