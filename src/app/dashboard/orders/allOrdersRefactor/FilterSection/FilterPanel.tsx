"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OrderFilters, FilterOptions } from "@/types/orders";
import SearchableSelect from "./SearchableSelect";
type Props = {
  open: boolean;
  filters: OrderFilters;
  updateFilters: (next: OrderFilters) => void;
  options: FilterOptions;
};

export default function FilterPanel({
  open,
  filters,
  updateFilters,
  options,
}: Props) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          style={{ originY: 0 }}
          className="flex flex-wrap gap-4 mb-6 rounded-xl border-white/50 bg-white/50 backdrop-blur-md shadow-sm p-4 pt-1 will-change-transform transform-gpu"
        >
          <SearchableSelect
            value={filters.productName}
            onChange={(v) => updateFilters({ ...filters, productName: v })}
            options={options.productOptions}
            placeholder="اسم المنتج"
            widthClass="w-56"
          />

          <div className="flex flex-col gap-1  text-base font-medium">
            <input
              type="text"
              value={filters.shipmentCode}
              onChange={(e) =>
                updateFilters({ ...filters, shipmentCode: e.target.value })
              }
              placeholder="كود الشحنة"
              className="w-56 px-3 py-2 rounded border  border-gray-300 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1 font-medium ">
            <input
              type="text"
              value={filters.customerName}
              onChange={(e) =>
                updateFilters({ ...filters, customerName: e.target.value })
              }
              placeholder="اسم العميل"
              className="w-56 px-3 py-2 rounded border border-gray-300 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1 font-medium">
            <input
              type="text"
              value={filters.phone}
              onChange={(e) =>
                updateFilters({ ...filters, phone: e.target.value })
              }
              placeholder="رقم الهاتف"
              className="w-56 px-3 py-2 rounded border border-gray-300 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1 font-medium">
            <input
              type="text"
              value={filters.address}
              onChange={(e) =>
                updateFilters({ ...filters, address: e.target.value })
              }
              placeholder="العنوان"
              className="w-64 px-3 py-2 rounded border border-gray-300 bg-white"
            />
          </div>

          <SearchableSelect
            value={filters.sizeColor}
            onChange={(v) => updateFilters({ ...filters, sizeColor: v })}
            options={options.sizeColorOptions}
            placeholder="المقاس و اللون"
            widthClass="w-56"
          />

          <SearchableSelect
            value={filters.governorate}
            onChange={(v) => updateFilters({ ...filters, governorate: v })}
            options={options.governorateOptions}
            placeholder="المحافظة"
            widthClass="w-56"
          />

          <SearchableSelect
            value={filters.area}
            onChange={(v) => updateFilters({ ...filters, area: v })}
            options={options.areaOptions}
            placeholder="المنطقة"
            widthClass="w-56"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
