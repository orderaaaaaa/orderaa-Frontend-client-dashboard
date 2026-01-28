import React, { useState, useEffect, useMemo } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid, LiaCheckSolid } from 'react-icons/lia';
import { Button } from '../ui/button';
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
  const [fetchTrigger, setFetchTrigger] = useState(0);

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
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-0"
          onPointerDownOutside={(e) => {
            if (isSaving) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isSaving) e.preventDefault();
          }}
        >
          <div className="sticky top-0 z-10 bg-gradient-to-b from-[#F3ECFF] to-[#E8D9FF] px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <DialogPrimitive.Title className="text-xl font-bold text-[#1F1F1F]">
              تعديل بيانات الشحن
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              disabled={isSaving}
            >
              <LiaTimesSolid className="w-6 h-6 text-[#1F1F1F] cursor-pointer" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="sr-only">
            تعديل بيانات الشحن للطلب
          </DialogPrimitive.Description>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

            <div className="flex flex-col gap-2 mb-8">
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

            <div className="flex justify-between">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-[146px] h-[37px] border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <LiaTimesSolid className="w-5 h-5 text-[#5F5E5E]" />
                <span className="text-lg font-bold text-[#5F5E5E]">إلغاء</span>
              </Button>

              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="w-[146px] h-[37px] bg-primary border-[1.5px] border-primary rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
