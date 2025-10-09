"use client";

import React from "react";
import { OrderFilters, FilterOptions } from "@/types/orders";
import SearchableSelect from "./SearchableSelect";
import { Calendar } from "lucide-react";

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
  return (
    <div className=" grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 backdrop-blur-md p-4 will-change-transform transform-gpu">
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
        <div className="relative max-w-62">
          <input
            type="date"
            value={filters.executionDate}
            onChange={(e) =>
              updateFilters({ ...filters, executionDate: e.target.value })
            }
            className={`w-full px-10 rounded border border-gray-300 bg-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              filters.executionDate ? "has-value py-2" : "py-5"
            }`}
          />
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500  pointer-events-none"
            size={20}
          />
          {!filters.executionDate && (
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              تاريخ التنفيذ
            </span>
          )}
        </div>
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
