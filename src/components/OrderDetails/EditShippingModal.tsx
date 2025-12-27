import React, { useState, useEffect, useMemo } from 'react';
import { LiaTimesSolid, LiaCheckSolid } from 'react-icons/lia';
import { Button } from '../ui/button';
import { getShippingGovernorates, getShippingCities } from '@/lib/api/lookups';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useShippingCompanies } from '@/hooks';

interface EditShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ShippingData) => Promise<void>;
  initialData: ShippingData;
}

export interface ShippingData {
  shippingCompany?: string;
  governorate?: string;
  city?: string;
  address?: string;
  externalGovernorate?: string;
}

interface LocationOption {
  key: string;
  label: string;
}

export default function EditShippingModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditShippingModalProps) {
  const [formData, setFormData] = useState<ShippingData>(initialData);
  const [governorates, setGovernorates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [loadingGovernorates, setLoadingGovernorates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [selectedShippingCompanyKey, setSelectedShippingCompanyKey] = useState<string>('');
  const [selectedGovernorateKey, setSelectedGovernorateKey] = useState<string>('');

  const { shippingCompanies, isLoading: loadingShippingCompanies } = useShippingCompanies(isOpen);

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

  const cityOptions = useMemo(
    () => cities.map((city) => city.label),
    [cities]
  );

  const hasChanges = useMemo(() => {
    return (
      formData.shippingCompany !== initialData.shippingCompany ||
      formData.governorate !== initialData.governorate ||
      formData.city !== initialData.city ||
      formData.address !== initialData.address
    );
  }, [formData, initialData]);

  useEffect(() => {
    const fetchGovernorates = async () => {
      if (!selectedShippingCompanyKey) {
        setGovernorates([]);
        return;
      }

      try {
        setLoadingGovernorates(true);
        const data = await getShippingGovernorates(selectedShippingCompanyKey) as LocationOption[];
        setGovernorates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load governorates:', error);
        setGovernorates([]);
      } finally {
        setLoadingGovernorates(false);
      }
    };

    fetchGovernorates();
  }, [selectedShippingCompanyKey]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedShippingCompanyKey || !selectedGovernorateKey) {
        setCities([]);
        return;
      }

      try {
        setLoadingCities(true);
        const data = await getShippingCities(
          selectedShippingCompanyKey,
          selectedGovernorateKey
        ) as LocationOption[];
        setCities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load cities:', error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedShippingCompanyKey, selectedGovernorateKey]);

  const wasOpenRef = React.useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setFormData(initialData);
      if (initialData.shippingCompany) {
        setSelectedShippingCompanyKey(initialData.shippingCompany);
      } else {
        setSelectedShippingCompanyKey('');
      }
      setSelectedGovernorateKey('');
      setGovernorates([]);
      setCities([]);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialData]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleShippingCompanyChange = (label: string) => {
    const key = shippingCompanyReverseMap[label] || '';
    setSelectedShippingCompanyKey(key);
    setSelectedGovernorateKey('');
    setFormData({
      ...formData,
      shippingCompany: key,
      governorate: '',
      city: '',
    });
  };

  const handleGovernorateChange = (label: string) => {
    const key = governorateLabelToKey[label] || '';
    setSelectedGovernorateKey(key);
    setFormData({
      ...formData,
      governorate: label,
      city: '',
    });
  };

  const handleCityChange = (label: string) => {
    setFormData({
      ...formData,
      city: label,
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
                value={selectedShippingCompanyKey ? shippingCompanyMap[selectedShippingCompanyKey] || '' : ''}
                onValueChange={handleShippingCompanyChange}
                options={shippingCompanyOptions}
                placeholder="اختر الشركة"
                searchPlaceholder="بحث عن شركة..."
                emptyMessage="لا توجد شركات متاحة"
                noResultsMessage="لا توجد نتائج للبحث"
                triggerClassName="w-full border-[#CED4DA] rounded-lg h-12"
                searchThreshold={5}
                loading={loadingShippingCompanies}
              />
            </div>

            {/* Governorate Field */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[#1F1F1F]">المحافظة</label>
              <SearchableSelect
                value={formData.governorate || ''}
                onValueChange={handleGovernorateChange}
                options={governorateOptions}
                placeholder={
                  !selectedShippingCompanyKey
                    ? 'اختر الشركة أولاً'
                    : initialData.governorate || initialData.externalGovernorate || 'اختر المحافظة'
                }
                searchPlaceholder="بحث عن محافظة..."
                emptyMessage={
                  !selectedShippingCompanyKey
                    ? 'اختر الشركة أولاً'
                    : 'لا توجد محافظات متاحة'
                }
                noResultsMessage="لا توجد نتائج للبحث"
                triggerClassName="w-full border-[#CED4DA] rounded-lg h-12"
                loading={loadingGovernorates}
                disabled={!selectedShippingCompanyKey}
                searchThreshold={5}
              />
            </div>

            {/* Area/City Field */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[#1F1F1F]">المنطقة</label>
              <SearchableSelect
                value={formData.city || ''}
                onValueChange={handleCityChange}
                options={cityOptions}
                placeholder={
                  !selectedShippingCompanyKey
                    ? 'اختر الشركة أولاً'
                    : !selectedGovernorateKey
                    ? 'اختر المحافظة أولاً'
                    : 'اختر المنطقة'
                }
                searchPlaceholder="بحث عن منطقة..."
                emptyMessage={
                  !selectedShippingCompanyKey
                    ? 'اختر الشركة أولاً'
                    : !selectedGovernorateKey
                    ? 'اختر المحافظة أولاً'
                    : 'لا توجد مناطق متاحة'
                }
                noResultsMessage="لا توجد نتائج للبحث"
                triggerClassName="w-full border-[#CED4DA] rounded-lg h-12"
                loading={loadingCities}
                disabled={!selectedShippingCompanyKey || !selectedGovernorateKey}
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
              disabled={!hasChanges || isSaving}
              className="w-[146px] h-[37px] bg-[#5D24E1] border-[1.5px] border-[#5D24E1] rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="text-lg font-bold text-white">جاري الحفظ...</span>
              ) : (
                <>
                  <LiaCheckSolid className="w-5 h-5 text-white" />
                  <span className="text-lg font-bold text-white">حفظ</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
