import React, { useState, useEffect, useMemo } from 'react';
import { LiaTimesSolid, LiaCheckSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { getGovernorates, getCities } from '@/lib/api/lookups';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface EditShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ShippingData) => void;
  initialData: ShippingData;
}

export interface ShippingData {
  shippingCompany?: string;
  governorate?: string;
  city?: string;
  address?: string;
}

interface Governorate {
  key: string;
  value: string;
}

interface City {
  key: string;
  value: string;
}

const shippingCompanyOptions = ['ارامبكس', 'فيدكس', 'DHL', 'شركة أخرى'];

export default function EditShippingModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditShippingModalProps) {
  const [formData, setFormData] = useState<ShippingData>(initialData);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingGovernorates, setLoadingGovernorates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<string>('');

  // Convert governorates to string array for SearchableSelect
  const governorateOptions = useMemo(
    () => governorates.map((gov) => gov.value),
    [governorates]
  );

  // Convert cities to string array for SearchableSelect
  const cityOptions = useMemo(
    () => cities.map((city) => city.value),
    [cities]
  );

  // Check if any value has changed
  const hasChanges = useMemo(() => {
    return (
      formData.shippingCompany !== initialData.shippingCompany ||
      formData.governorate !== initialData.governorate ||
      formData.city !== initialData.city ||
      formData.address !== initialData.address
    );
  }, [formData, initialData]);

  // Load governorates on mount
  useEffect(() => {
    const fetchGovernorates = async () => {
      try {
        setLoadingGovernorates(true);
        const data = await getGovernorates();
        setGovernorates(data as Governorate[]);
      } catch (error) {
        console.error('Failed to load governorates:', error);
      } finally {
        setLoadingGovernorates(false);
      }
    };

    if (isOpen) {
      fetchGovernorates();
    }
  }, [isOpen]);

  // Load cities when governorate changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedGovernorateId) {
        setCities([]);
        return;
      }

      try {
        setLoadingCities(true);
        const data = await getCities(selectedGovernorateId);
        setCities(data as City[]);
      } catch (error) {
        console.error('Failed to load cities:', error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedGovernorateId]);

  // Update form data when initial data changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSave = () => {
    if (!hasChanges) return;
    onSave(formData);
    toast.success('تم تعديل بيانات الشحن بنجاح');
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleGovernorateChange = (value: string) => {
    const governorate = governorates.find((g) => g.value === value);
    setSelectedGovernorateId(governorate?.key || '');
    setFormData({
      ...formData,
      governorate: value,
      city: '', // Reset city when governorate changes
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-[#F3ECFF] to-[#E8D9FF] px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-[#1F1F1F]">تعديل بيانات الشحن</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <LiaTimesSolid className="w-6 h-6 text-[#1F1F1F] cursor-pointer" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Company Field */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[#1F1F1F]">الشركة</label>
              <SearchableSelect
                value={formData.shippingCompany}
                onValueChange={(value) =>
                  setFormData({ ...formData, shippingCompany: value })
                }
                options={shippingCompanyOptions}
                placeholder="اختر الشركة"
                searchPlaceholder="بحث عن شركة..."
                emptyMessage="لا توجد شركات متاحة"
                noResultsMessage="لا توجد نتائج للبحث"
                triggerClassName="w-full border-[#CED4DA] rounded-lg h-12"
                searchThreshold={5}
              />
            </div>

            {/* Governorate Field */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[#1F1F1F]">المحافظة</label>
              <SearchableSelect
                value={formData.governorate}
                onValueChange={handleGovernorateChange}
                options={governorateOptions}
                placeholder="اختر المحافظة"
                searchPlaceholder="بحث عن محافظة..."
                emptyMessage="لا توجد محافظات متاحة"
                noResultsMessage="لا توجد نتائج للبحث"
                triggerClassName="w-full border-[#CED4DA] rounded-lg h-12"
                loading={loadingGovernorates}
                searchThreshold={5}
              />
            </div>

            {/* Area/City Field */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[#1F1F1F]">المنطقة</label>
              <SearchableSelect
                value={formData.city}
                onValueChange={(value) =>
                  setFormData({ ...formData, city: value })
                }
                options={cityOptions}
                placeholder={
                  !selectedGovernorateId ? 'اختر المحافظة أولاً' : 'اختر المنطقة'
                }
                searchPlaceholder="بحث عن منطقة..."
                emptyMessage={
                  !selectedGovernorateId
                    ? 'اختر المحافظة أولاً'
                    : 'لا توجد مناطق متاحة'
                }
                noResultsMessage="لا توجد نتائج للبحث"
                triggerClassName="w-full border-[#CED4DA] rounded-lg h-12"
                loading={loadingCities}
                disabled={!selectedGovernorateId}
                searchThreshold={5}
              />
            </div>
          </div>

          {/* Address Field */}
          <div className="flex flex-col gap-2 mb-8">
            <label className="font-bold text-[#1F1F1F]">العنوان بالتفصيل</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full border border-[#CED4DA] rounded-lg p-3 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
              placeholder="أدخل العنوان بالتفصيل..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-[146px] h-[37px] border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <LiaTimesSolid className="w-5 h-5 text-[#5F5E5E]" />
              <span className="text-lg font-bold text-[#5F5E5E]">إلغاء</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="w-[146px] h-[37px] bg-[#5D24E1] border-[1.5px] border-[#5D24E1] rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LiaCheckSolid className="w-5 h-5 text-white" />
              <span className="text-lg font-bold text-white">حفظ</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
