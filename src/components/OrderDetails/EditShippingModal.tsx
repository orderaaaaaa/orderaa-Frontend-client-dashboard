import React, { useState, useEffect, useMemo } from 'react';
import { LiaCheckSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { getShippingGovernorates, getShippingCities } from '@/lib/api/lookups';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
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
  externalGovernorate?: string | null;
  returnShippingCost?: number;
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
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

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
      formData.address !== initialData.address ||
      formData.returnShippingCost !== initialData.returnShippingCost
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
  }, [selectedShippingCompanyKey, fetchTrigger]);

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

  useEffect(() => {
    if (governorates.length > 0 && formData.governorate && !selectedGovernorateKey) {
      const matchingGov = governorates.find(gov => gov.label === formData.governorate);
      if (matchingGov) {
        setSelectedGovernorateKey(matchingGov.key);
      }
    }
  }, [governorates, formData.governorate, selectedGovernorateKey]);

  const wasOpenRef = React.useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setFormData(initialData);
      if (initialData.shippingCompany) {
        setSelectedShippingCompanyKey(initialData.shippingCompany);
        setLoadingGovernorates(true);
      } else {
        setSelectedShippingCompanyKey('');
      }
      setSelectedGovernorateKey('');
      setGovernorates([]);
      setCities([]);
      setFetchTrigger(prev => prev + 1);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialData]);

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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل بيانات الشحن"
      onConfirm={handleSave}
      confirmText={isSaving ? 'جاري الحفظ...' : 'حفظ'}
      confirmIcon={<LiaCheckSolid className="w-5 h-5 text-white" />}
      isLoading={isSaving}
      confirmDisabled={!hasChanges}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              loading={loadingGovernorates || (!!selectedShippingCompanyKey && governorateOptions.length === 0)}
              disabled={!selectedShippingCompanyKey}
              searchThreshold={5}
            />
          </div>

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

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">العنوان بالتفصيل</label>
          <textarea
            value={formData.address || ''}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full border border-[#CED4DA] rounded-lg p-3 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="أدخل العنوان بالتفصيل..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">مبلغ الإلغاء فى حالة عدم الإستلام</label>
          <Input
            type="number"
            className='bg-white'
            value={formData.returnShippingCost ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                returnShippingCost: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="أدخل مبلغ الإلغاء..."
            min={0}
          />
        </div>
      </div>
    </BaseModal>
  );
}
