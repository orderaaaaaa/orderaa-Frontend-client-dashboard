"use client";

import React, { useState, useEffect } from "react";
import { Control, Controller, FieldErrors, useWatch, UseFormSetValue } from "react-hook-form";
import { OrderFiltersFormData } from "@/schemas/orderFilters.schema";
import { FilterOptions } from "@/types/orders";
import SearchableSelect from "@/components/ui/SearchableSelect";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import { DatePicker } from "@/components/ui/datepicker";
import { useGovernoratesQuery, useCitiesQuery } from "@/services/lookups";
import { useCancellationReasons } from "@/services/orders";
import { useProductAttributeOptionsQuery } from "@/services/products";
import useShippingCompanies from "@/hooks/useShippingCompanies";
import { useQuery } from "@tanstack/react-query";
import http from "@/lib/api/http";
import { useDebounce, useDebouncedCallback } from "@/utils/debounce";
import { LiaTimesSolid } from "react-icons/lia";
import { Button } from "@/components/ui/button";
import { formatDateForUrl } from "@/utils/urlFilters";

export type FilterKey = keyof OrderFiltersFormData;

interface FilterDefinition {
  key: FilterKey;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'placeholder' | 'multiselect' | 'toggle';
  visibleStatuses?: string[];
}

export const FILTER_DEFINITIONS: FilterDefinition[] = [
  { key: 'shipmentCode', label: 'كود الشحنة', type: 'text' },
  { key: 'customerName', label: 'اسم العميل', type: 'text' },
  { key: 'phone', label: 'رقم الهاتف', type: 'text' },
  { key: 'executionDate', label: 'تاريخ التنفيذ', type: 'date' },
  { key: 'employeeName', label: 'اسم الموظف', type: 'placeholder' },
  { key: 'productId', label: 'المنتج', type: 'select' },
  // Depends on a chosen product: option ids belong to one, so the control
  // stays disabled until المنتج is set, and clears when it changes.
  { key: 'variantOptionIds', label: 'المتغيرات', type: 'select' },
  { key: 'governorate', label: 'المحافظة', type: 'select' },
  // المنطقة is populated from the cities lookup, so it submits `city`. It used
  // to submit `area`, a different column that is empty on every order.
  { key: 'city', label: 'المنطقة', type: 'select' },
  { key: 'sizeColor', label: 'المصدر', type: 'select' },
  { key: 'address', label: 'العنوان', type: 'text' },
  { key: 'storeId', label: 'اسم المتجر', type: 'select' },
  { key: 'shippingCompany', label: 'شركة الشحن', type: 'select' },
  { key: 'cancellationReasons', label: 'سبب الإلغاء', type: 'multiselect', visibleStatuses: ['CANCELLED'] },
  { key: 'orderByDirection', label: 'الترتيب', type: 'select' },
];

function DebouncedInput({
  value: externalValue,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [localValue, setLocalValue] = useState(externalValue);
  const debouncedOnChange = useDebouncedCallback(onChange, 500);

  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    debouncedOnChange(e.target.value);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}

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
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(filterKey)}
          aria-label={`إزالة ${label}`}
          className="flex items-center justify-center w-6 h-6 bg-gray-500 hover:bg-gray-700 text-white rounded-full hover:text-white"
        >
          <LiaTimesSolid className="w-4 h-4" />
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
  const isProductActive = activeFilters.includes('productId');
  const isVariantActive = activeFilters.includes('variantOptionIds');
  const isGovernorateActive = activeFilters.includes('governorate');
  const isCityActive = activeFilters.includes('city');
  const isCancellationReasonActive = activeFilters.includes('cancellationReasons');
  const isStoreActive = activeFilters.includes('storeId');
  const isShippingCompanyActive = activeFilters.includes('shippingCompany');

  const selectedGovernorate = useWatch({
    control,
    name: "governorate",
  });

  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 300);

  const selectedProductId = useWatch({ control, name: 'productId' });

  const { data: productOptions = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-filter-options', debouncedProductSearch],
    queryFn: async () => {
      const response = await http.get<{ data: { id: number; name: string }[] }>('/products', {
        params: {
          page: 1,
          limit: 50,
          ...(debouncedProductSearch && { search: debouncedProductSearch }),
        },
      });
      return response.data.data.map((p) => ({ key: String(p.id), value: p.name }));
    },
    enabled: isProductActive,
  });

  const { data: selectedProductName } = useQuery({
    queryKey: ['product-name', selectedProductId],
    queryFn: async () => {
      const response = await http.get<{
        data?: { id: number; name: string };
        name?: string;
      }>(`/products/${selectedProductId}`);
      const product = response.data?.data ?? response.data;
      return product?.name;
    },
    enabled: !!selectedProductId,
    staleTime: 5 * 60 * 1000,
  });

  // The product's attribute options — the same endpoint the products page's
  // variant popup uses. Soft-deleted options are excluded by the endpoint, so
  // a discontinued colour is not offered while historic orders still match it.
  const { data: attributeOptions, isLoading: isLoadingVariantOptions } =
    useProductAttributeOptionsQuery(
      isVariantActive && selectedProductId ? Number(selectedProductId) : undefined,
    );
  const variantGroups = React.useMemo(
    () => (attributeOptions?.options ?? []).filter((g) => (g.options ?? []).length > 0),
    [attributeOptions],
  );
  const { data: governorates = [] } = useGovernoratesQuery(isGovernorateActive || isCityActive);
  const { data: cities = [], isLoading: isLoadingCities } = useCitiesQuery(isCityActive ? selectedGovernorate : undefined);
  const { data: cancellationReasons = [] } = useCancellationReasons(isCancellationReasonActive);
  const cancellationReasonOptions = React.useMemo(
    () => cancellationReasons.map((r) => ({ key: String(r.id), value: r.reasonName })),
    [cancellationReasons]
  );
  const { data: storeOptions = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ['stores-filter-options'],
    queryFn: async () => {
      const response = await http.get<{ id: number; name: string }[]>('/stores');
      return response.data.map((s) => ({ key: String(s.id), value: s.name }));
    },
    enabled: isStoreActive,
    staleTime: Infinity,
  });
  const { shippingCompanies, isLoading: isLoadingShippingCompanies } = useShippingCompanies(isShippingCompanyActive);

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
        if (key === 'employeeName') {
          return (
            <Controller
              key={key}
              name="employeeName"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <DebouncedInput
                    value={String(field.value ?? '')}
                    onChange={field.onChange}
                    placeholder={label}
                    className={`w-full h-full px-3 rounded border bg-white ${errors.employeeName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </FilterChip>
              )}
            />
          );
        }
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
                  onChange={(date) => field.onChange(date ? formatDateForUrl(date) : '')}
                  placeholder={label}
                  className="w-full h-full border border-gray-300 rounded bg-white"
                  isClearable
                />
              </FilterChip>
            )}
          />
        );

      case 'select':
        if (key === 'productId') {
          return (
            <Controller
              key={key}
              name="productId"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={(value) => {
                      field.onChange(value);
                      // Options belong to the product that was chosen, so a
                      // different product invalidates them.
                      if (setValue) {
                        setValue('variantOptionIds', []);
                      }
                    }}
                    onBlur={field.onBlur}
                    options={productOptions}
                    displayValue={selectedProductName}
                    placeholder={isLoadingProducts ? "جاري التحميل..." : label}
                    widthClass="w-full"
                    loading={isLoadingProducts}
                    error={errors.productId?.message}
                    onSearch={setProductSearch}
                    clearable
                  />
                </FilterChip>
              )}
            />
          );
        }
        if (key === 'variantOptionIds') {
          return (
            <Controller
              key={key}
              name="variantOptionIds"
              control={control}
              // Typed explicitly: react-hook-form's own types do not resolve in
              // this project, so an inferred `field` would land as `any`.
              render={({
                field,
              }: {
                field: { value: number[] | undefined; onChange: (v: number[]) => void };
              }) => {
                const selected: number[] = Array.isArray(field.value) ? field.value : [];
                const toggle = (optionId: number) =>
                  field.onChange(
                    selected.includes(optionId)
                      ? selected.filter((id) => id !== optionId)
                      : [...selected, optionId],
                  );

                return (
                  <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                    {!selectedProductId ? (
                      <span className="text-xs text-gray-500 py-2 block">
                        اختر منتجًا أولاً لعرض متغيراته
                      </span>
                    ) : isLoadingVariantOptions ? (
                      <span className="text-xs text-gray-500 py-2 block">جاري التحميل...</span>
                    ) : variantGroups.length === 0 ? (
                      <span className="text-xs text-gray-500 py-2 block">
                        لا توجد متغيرات لهذا المنتج
                      </span>
                    ) : (
                      <div className="flex flex-col gap-2 py-1">
                        {variantGroups.map((group) => (
                          <div key={group.id} className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-500 min-w-14">
                              {group.name}:
                            </span>
                            {group.options.map((option) => {
                              const isSelected = selected.includes(option.id);
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => toggle(option.id)}
                                  className={
                                    isSelected
                                      ? 'rounded-full text-xs px-3 py-1 bg-primary text-white font-medium'
                                      : 'rounded-full text-xs px-3 py-1 border border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                                  }
                                >
                                  {option.name}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                        {selected.length > 0 && (
                          <button
                            type="button"
                            onClick={() => field.onChange([])}
                            className="self-start text-xs text-red-600 hover:underline"
                          >
                            مسح كل المتغيرات ({selected.length})
                          </button>
                        )}
                      </div>
                    )}
                  </FilterChip>
                );
              }}
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
                        setValue('city', '');
                      }
                    }}
                    onBlur={field.onBlur}
                    options={governorates}
                    placeholder={label}
                    widthClass="w-full"
                    error={errors.governorate?.message}
                    clearable
                  />
                </FilterChip>
              )}
            />
          );
        }
        if (key === 'city') {
          return (
            <Controller
              key={key}
              name="city"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={cities}
                    placeholder={isLoadingCities ? "جاري التحميل..." : label}
                    widthClass="w-full"
                    error={errors.city?.message}
                    disabled={!selectedGovernorate || isLoadingCities}
                    clearable
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
                    clearable
                  />
                </FilterChip>
              )}
            />
          );
        }
        if (key === 'storeId') {
          return (
            <Controller
              key={key}
              name="storeId"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={storeOptions}
                    placeholder={isLoadingStores ? "جاري التحميل..." : label}
                    widthClass="w-full"
                    loading={isLoadingStores}
                    clearable
                  />
                </FilterChip>
              )}
            />
          );
        }
        if (key === 'shippingCompany') {
          return (
            <Controller
              key={key}
              name="shippingCompany"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={shippingCompanies}
                    placeholder={isLoadingShippingCompanies ? "جاري التحميل..." : label}
                    widthClass="w-full"
                    loading={isLoadingShippingCompanies}
                    clearable
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
                    clearable
                  />
                </FilterChip>
              )}
            />
          );
        }
        return null;

      case 'multiselect':
        if (key === 'cancellationReasons') {
          return (
            <Controller
              key={key}
              name="cancellationReasons"
              control={control}
              render={({ field }) => (
                <FilterChip filterKey={key} label={label} onRemove={onRemoveFilter}>
                  <MultiSelectDropdown
                    value={Array.isArray(field.value) ? field.value : []}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={cancellationReasonOptions}
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
