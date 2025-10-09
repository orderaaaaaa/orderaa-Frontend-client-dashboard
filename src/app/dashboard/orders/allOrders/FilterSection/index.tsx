"use client";

import React from "react";
import { OrderFilters, FilterOptions } from "@/types/orders";
import { useFilterState } from "../../../../../hooks/AllOrders/useFilterState";
import FilterPanel from "./FilterPanel";
import { SlidersHorizontal } from "lucide-react";

type FilterSectionProps = {
  open?: boolean;
  filters?: OrderFilters;
  onChange?: (next: OrderFilters) => void;
  options?: FilterOptions;
  defaultOpen?: boolean;
};

const FilterSection = React.memo(function FilterSection(
  props: FilterSectionProps
) {
  const {
    internalOpen,
    setInternalOpen,
    internalFilters,
    updateFilters,
    effectiveOptions,
  } = useFilterState(props);

  return (
    <div className="max-sm:hidden relative z-10 bg-white rounded-xl py-[3px] mt-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center text-lg gap-3 px-4 py-2 rounded-md  text-gray-800 font-medium">
          <SlidersHorizontal className="w-5 h-5" />
          الفلتر
        </div>
      </div>

      <FilterPanel
        filters={internalFilters}
        updateFilters={updateFilters}
        options={effectiveOptions}
      />
    </div>
  );
});

export default FilterSection;
