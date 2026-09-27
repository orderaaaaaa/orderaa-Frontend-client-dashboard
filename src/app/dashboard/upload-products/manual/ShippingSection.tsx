'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import Input from '@/components/ui/Input';
import { getShippingTypes } from '@/lib/api/lookups';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import useShippingCompanies from '@/hooks/useShippingCompanies';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  useLocationOptionCities,
  useLocationOptionGovernorates,
} from '@/services/lookups';
import {
  locationOptionsErrorTextOf,
  locationSelectOptionsOf,
} from '@/types/locationOptions';
import { ShippingSectionProps } from './types';

function ShippingSection({
  shippingCompany,
  governorateOption,
  cityOption,
  shippingCost,
  returnShippingCost,
  shippingType,
  returnShipmentContent,
  onShippingCompanyChange,
  onGovernorateOptionChange,
  onCityOptionChange,
  onShippingCostChange,
  onReturnShippingCostChange,
  onShippingTypeChange,
  onReturnShipmentContentChange,
  errors,
}: ShippingSectionProps) {
  const { shippingCompanies, isLoading: loadingShippingCompanies } =
    useShippingCompanies(true);
  const canReadCanonicalNames = useHasPermission(PERMISSION_CODES.CANONICAL_NAMES_READ);

  const governoratesQuery = useLocationOptionGovernorates(shippingCompany || undefined);
  const citiesQuery = useLocationOptionCities(
    shippingCompany || undefined,
    governorateOption || undefined
  );
  const noGovernorateList = governoratesQuery.data?.sourceHasRows === false;

  const { data: shippingTypes = [], isLoading: loadingShippingTypes } = useQuery<
    { key: string; label: string }[]
  >({
    queryKey: [QUERY_KEYS.SHIPPING_TYPES],
    queryFn: getShippingTypes,
    staleTime: Infinity,
  });

  const shippingTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    shippingTypes.forEach((t) => {
      map[t.key] = t.label;
    });
    return map;
  }, [shippingTypes]);

  const shippingTypeReverseMap = useMemo(() => {
    const map: Record<string, string> = {};
    shippingTypes.forEach((t) => {
      map[t.label] = t.key;
    });
    return map;
  }, [shippingTypes]);

  const shippingTypeOptions = useMemo(
    () => shippingTypes.map((t) => t.label),
    [shippingTypes]
  );

  const requiresReturnContent = ['PARTIAL_RETURN', 'EXCHANGE', 'RETURN'].includes(shippingType);

  const shippingCompanyMap = useMemo(() => {
    const map: Record<string, string> = {};
    shippingCompanies.forEach((company) => {
      map[company.key] = company.label;
    });
    return map;
  }, [shippingCompanies]);

  const shippingCompanyReverseMap = useMemo(() => {
    const map: Record<string, string> = {};
    shippingCompanies.forEach((company) => {
      map[company.label] = company.key;
    });
    return map;
  }, [shippingCompanies]);

  const shippingCompanyOptions = useMemo(
    () => shippingCompanies.map((company) => company.label),
    [shippingCompanies]
  );

  const governorateOptions = useMemo(
    () => locationSelectOptionsOf(governoratesQuery.data?.options ?? []),
    [governoratesQuery.data]
  );

  const cityOptions = useMemo(
    () => locationSelectOptionsOf(citiesQuery.data?.options ?? []),
    [citiesQuery.data]
  );

  const handleShippingCompanyChange = (label: string) => {
    const key = shippingCompanyReverseMap[label] || '';
    if (key === shippingCompany) return;
    onShippingCompanyChange(key);
    onGovernorateOptionChange('');
    onCityOptionChange('');
  };

  const handleGovernorateChange = (value: string) => {
    if (value === governorateOption) return;
    onGovernorateOptionChange(value);
    onCityOptionChange('');
  };

  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">الشحن</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col gap-2" data-field-error="shippingCompany">
            <label className="font-medium text-[16px]">
              شركة الشحن <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={shippingCompany ? shippingCompanyMap[shippingCompany] || '' : ''}
              onValueChange={handleShippingCompanyChange}
              options={shippingCompanyOptions}
              placeholder="اختر شركة الشحن"
              searchPlaceholder="بحث عن شركة..."
              emptyMessage="لا توجد شركات متاحة"
              noResultsMessage="لا توجد نتائج للبحث"
              triggerClassName={`w-full rounded-lg h-12 ${errors?.shippingCompany ? 'border-red-500' : 'border-[#CED4DA]'}`}
              searchThreshold={5}
              loading={loadingShippingCompanies}
            />
            {errors?.shippingCompany && (
              <p className="text-red-500 text-sm">{errors.shippingCompany}</p>
            )}
          </div>

          <div className="flex flex-col gap-2" data-field-error="governorate">
            <label className="font-medium text-[16px]">
              المحافظة <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={governorateOption}
              onValueChange={handleGovernorateChange}
              options={governorateOptions}
              placeholder={
                !shippingCompany ? 'اختر شركة الشحن أولاً' : 'اختر المحافظة'
              }
              searchPlaceholder="بحث عن محافظة..."
              emptyMessage={
                !shippingCompany
                  ? 'اختر شركة الشحن أولاً'
                  : noGovernorateList
                    ? 'لا توجد قائمة محافظات لهذه الشركة بعد'
                    : 'لا توجد محافظات متاحة'
              }
              noResultsMessage="لا توجد نتائج للبحث"
              triggerClassName={`w-full rounded-lg h-12 ${errors?.governorateOption ? 'border-red-500' : 'border-[#CED4DA]'}`}
              loading={governoratesQuery.isLoading}
              disabled={!shippingCompany || noGovernorateList || governoratesQuery.isError}
              searchThreshold={5}
            />
            {noGovernorateList && (
              <p className="text-xs text-gray-500">
                لا توجد قائمة محافظات لهذه الشركة بعد
                {canReadCanonicalNames && (
                  <>
                    {' '}
                    <Link
                      href="/dashboard/canonical-names/governorates"
                      className="text-primary underline"
                    >
                      المحافظات الموحدة
                    </Link>
                  </>
                )}
              </p>
            )}
            {governoratesQuery.isError && (
              <p className="text-xs text-red-500">
                {locationOptionsErrorTextOf(governoratesQuery.error, 'تعذر تحميل المحافظات')}
              </p>
            )}
            {errors?.governorateOption && (
              <p className="text-red-500 text-sm">{errors.governorateOption}</p>
            )}
          </div>

          <div className="flex flex-col gap-2" data-field-error="city">
            <label className="font-medium text-[16px]">
              المدينة <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={cityOption}
              onValueChange={onCityOptionChange}
              options={cityOptions}
              placeholder={
                !shippingCompany
                  ? 'اختر شركة الشحن أولاً'
                  : !governorateOption
                    ? 'اختر المحافظة أولاً'
                    : 'اختر المدينة'
              }
              searchPlaceholder="بحث عن مدينة..."
              emptyMessage={
                !shippingCompany
                  ? 'اختر شركة الشحن أولاً'
                  : !governorateOption
                    ? 'اختر المحافظة أولاً'
                    : 'لا توجد مدن متاحة'
              }
              noResultsMessage="لا توجد نتائج للبحث"
              triggerClassName={`w-full rounded-lg h-12 ${errors?.cityOption ? 'border-red-500' : 'border-[#CED4DA]'}`}
              loading={citiesQuery.isLoading}
              disabled={!shippingCompany || !governorateOption}
              searchThreshold={5}
            />
            {citiesQuery.isError && (
              <p className="text-xs text-red-500">
                {locationOptionsErrorTextOf(citiesQuery.error, 'تعذر تحميل المدن')}
              </p>
            )}
            {errors?.cityOption && (
              <p className="text-red-500 text-sm">{errors.cityOption}</p>
            )}
          </div>
          <div>
            <label className="block font-medium text-[16px] mb-1">
              تكلفة الشحن
            </label>
            <Input
              name="shippingCost"
              type="number"
              placeholder="أدخل تكلفة الشحن"
              className="w-full"
              inputClassName="bg-white"
              value={shippingCost}
              onChange={(e) => onShippingCostChange(e.target.value)}
              error={errors?.shippingCost}
            />
          </div>
          <div>
            <label className="block font-medium text-[16px] mb-1">
              مبلغ الإلغاء فى حالة عدم الإستلام <span className="text-red-500">*</span>
            </label>
            <Input
              name="returnShippingCost"
              type="number"
              placeholder="أدخل مبلغ الإلغاء..."
              className="w-full"
              inputClassName="bg-white"
              min={0}
              value={returnShippingCost}
              onChange={(e) => onReturnShippingCostChange(e.target.value)}
              error={errors?.returnShippingCost}
            />
          </div>

          <div className="flex flex-col gap-2" data-field-error="shippingType">
            <label className="font-medium text-[16px]">
              نوع الشحنة <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={shippingType ? shippingTypeMap[shippingType] || '' : ''}
              onValueChange={(label) => {
                const key = shippingTypeReverseMap[label] || '';
                onShippingTypeChange(key);
                if (!['PARTIAL_RETURN', 'EXCHANGE', 'RETURN'].includes(key)) {
                  onReturnShipmentContentChange('');
                }
              }}
              options={shippingTypeOptions}
              placeholder="اختر نوع الشحنة"
              searchPlaceholder="بحث عن نوع..."
              emptyMessage="لا توجد أنواع متاحة"
              noResultsMessage="لا توجد نتائج للبحث"
              triggerClassName={`w-full rounded-lg h-12 ${errors?.shippingType ? 'border-red-500' : 'border-[#CED4DA]'}`}
              searchThreshold={5}
              loading={loadingShippingTypes}
            />
            {errors?.shippingType && (
              <p className="text-red-500 text-sm">{errors.shippingType}</p>
            )}
          </div>

          {requiresReturnContent && (
            <div className="flex flex-col gap-2" data-field-error="returnShipmentContent">
              <label className="font-medium text-[16px]">
                محتوى شحنة الاسترجاع <span className="text-red-500">*</span>
              </label>
              <Input
                name="returnShipmentContent"
                placeholder="أدخل محتوى شحنة الاسترجاع"
                className="w-full"
                inputClassName="bg-white"
                value={returnShipmentContent}
                onChange={(e) => onReturnShipmentContentChange(e.target.value)}
                error={errors?.returnShipmentContent}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShippingSection;
