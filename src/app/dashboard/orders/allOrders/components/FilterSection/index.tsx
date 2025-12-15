'use client';

import React from 'react';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { FilterOptions } from '@/types/orders';
import FilterPanelRHF from './FilterPanelRHF';
import { SlidersHorizontal } from 'lucide-react';

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
  return (
    <div className="relative z-10 bg-white rounded-xl py-[3px] mt-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center text-lg gap-3 px-4 py-2 rounded-md text-gray-800 font-medium">
          <SlidersHorizontal className="w-5 h-5" />
          الفلتر
        </div>
      </div>

      <FilterPanelRHF control={control} errors={errors} options={options} setValue={setValue} />
    </div>
  );
});

export default FilterSection;
