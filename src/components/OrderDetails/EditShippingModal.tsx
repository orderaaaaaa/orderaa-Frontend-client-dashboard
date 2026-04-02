import React, { useState, useEffect, useMemo } from 'react';
import { LiaCheckSolid, LiaClockSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { getShippingGovernorates, getShippingCities } from '@/lib/api/lookups';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useShippingCompanies } from '@/hooks';
import { useMerchantSettings } from '@/app/dashboard/store-settings/hooks/useStoreSettings';
import clsx from 'clsx';

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
  availableFrom?: string;
  availableTo?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const PERIODS = [
  { value: 'am', label: 'AM' },
  { value: 'pm', label: 'PM' },
] as const;

function parseTime(time?: string): { hour: number | null; period: string | null } {
  if (!time) return { hour: null, period: null };
  const arabicMatch = time.match(/(\d{1,2}):?\d{0,2}\s*(ص|م)/);
  if (arabicMatch) return { hour: parseInt(arabicMatch[1]), period: arabicMatch[2] === 'ص' ? 'am' : 'pm' };
  const englishMatch = time.match(/(\d{1,2}):?\d{0,2}\s*(am|pm)/i);
  if (englishMatch) return { hour: parseInt(englishMatch[1]), period: englishMatch[2].toLowerCase() };
  return { hour: null, period: null };
}

function InlineTimePicker({
  label,
  hour,
  period,
  onHourChange,
  onPeriodChange,
}: {
  label: string;
  hour: number | null;
  period: string | null;
  onHourChange: (h: number) => void;
  onPeriodChange: (p: string) => void;
}) {
  return (
    <div className="flex-1 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        {hour && period && (
          <span className="text-sm font-bold text-primary">
            {hour}:00 {period.toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex-1 grid grid-cols-6 gap-1">
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onHourChange(h)}
              className={clsx(
                'h-8 rounded-md text-sm font-medium transition-all',
                hour === h
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {h}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPeriodChange(p.value)}
              className={clsx(
                'h-8 px-3 rounded-md text-xs font-semibold transition-all',
                period === p.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
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
  const [returnShippingCostError, setReturnShippingCostError] = useState('');
  const [timeError, setTimeError] = useState('');

  const initialFromParsed = parseTime(initialData.availableFrom);
  const initialToParsed = parseTime(initialData.availableTo);
  const [startHour, setStartHour] = useState<number | null>(initialFromParsed.hour);
  const [startPeriod, setStartPeriod] = useState<string | null>(initialFromParsed.period);
  const [endHour, setEndHour] = useState<number | null>(initialToParsed.hour);
  const [endPeriod, setEndPeriod] = useState<string | null>(initialToParsed.period);

  const { settings } = useMerchantSettings();
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
    const timeChanged =
      startHour !== initialFromParsed.hour ||
      startPeriod !== initialFromParsed.period ||
      endHour !== initialToParsed.hour ||
      endPeriod !== initialToParsed.period;

    return (
      formData.shippingCompany !== initialData.shippingCompany ||
      formData.governorate !== initialData.governorate ||
      formData.city !== initialData.city ||
      formData.address !== initialData.address ||
      formData.returnShippingCost !== initialData.returnShippingCost ||
      timeChanged
    );
  }, [formData, initialData, startHour, startPeriod, endHour, endPeriod, initialFromParsed, initialToParsed]);

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
      const defaultCost =
        initialData.returnShippingCost != null
          ? initialData.returnShippingCost
          : settings?.defaultReturnShippingCost ?? undefined;

      setFormData({ ...initialData, returnShippingCost: defaultCost });
      setReturnShippingCostError('');
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
      const fromParsed = parseTime(initialData.availableFrom);
      const toParsed = parseTime(initialData.availableTo);
      setStartHour(fromParsed.hour);
      setStartPeriod(fromParsed.period);
      setEndHour(toParsed.hour);
      setEndPeriod(toParsed.period);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialData, settings?.defaultReturnShippingCost]);

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    const isTimeComplete = startHour && startPeriod && endHour && endPeriod;
    if (!isTimeComplete) {
      setTimeError('يرجى اختيار وقت التوصيل');
    } else {
      setTimeError('');
    }

    if (formData.returnShippingCost === undefined || formData.returnShippingCost === null) {
      setReturnShippingCostError('هذا الحقل مطلوب');
    } else {
      setReturnShippingCostError('');
    }

    if (!isTimeComplete || formData.returnShippingCost === undefined || formData.returnShippingCost === null) {
      return;
    }

    const dataToSave: ShippingData = { ...formData };
    if (startHour && startPeriod) {
      dataToSave.availableFrom = `${startHour} ${startPeriod}`;
    }
    if (endHour && endPeriod) {
      dataToSave.availableTo = `${endHour} ${endPeriod}`;
    }

    setIsSaving(true);
    try {
      await onSave(dataToSave);
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
          <label className="font-bold text-[#1F1F1F]">مبلغ الإلغاء فى حالة عدم الإستلام <span className="text-red-500">*</span></label>
          <Input
            type="number"
            className='bg-white'
            value={formData.returnShippingCost ?? ''}
            onChange={(e) => {
              setReturnShippingCostError('');
              setFormData({
                ...formData,
                returnShippingCost: e.target.value ? Number(e.target.value) : undefined,
              });
            }}
            placeholder="أدخل مبلغ الإلغاء..."
            min={0}
            error={returnShippingCostError}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LiaClockSolid className="w-5 h-5 text-primary" />
            <label className="font-bold text-[#1F1F1F]">وقت التوصيل <span className="text-red-500">*</span></label>
          </div>
          <div className={clsx('bg-gray-50 rounded-xl border p-4 space-y-4', timeError ? 'border-red-400' : 'border-gray-200')}>
            <div className="flex flex-col md:flex-row gap-6">
              <InlineTimePicker
                label="من"
                hour={startHour}
                period={startPeriod}
                onHourChange={(h) => { setStartHour(h); setTimeError(''); }}
                onPeriodChange={(p) => { setStartPeriod(p); setTimeError(''); }}
              />
              <div className="hidden md:flex items-center pt-6">
                <div className="w-px h-full bg-gray-200" />
              </div>
              <InlineTimePicker
                label="إلى"
                hour={endHour}
                period={endPeriod}
                onHourChange={(h) => { setEndHour(h); setTimeError(''); }}
                onPeriodChange={(p) => { setEndPeriod(p); setTimeError(''); }}
              />
            </div>
            {startHour && startPeriod && endHour && endPeriod && (
              <div className="flex items-center justify-center gap-2 py-2 bg-primary/5 rounded-lg">
                <LiaClockSolid className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">
                  {startHour}:00 {startPeriod.toUpperCase()} — {endHour}:00 {endPeriod.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {timeError && (
            <p className="text-sm text-red-500 mt-1">{timeError}</p>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
