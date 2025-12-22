"use client";

import React, { useState, useEffect } from "react";
import { Control, Controller, FieldErrors, useWatch, UseFormSetValue } from "react-hook-form";
import { OrderFiltersFormData } from "@/schemas/orderFilters.schema";
import { FilterOptions } from "@/types/orders";
import SearchableSelect from "./SearchableSelect";
import { DatePicker } from "@/components/ui/datepicker";
import { getGovernorates, getCities } from "@/lib/api/lookups";
import { LiaTimesSolid } from "react-icons/lia";
import { Button } from "@/components/ui/button";

interface GovernorateData {
  key: string;
  value: string;
}

interface CityData {
  key: string;
  value: string;
}

export type FilterKey = keyof OrderFiltersFormData | 'employeeName' | 'latest' | 'newest';

interface FilterDefinition {
  key: FilterKey;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'placeholder';
}

export const FILTER_DEFINITIONS: FilterDefinition[] = [
  { key: 'shipmentCode', label: 'كود الشحنة', type: 'textarea' },
  { key: 'customerName', label: 'اسم العميل', type: 'text' },
  { key: 'phone', label: 'رقم الهاتف', type: 'text' },
  { key: 'executionDate', label: 'تاريخ التنفيذ', type: 'date' },
  { key: 'employeeName', label: 'اسم الموظف', type: 'placeholder' },
  { key: 'productName', label: 'اسم الحملة', type: 'select' },
  { key: 'governorate', label: 'المحافظة', type: 'select' },
  { key: 'area', label: 'المنطقة', type: 'select' },
  { key: 'sizeColor', label: 'المصدر', type: 'select' },
  { key: 'address', label: 'العنوان', type: 'text' },
  { key: 'latest', label: 'الاحدث', type: 'select' },
  { key: 'newest', label: 'الجديد', type: 'select' },
];

interface FilterChipProps {
  filterKey: FilterKey;
  label: string;
  children: React.ReactNode;
  onRemove: (filterKey: FilterKey) => void;
}

const FilterChip = React.memo(function FilterChip({ filterKey, label, children, onRemove }: FilterChipProps) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-[250px] w-full">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
        <div className="flex-1 min-w-0 h-10">
          {children}
        </div>
        <Button
          onClick={() => onRemove(filterKey)}
          className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors p-0"
          aria-label={`إزالة ${label}`}
        >
          <LiaTimesSolid className="w-3 h-3" />
        </Button>
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
  const [governorates, setGovernorates] = useState<GovernorateData[]>([]);
  const [cities, setCities] = useState<CityData[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const selectedGovernorate = useWatch({
    control,
    name: "governorate",
  });

  useEffect(() => {
    const fetchGovernorates = async () => {
      try {
        const data = await getGovernorates();
        if (Array.isArray(data)) {
          setGovernorates(data);
        }
      } catch (error) {
        console.error("Failed to fetch governorates:", error);
      }
    };
    fetchGovernorates();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedGovernorate) {
        setCities([]);
        return;
      }

      setIsLoadingCities(true);
      try {
        const data = await getCities(selectedGovernorate);
        if (Array.isArray(data)) {
          setCities(data);
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedGovernorate, governorates]);

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
                  value={field.value ?? ''}
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
                  value={field.value ?? ''}
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
                  selected={field.value ? new Date(field.value) : null}
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
        if (key === 'sizeColor' || key === 'latest' || key === 'newest') {
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
      className="flex flex-wrap flex-col sm:flex-row items-start gap-4 px-4 py-4"
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
