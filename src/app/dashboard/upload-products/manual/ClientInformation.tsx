import React, { useCallback } from 'react';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { useGovernoratesQuery, useCitiesQuery } from '@/services/lookups';
import { ClientInformationProps } from './types';

function ClientInformation({
  customerName,
  phoneNumber,
  governorate,
  area,
  address,
  notes,
  onCustomerNameChange,
  onPhoneNumberChange,
  onGovernorateChange,
  onAreaChange,
  onAddressChange,
  onNotesChange,
  errors,
}: ClientInformationProps) {
  const { data: governorateOptions = [] } = useGovernoratesQuery();
  const { data: areaOptions = [], isLoading: isLoadingAreas } =
    useCitiesQuery(governorate);

  const handleGovernorateChange = useCallback(
    (value: string) => {
      if (typeof onGovernorateChange === 'function') {
        onGovernorateChange(value);
      }
      if (value !== governorate && typeof onAreaChange === 'function') {
        onAreaChange('');
      }
    },
    [governorate, onGovernorateChange, onAreaChange]
  );

  // Handle area change
  const handleAreaChange = useCallback(
    (value: string) => {
      if (typeof onAreaChange === 'function') {
        onAreaChange(value);
      }
    },
    [onAreaChange]
  );

  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">معلومات العميل</h1>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-8">
          {/* username */}
          <div data-field-error="customerName">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                اسم العميل <span className="text-red-500">*</span>
              </label>
            </div>
            <Input
              name="customerName"
              type="text"
              placeholder="أدخل الاسم الكامل للعميل"
              className="max-w-[502px]"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              error={errors?.customerName}
            />
          </div>
          {/*  phone */}
          <div data-field-error="phoneNumber">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
            </div>
            <Input
              name="phoneNumber"
              type="text"
              placeholder="أدخل رقم الهاتف"
              className="max-w-[502px]"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
              error={errors?.phoneNumber}
            />
          </div>
          {/* choose gov */}
          <div className="max-w-[502px]" data-field-error="governorate">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                اختر المحافظة <span className="text-red-500">*</span>
              </label>
            </div>
            <SearchableSelect
              value={governorate}
              onChange={handleGovernorateChange}
              options={governorateOptions}
              placeholder="اختر المحافظة"
              widthClass="w-full"
              error={errors?.governorate}
              triggerClassName={`border w-full bg-[#EAEAEA40] px-3 py-3 rounded-sm ${
                errors?.governorate ? 'border-red-500' : 'border-primary'
              }`}
            />
          </div>
          {/* choose area */}
          <div className="max-w-[502px]" data-field-error="area">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                منطقة <span className="text-red-500">*</span>
              </label>
            </div>
            <SearchableSelect
              value={area}
              onChange={handleAreaChange}
              options={areaOptions}
              placeholder={
                !governorate
                  ? 'اختر المحافظة أولاً'
                  : isLoadingAreas
                  ? 'جاري التحميل...'
                  : 'اختر المنطقة'
              }
              widthClass="w-full"
              disabled={!governorate || isLoadingAreas}
              loading={isLoadingAreas}
              error={errors?.area}
              triggerClassName={`border w-full bg-[#EAEAEA40] px-3 py-3 rounded-sm ${
                errors?.area ? 'border-red-500' : 'border-primary'
              }`}
            />
          </div>
        </div>
        <div className="flex flex-col gap-10 mt-7">
          <div data-field-error="address">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                العنوان <span className="text-red-500">*</span>
              </label>
            </div>
            <Textarea
              name="address"
              placeholder="اسم الشارع، رقم المبنى، الشقة، إلخ"
              className="max-w-[1158px] h-[162px] bg-[#EAEAEA40]"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              error={errors?.address}
            />
          </div>
          <div data-field-error="notes">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                ملاحظات العميل
              </label>
            </div>
            <Textarea
              name="notes"
              placeholder="اسم الشارع، رقم المبنى، الشقة، إلخ"
              className="max-w-[1158px] h-[162px] bg-[#EAEAEA40] mb-10"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              error={errors?.notes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientInformation;
