"use client";

import React, { useState, useEffect } from "react";
import { Control, Controller, FieldErrors, useWatch, UseFormSetValue } from "react-hook-form";
import { OrderFiltersFormData } from "@/schemas/orderFilters.schema";
import { FilterOptions } from "@/types/orders";
import SearchableSelect from "./SearchableSelect";
import { DatePicker } from "@/components/ui/datepicker";
import { getGovernorates, getCities } from "@/lib/api/lookups";

interface GovernorateData {
    key: string;
    value: string;
}

interface CityData {
    key: string;
    value: string;
}

type Props = {
    control: Control<OrderFiltersFormData>;
    errors: FieldErrors<OrderFiltersFormData>;
    options: FilterOptions;
    setValue?: UseFormSetValue<OrderFiltersFormData>;
};

export default function FilterPanel({ control, errors, options, setValue }: Props) {
    const [governorates, setGovernorates] = useState<GovernorateData[]>([]);
    const [cities, setCities] = useState<CityData[]>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    // Watch governorate field value
    const selectedGovernorate = useWatch({
        control,
        name: "governorate",
    });

    // Fetch governorates on mount
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

    // Fetch cities when governorate changes
    useEffect(() => {
        const fetchCities = async () => {
            if (!selectedGovernorate) {
                setCities([]);
                return;
            }

            // Find the governorate key from the selected value
            const governorate = governorates.find(
                (g) => g.value === selectedGovernorate
            );
            if (!governorate) {
                setCities([]);
                return;
            }

            setIsLoadingCities(true);
            try {
                const data = await getCities(governorate.key);
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

    // Get governorate values for the dropdown
    const governorateOptions = governorates.map((g) => g.value);
    // Get city values for the dropdown
    const cityOptions = cities.map((c) => c.value);
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    return (
        <div
            className=" grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 backdrop-blur-md p-4 will-change-transform transform-gpu"
            onKeyDown={handleKeyDown}
        >
            {/* كود الشحنة */}
            <Controller
                name="shipmentCode"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-col gap-1 text-base font-medium">
                        <textarea
                            {...field}
                            placeholder="كود الشحنة"
                            rows={1}
                            className={`sm:max-w-62 px-3 py-2 rounded border bg-white resize-none ${errors.shipmentCode ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.shipmentCode && (
                            <span className="text-xs text-red-500">{errors.shipmentCode.message}</span>
                        )}
                    </div>
                )}
            />

            {/* اسم العميل */}
            <Controller
                name="customerName"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-col gap-1 font-medium">
                        <input
                            {...field}
                            type="text"
                            placeholder="اسم العميل"
                            className={`sm:max-w-62 px-3 py-2 rounded border bg-white ${errors.customerName ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.customerName && (
                            <span className="text-xs text-red-500">{errors.customerName.message}</span>
                        )}
                    </div>
                )}
            />

            {/* رقم الهاتف */}
            <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-col gap-1 font-medium">
                        <input
                            {...field}
                            type="text"
                            placeholder="رقم الهاتف"
                            className={`sm:max-w-62 px-3 py-2 rounded border bg-white ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.phone && (
                            <span className="text-xs text-red-500">{errors.phone.message}</span>
                        )}
                    </div>
                )}
            />

            {/* تاريخ التنفيذ */}
            <Controller
                name="executionDate"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-col gap-1 font-medium">
                        <DatePicker
                            selected={field.value ? new Date(field.value) : null}
                            onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                            placeholder="تاريخ التنفيذ"
                            className="sm:max-w-62 border border-gray-300 rounded bg-white"
                            isClearable
                        />
                        {errors.executionDate && (
                            <span className="text-xs text-red-500">{errors.executionDate.message}</span>
                        )}
                    </div>
                )}
            />

            {/* اسم الموظف - Placeholder field */}
            <div className="flex flex-col gap-1 font-medium">
                <input
                    type="text"
                    placeholder="اسم الموظف"
                    className="sm:max-w-62 px-3 py-2 rounded border border-gray-300 bg-white"
                    disabled
                />
            </div>

            {/* اسم الحملة */}
            <Controller
                name="productName"
                control={control}
                render={({ field }) => (
                    <SearchableSelect
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        options={options.productOptions}
                        placeholder="اسم الحملة"
                        widthClass="sm:max-w-62"
                        error={errors.productName?.message}
                    />
                )}
            />

            {/* المحافظة */}
            <Controller
                name="governorate"
                control={control}
                render={({ field }) => (
                    <SearchableSelect
                        value={field.value || ''}
                        onChange={(value) => {
                            field.onChange(value);
                            // Clear area when governorate changes
                            if (setValue) {
                                setValue('area', '');
                            }
                        }}
                        onBlur={field.onBlur}
                        options={governorateOptions}
                        placeholder="المحافظة"
                        widthClass="sm:max-w-62"
                        error={errors.governorate?.message}
                    />
                )}
            />

            {/* المنطقة */}
            <Controller
                name="area"
                control={control}
                render={({ field }) => (
                    <SearchableSelect
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        options={cityOptions}
                        placeholder={isLoadingCities ? "جاري التحميل..." : "المنطقة"}
                        widthClass="sm:max-w-62"
                        error={errors.area?.message}
                        disabled={!selectedGovernorate || isLoadingCities}
                    />
                )}
            />

            {/* المصدر */}
            <Controller
                name="sizeColor"
                control={control}
                render={({ field }) => (
                    <SearchableSelect
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        options={options.sizeColorOptions}
                        placeholder="المصدر"
                        widthClass="sm:max-w-62"
                        error={errors.sizeColor?.message}
                    />
                )}
            />

            {/* العنوان */}
            <Controller
                name="address"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-col gap-1 font-medium">
                        <input
                            {...field}
                            type="text"
                            placeholder="العنوان"
                            className={`sm:max-w-62 px-3 py-2 rounded border bg-white ${errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.address && (
                            <span className="text-xs text-red-500">{errors.address.message}</span>
                        )}
                    </div>
                )}
            />

            {/* الاحدث - Placeholder */}
            <Controller
                name="sizeColor"
                control={control}
                render={({ field }) => (
                    <SearchableSelect
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        options={options.sizeColorOptions}
                        placeholder="الاحدث"
                        widthClass="sm:max-w-62"
                    />
                )}
            />

            {/* الجديد - Placeholder */}
            <Controller
                name="sizeColor"
                control={control}
                render={({ field }) => (
                    <SearchableSelect
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        options={options.sizeColorOptions}
                        placeholder="الجديد"
                        widthClass="sm:max-w-62"
                    />
                )}
            />
        </div>
    );
}

