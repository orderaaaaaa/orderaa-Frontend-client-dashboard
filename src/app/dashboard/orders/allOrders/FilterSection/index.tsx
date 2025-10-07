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
    <>
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setInternalOpen((v) => !v)}
          className="inline-flex items-center text-lg gap-3 px-4 py-2 rounded-md cursor-pointer transition text-gray-800 font-medium"
        >
          <SlidersHorizontal className="w-5 h-5" />
          الفلتر
        </button>
      </div>

      <FilterPanel
        open={internalOpen}
        filters={internalFilters}
        updateFilters={updateFilters}
        options={effectiveOptions}
      />
    </>
  );
});

export default FilterSection;
