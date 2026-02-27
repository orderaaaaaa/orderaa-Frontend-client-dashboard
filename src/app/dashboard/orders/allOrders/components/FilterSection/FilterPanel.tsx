"use client";

import React, { useCallback, useState, useEffect } from "react";
import { OrderFilters, FilterOptions } from "@/types/orders";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { DatePicker } from "@/components/ui/datepicker";
import { Calendar } from "lucide-react";
import { formatDateForUrl } from "@/utils/urlFilters";

type Props = {
  filters: OrderFilters;
  updateFilters: (next: OrderFilters) => void;
  options: FilterOptions;
};

export default function FilterPanel({
  filters,
  updateFilters,
  options,
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleInputChange = useCallback((field: keyof OrderFilters, value: string) => {
    updateFilters({ ...filters, [field]: value });
  }, [filters, updateFilters]);

  // Convert string date to Date object for DatePicker
  const [executionDate, setExecutionDate] = useState<Date | null>(
    filters.executionDate ? new Date(filters.executionDate) : null
  );

  // Sync executionDate with filters
  useEffect(() => {
    if (filters.executionDate && !executionDate) {
      setExecutionDate(new Date(filters.executionDate));
    } else if (!filters.executionDate && executionDate) {
      setExecutionDate(null);
    }
  }, [filters.executionDate]);

  const handleDateChange = (date: Date | null) => {
    setExecutionDate(date);
    updateFilters({
      ...filters,
      executionDate: date ? formatDateForUrl(date) : ''
    });
  };

  return (
    <div
      className=" grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 backdrop-blur-md p-4 will-change-transform transform-gpu"
      onKeyDown={handleKeyDown}
    >
      {/* {"كود الشحنه"} */}
      <div className="flex flex-col gap-1  text-base font-medium">
        <input
          type="text"
          value={filters.shipmentCode}
          onChange={(e) =>
            updateFilters({ ...filters, shipmentCode: e.target.value })
          }
          placeholder="كود الشحنة"
          className="max-w-62 px-3 py-2 rounded border  border-gray-300 bg-white"
        />
      </div>
      {/* {"اسم العميل"} */}
      <div className="flex flex-col gap-1 font-medium ">
        <input
          type="text"
          value={filters.customerName}
          onChange={(e) =>
            updateFilters({ ...filters, customerName: e.target.value })
          }
          placeholder="اسم العميل"
          className="max-w-62 px-3 py-2 rounded border border-gray-300 bg-white"
        />
      </div>
      {/* {"رقم الهاتف"} */}
      <div className="flex flex-col gap-1 font-medium">
        <input
          type="text"
          value={filters.phone}
          onChange={(e) => updateFilters({ ...filters, phone: e.target.value })}
          placeholder="رقم الهاتف"
          className="max-w-62 px-3 py-2 rounded border border-gray-300 bg-white"
        />
      </div>
      {/* {"تاريخ التنفيز"} */}
      <div className="flex flex-col gap-1 font-medium">
        <DatePicker
          selected={executionDate}
          onChange={handleDateChange}
          placeholder="تاريخ التنفيذ"
          showIcon={true}
          icon={Calendar}
          isClearable={true}
          className="max-w-62"
        />
      </div>
      {/* اسم الموظف */}
      <div className="flex flex-col gap-1 font-medium">
        <input
          type="text"
          value={filters.phone}
          onChange={(e) => updateFilters({ ...filters, phone: e.target.value })}
          placeholder="اسم الموظف"
          className="max-w-62 px-3 py-2 rounded border border-gray-300 bg-white"
        />
      </div>
      {/* {"اسم الحملة"} */}
      <SearchableSelect
        value={filters.productName}
        onChange={(v) => updateFilters({ ...filters, productName: v })}
        options={options.productOptions}
        placeholder="اسم الحملة"
        widthClass="max-w-62"
      />
      {/* {"المحافظه"} */}
      <SearchableSelect
        value={filters.governorate}
        onChange={(v) => updateFilters({ ...filters, governorate: v })}
        options={options.governorateOptions}
        placeholder="المحافظة"
        widthClass="max-w-62"
      />
      {/* {"المنطقه"} */}
      <SearchableSelect
        value={filters.area}
        onChange={(v) => updateFilters({ ...filters, area: v })}
        options={options.areaOptions}
        placeholder="المنطقة"
        widthClass="max-w-62"
      />
      {/* المصدر*/}
      <SearchableSelect
        value={filters.sizeColor}
        onChange={(v) => updateFilters({ ...filters, sizeColor: v })}
        options={options.sizeColorOptions}
        placeholder="المصدر"
        widthClass="max-w-62"
      />
      {/* {"العنوان"} */}
      <div className="flex flex-col gap-1 font-medium">
        <input
          type="text"
          value={filters.address}
          onChange={(e) =>
            updateFilters({ ...filters, address: e.target.value })
          }
          placeholder="العنوان"
          className="max-w-62 px-3 py-2 rounded border border-gray-300 bg-white"
        />
      </div>
      {/* الاحدث*/}
      <SearchableSelect
        value={filters.sizeColor}
        onChange={(v) => updateFilters({ ...filters, sizeColor: v })}
        options={options.sizeColorOptions}
        placeholder="الاحدث"
        widthClass="max-w-62"
      />
      {/* الجديد*/}
      <SearchableSelect
        value={filters.sizeColor}
        onChange={(v) => updateFilters({ ...filters, sizeColor: v })}
        options={options.sizeColorOptions}
        placeholder="الجديد"
        widthClass="max-w-62"
      />
    </div>
  );
}
