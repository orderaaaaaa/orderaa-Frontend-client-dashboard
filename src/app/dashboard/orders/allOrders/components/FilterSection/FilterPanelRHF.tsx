"use client";

import React from "react";
import { Control, Controller, FieldErrors, useWatch, UseFormSetValue } from "react-hook-form";
import { OrderFiltersFormData } from "@/schemas/orderFilters.schema";
import { FilterOptions } from "@/types/orders";
import SearchableSelect from "./SearchableSelect";
import { DatePicker } from "@/components/ui/datepicker";
import { useGovernoratesQuery, useCitiesQuery } from "@/services/lookups";
import { LiaTimesSolid } from "react-icons/lia";

export type FilterKey = keyof OrderFiltersFormData | 'employeeName';

interface FilterDefinition {
  key: FilterKey;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'placeholder';
}

export const FILTER_DEFINITIONS: FilterDefinition[] = [
  { key: 'shipmentCode', label: 'كود الشحنة', type: 'text' },
  { key: 'customerName', label: 'اسم العميل', type: 'text' },
  { key: 'phone', label: 'رقم الهاتف', type: 'text' },
  { key: 'executionDate', label: 'تاريخ التنفيذ', type: 'date' },
  { key: 'employeeName', label: 'اسم الموظف', type: 'placeholder' },
  { key: 'productName', label: 'اسم الحملة', type: 'select' },
  { key: 'governorate', label: 'المحافظة', type: 'select' },
  { key: 'area', label: 'المنطقة', type: 'select' },
  { key: 'sizeColor', label: 'المصدر', type: 'select' },
  { key: 'address', label: 'العنوان', type: 'text' },
  { key: 'newFirst', label: 'الأحدث', type: 'select' },
  { key: 'orderByDirection', label: 'الترتيب', type: 'select' },
];

interface FilterChipProps {
  filterKey: FilterKey;
  label: string;
  children: React.ReactNode;
  onRemove: (filterKey: FilterKey) => void;
}

const FilterChip = React.memo(function FilterChip({ filterKey, label, children, onRemove }: FilterChipProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {/* <span className="text-sm font-medium text-gray-600">{label}</span> */}
      <div className="flex items-center gap-2 rounded-lg px-3 py-2">
        <div className="flex-1 min-w-0 h-10">
          {children}
        </div>
        <button
          type="button"
          onClick={() => onRemove(filterKey)}
          className="cursor-pointer flex-shrink-0 w-5 h-5 bg-gray-500 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
          aria-label={`إزالة ${label}`}
        >
          <LiaTimesSolid className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});

type Props = {
  control: Control<OrderFiltersFormData>;
  errors: FieldErrors<OrderFiltersFormData>;
  options: FilterOptions;
  setValue?: UseFormSetValue<OrderFiltersFormData>;
  activeFilters: FilterKey[];
  onRemoveFilter: (filterKey: FilterKey) => void;
};

export default function FilterPanel({
  control,
  errors,
  options,
  setValue,
  activeFilters,
  onRemoveFilter,
}: Props) {
  const selectedGovernorate = useWatch({
    control,
    name: "governorate",
  });

  // Use React Query hooks for caching
  const { data: governorates = [] } = useGovernoratesQuery();
  const { data: cities = [], isLoading: isLoadingCities } = useCitiesQuery(selectedGovernorate);

  const governorateOptions = governorates;
  const cityOptions = cities;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const renderFilterField = (filterDef: FilterDefinition) => {
    const { key, label, type } = filterDef;

    switch (type) {
      case 'textarea':
        return (
          <Controller
            key={key}
            name={key as keyof OrderFiltersFormData}
            control={control}
            render={({ field }) => (
              <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                <textarea
                  {...field}
                  value={String(field.value ?? '')}
                  placeholder={label}
                  rows={1}
                  className={`w-full h-full px-3 rounded border bg-white resize-none text-base ${errors[key as keyof OrderFiltersFormData] ? 'border-red-500' : 'border-gray-300'}`}
                />
              </FilterChip>
            )}
          />
        );

      case 'text':
        return (
          <Controller
            key={key}
            name={key as keyof OrderFiltersFormData}
            control={control}
            render={({ field }) => (
              <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                <input
                  {...field}
                  value={String(field.value ?? '')}
                  type="text"
                  placeholder={label}
                  className={`w-full h-full px-3 rounded border bg-white ${errors[key as keyof OrderFiltersFormData] ? 'border-red-500' : 'border-gray-300'}`}
                />
              </FilterChip>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            key={key}
            name={key as keyof OrderFiltersFormData}
            control={control}
            render={({ field }) => (
              <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                <DatePicker
                  selected={field.value && typeof field.value === 'string' ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                  placeholder={label}
                  className="w-full h-full border border-gray-300 rounded bg-white"
                  isClearable
                />
              </FilterChip>
            )}
          />
        );

      case 'select':
        if (key === 'productName') {
          return (
            <Controller
              key={key}
              name="productName"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={options.productOptions}
                    placeholder={label}
                    widthClass="w-full"
                    error={errors.productName?.message}
                  />
                </FilterChip>
              )}
            />
          );
        }
        if (key === 'governorate') {
          return (
            <Controller
              key={key}
              name="governorate"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={(value) => {
                      field.onChange(value);
                      if (setValue) {
                        setValue('area', '');
                      }
                    }}
                    onBlur={field.onBlur}
                    options={governorateOptions}
                    placeholder={label}
                    widthClass="w-full"
                    error={errors.governorate?.message}
                  />
                </FilterChip>
              )}
            />
          );
        }
        if (key === 'area') {
          return (
            <Controller
              key={key}
              name="area"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={cityOptions}
                    placeholder={isLoadingCities ? "جاري التحميل..." : label}
                    widthClass="w-full"
                    error={errors.area?.message}
                    disabled={!selectedGovernorate || isLoadingCities}
                  />
                </FilterChip>
              )}
            />
          );
        }
        if (key === 'sizeColor') {
          return (
            <Controller
              key={key}
              name="sizeColor"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={options.sizeColorOptions}
                    placeholder={label}
                    widthClass="w-full"
                  />
                </FilterChip>
              )}
            />
          );
        }
        if (key === 'newFirst') {
          const newFirstOptions = [
            { key: 'true', value: 'الأجدد' },
            { key: 'false', value: 'الأقدم' },
          ];
          return (
            <Controller
              key={key}
              name="newFirst"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <SearchableSelect
                    value={field.value === true ? 'true' : field.value === false ? 'false' : ''}
                    onChange={(value) => field.onChange(value === 'true')}
                    onBlur={field.onBlur}
                    options={newFirstOptions}
                    placeholder={label}
                    widthClass="w-full"
                  />
                </FilterChip>
              )}
            />
          );
        }
        if (key === 'orderByDirection') {
          const orderByDirectionOptions = [
            { key: 'asc', value: 'ترتيب تصاعدي' },
            { key: 'desc', value: 'ترتيب تنازلي' },
          ];
          return (
            <Controller
              key={key}
              name="orderByDirection"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={orderByDirectionOptions}
                    placeholder={label}
                    widthClass="w-full"
                  />
                </FilterChip>
              )}
            />
          );
        }
        return null;

      case 'placeholder':
        return (
          <FilterChip key={key} filterKey={key} label={label} onRemove={onRemoveFilter}>
            <input
              type="text"
              placeholder={label}
              className="w-full h-full px-3 rounded border border-gray-300 bg-white"
              disabled
            />
          </FilterChip>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 px-4 py-4"
      onKeyDown={handleKeyDown}
    >
      {activeFilters.map((filterKey) => {
        const filterDef = FILTER_DEFINITIONS.find(f => f.key === filterKey);
        if (!filterDef) return null;
        return renderFilterField(filterDef);
      })}
    </div>
  );
}
