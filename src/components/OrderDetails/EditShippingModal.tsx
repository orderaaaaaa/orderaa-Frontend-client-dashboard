import React, { useState, useEffect } from 'react';
import { LiaTimesSolid, LiaCheckCircle } from 'react-icons/lia';
import { Button } from '../ui/button';
import { getGovernorates, getCities } from '@/lib/api/lookups';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

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
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Wait for animation to complete before calling onSave
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      onClose();
    }, 600);
  };

  const handleGovernorateChange = (value: string) => {
    const governorate = governorates.find(g => g.name === value);
    setSelectedGovernorateId(governorate?.id || '');
    setFormData({
      ...formData,
      governorate: value,
      city: '', // Reset city when governorate changes
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${
          isSaving ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
        }`}>
        {/* Success Animation Overlay */}
        {isSaving && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-2xl z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <LiaCheckCircle
                  className="w-24 h-24 text-green-500 animate-[bounce_0.6s_ease-in-out]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-green-500 animate-ping opacity-75"></div>
                </div>
              </div>
              <p className="text-lg font-bold text-green-600 animate-pulse">تم الحفظ بنجاح</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-[#F3ECFF] to-[#E8D9FF] px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-[#1F1F1F]">تعديل بيانات الشحن</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            disabled={isSaving}
          >
            <LiaTimesSolid className="w-6 h-6 text-[#1F1F1F] cursor-pointer" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Company Field */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[#1F1F1F]">الشركة</label>
              <Select
                value={formData.shippingCompany}
                onValueChange={(value) =>
                  setFormData({ ...formData, shippingCompany: value })
                }
              >
                <SelectTrigger className="w-full border-[#CED4DA] rounded-lg h-12">
                  <SelectValue placeholder="اختر الشركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ارامبكس">ارامبكس</SelectItem>
                  <SelectItem value="فيدكس">فيدكس</SelectItem>
                  <SelectItem value="DHL">DHL</SelectItem>
                  <SelectItem value="شركة أخرى">شركة أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Governorate Field */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[#1F1F1F]">المحافظة</label>
              <Select
                value={formData.governorate}
                onValueChange={handleGovernorateChange}
                disabled={loadingGovernorates}
              >
                <SelectTrigger className="w-full border-[#CED4DA] rounded-lg h-12">
                  <SelectValue placeholder={loadingGovernorates ? "جاري التحميل..." : "اختر المحافظة"} />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map((gov) => (
                    <SelectItem key={gov.id} value={gov.name}>
                      {gov.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Area/City Field */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[#1F1F1F]">المنطقة</label>
              <Select
                value={formData.city}
                onValueChange={(value) =>
                  setFormData({ ...formData, city: value })
                }
                disabled={!selectedGovernorateId || loadingCities}
              >
                <SelectTrigger className="w-full border-[#CED4DA] rounded-lg h-12">
                  <SelectValue
                    placeholder={
                      loadingCities
                        ? "جاري التحميل..."
                        : !selectedGovernorateId
                          ? "اختر المحافظة أولاً"
                          : "اختر المنطقة"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-[#5D24E1] hover:bg-[#4B1BC4] text-white font-bold py-3 px-20 rounded-full text-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
              disabled={isSaving}
            >
              حفظ
              <LiaCheckCircle className="w-6 h-6" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
