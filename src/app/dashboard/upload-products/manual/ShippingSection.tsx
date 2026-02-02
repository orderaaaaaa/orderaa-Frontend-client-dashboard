'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import Input from '@/components/ui/Input';
import { getShippingGovernorates, getShippingCities } from '@/lib/api/lookups';
import useShippingCompanies from '@/hooks/useShippingCompanies';
import { ShippingSectionProps } from './types';

interface LocationOption {
  key: string;
  label: string;
}

function ShippingSection({
  shippingCompany,
  governorate,
  city,
  shippingCost,
  onShippingCompanyChange,
  onGovernorateChange,
  onCityChange,
  onShippingCostChange,
  errors,
}: ShippingSectionProps) {
  const [governorates, setGovernorates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [loadingGovernorates, setLoadingGovernorates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedGovernorateKey, setSelectedGovernorateKey] = useState('');

  const { shippingCompanies, isLoading: loadingShippingCompanies } =
    useShippingCompanies(true);

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

  const governorateLabelToKey = useMemo(() => {
    const map: Record<string, string> = {};
    governorates.forEach((gov) => {
      map[gov.label] = gov.key;
    });
    return map;
  }, [governorates]);

  const governorateOptions = useMemo(
    () => governorates.map((gov) => gov.label),
    [governorates]
  );

  const cityOptions = useMemo(() => cities.map((c) => c.label), [cities]);

  useEffect(() => {
    const fetchGovernorates = async () => {
      if (!shippingCompany) {
        setGovernorates([]);
        return;
      }

      try {
        setLoadingGovernorates(true);
        const data = (await getShippingGovernorates(
          shippingCompany
        )) as LocationOption[];
        setGovernorates(Array.isArray(data) ? data : []);
      } catch (error) {
        setGovernorates([]);
      } finally {
        setLoadingGovernorates(false);
      }
    };

    fetchGovernorates();
  }, [shippingCompany]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!shippingCompany || !selectedGovernorateKey) {
        setCities([]);
        return;
      }

      try {
        setLoadingCities(true);
        const data = (await getShippingCities(
          shippingCompany,
          selectedGovernorateKey
        )) as LocationOption[];
        setCities(Array.isArray(data) ? data : []);
      } catch (error) {
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [shippingCompany, selectedGovernorateKey]);

  const handleShippingCompanyChange = (label: string) => {
    const key = shippingCompanyReverseMap[label] || '';
    onShippingCompanyChange(key);
    onGovernorateChange('');
    onCityChange('');
    setSelectedGovernorateKey('');
  };

  const handleGovernorateChange = (label: string) => {
    const key = governorateLabelToKey[label] || '';
    setSelectedGovernorateKey(key);
    onGovernorateChange(key);
    onCityChange('');
  };

  const handleCityChange = (label: string) => {
    const cityItem = cities.find((c) => c.label === label);
    onCityChange(cityItem?.key || '');
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
              value={
                governorate
                  ? governorates.find((g) => g.key === governorate)?.label || ''
                  : ''
              }
              onValueChange={handleGovernorateChange}
              options={governorateOptions}
              placeholder={
                !shippingCompany ? 'اختر شركة الشحن أولاً' : 'اختر المحافظة'
              }
              searchPlaceholder="بحث عن محافظة..."
              emptyMessage={
                !shippingCompany
                  ? 'اختر شركة الشحن أولاً'
                  : 'لا توجد محافظات متاحة'
              }
              noResultsMessage="لا توجد نتائج للبحث"
              triggerClassName={`w-full rounded-lg h-12 ${errors?.governorate ? 'border-red-500' : 'border-[#CED4DA]'}`}
              loading={loadingGovernorates}
              disabled={!shippingCompany}
              searchThreshold={5}
            />
            {errors?.governorate && (
              <p className="text-red-500 text-sm">{errors.governorate}</p>
            )}
          </div>

          <div className="flex flex-col gap-2" data-field-error="city">
            <label className="font-medium text-[16px]">
              المدينة <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={
                city ? cities.find((c) => c.key === city)?.label || '' : ''
              }
              onValueChange={handleCityChange}
              options={cityOptions}
              placeholder={
                !shippingCompany
                  ? 'اختر شركة الشحن أولاً'
                  : !selectedGovernorateKey
                    ? 'اختر المحافظة أولاً'
                    : 'اختر المدينة'
              }
              searchPlaceholder="بحث عن مدينة..."
              emptyMessage={
                !shippingCompany
                  ? 'اختر شركة الشحن أولاً'
                  : !selectedGovernorateKey
                    ? 'اختر المحافظة أولاً'
                    : 'لا توجد مدن متاحة'
              }
              noResultsMessage="لا توجد نتائج للبحث"
              triggerClassName={`w-full rounded-lg h-12 ${errors?.city ? 'border-red-500' : 'border-[#CED4DA]'}`}
              loading={loadingCities}
              disabled={!shippingCompany || !selectedGovernorateKey}
              searchThreshold={5}
            />
            {errors?.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
          </div>
          <div>
            <label className="block font-medium text-[16px] mb-1">
              تكلفة الشحن <span className="text-red-500">*</span>
            </label>
            <Input
              name="shippingCost"
              type="number"
              placeholder="أدخل تكلفة الشحن"
              className="w-full"
              value={shippingCost}
              onChange={(e) => onShippingCostChange(e.target.value)}
              error={errors?.shippingCost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingSection;
