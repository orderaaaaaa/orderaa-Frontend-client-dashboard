import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LiaCheckSolid, LiaClockSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Checkbox } from '@/components/ui/checkbox';
import Input from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import {
  GovernorateListError,
  GovernorateSourceEmpty,
} from '@/components/shipping/GovernorateListStatus';
import { useShippingCompanies } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useLocationSyncRetry } from '@/services/shippingLocationSync';
import {
  useLocationOptionCities,
  useLocationOptionGovernorates,
} from '@/services/lookups';
import {
  locationOptionsErrorTextOf,
  locationSelectOptionsOf,
} from '@/types/locationOptions';
import {
  shippingCompanyIdOf,
  shippingCompanySelectOptionsOf,
} from '@/lib/shippingCompanies';
import {
  CARRIER_UPDATE_NOT_SUPPORTED_MESSAGE,
  SHIPPING_COMPANY_REQUIRED_MESSAGE,
} from '@/types/shippingCompanies';
import type { ShippingSwitchMissingField } from '@/types/carrierSends';
import { merchantSettingsApi } from '@/app/dashboard/store-settings/api/storeApi';
import clsx from 'clsx';

export type EditShippingSection = 'company' | 'location' | 'address' | 'returnCost' | 'deliveryWindow';

const ALL_SHIPPING_SECTIONS: readonly EditShippingSection[] = [
  'company',
  'location',
  'address',
  'returnCost',
  'deliveryWindow',
];

const SECTION_FIELDS: Record<EditShippingSection, readonly (keyof ShippingData)[]> = {
  company: ['shippingCompanyId', 'shippingCompanyName', 'oldShipmentCancelledByHand'],
  location: ['governorate', 'city', 'governorateOption', 'cityOption', 'externalGovernorate'],
  address: ['address'],
  returnCost: ['returnShippingCost'],
  deliveryWindow: ['availableFrom', 'availableTo'],
};

const pickEnabledFields = (
  data: ShippingData,
  enabled: ReadonlySet<EditShippingSection>
): ShippingData => {
  const allowedKeys = ALL_SHIPPING_SECTIONS.filter((section) => enabled.has(section)).flatMap(
    (section) => SECTION_FIELDS[section]
  );
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => (allowedKeys as readonly string[]).includes(key))
  ) as ShippingData;
};

interface EditShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ShippingData) => Promise<void>;
  initialData: ShippingData;
  requireCompany?: boolean;
  orderId?: number;
  customerHasPhone: boolean;
  carrierSupportsUpdate?: boolean;
  oldIntegrationShipment?: { shippingId: string; carrierName: string } | null;
  sections?: readonly EditShippingSection[];
  title?: string;
}

export interface ShippingData {
  shippingCompanyId?: number | null;
  shippingCompanyName?: string;
  governorate?: string;
  city?: string;
  governorateOption?: string | null;
  cityOption?: string | null;
  address?: string;
  externalGovernorate?: string | null;
  returnShippingCost?: number;
  availableFrom?: string;
  availableTo?: string;
  oldShipmentCancelledByHand?: boolean;
}

const RETURN_SHIPPING_COST_NEGATIVE_MESSAGE = 'يجب أن تكون القيمة صفر أو أكثر';

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
        <span className="text-sm font-semibold text-foreground">{label}</span>
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
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
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
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
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

export default function EditShippingModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  requireCompany = false,
  orderId,
  customerHasPhone,
  carrierSupportsUpdate,
  oldIntegrationShipment,
  sections = ALL_SHIPPING_SECTIONS,
  title = 'تعديل بيانات الشحن',
}: EditShippingModalProps) {
  const [formData, setFormData] = useState<ShippingData>(initialData);
  const enabledSections = new Set(sections);
  const companyEnabled = enabledSections.has('company');
  const locationEnabled = enabledSections.has('location');
  const addressEnabled = enabledSections.has('address');
  const returnCostEnabled = enabledSections.has('returnCost');
  const deliveryWindowEnabled = enabledSections.has('deliveryWindow');

  const [isSaving, setIsSaving] = useState(false);
  const [oldCancelledByHand, setOldCancelledByHand] = useState(false);
  const [returnShippingCostError, setReturnShippingCostError] = useState('');
  const [shippingCompanyError, setShippingCompanyError] = useState('');

  const initialFromParsed = parseTime(initialData.availableFrom);
  const initialToParsed = parseTime(initialData.availableTo);
  const [startHour, setStartHour] = useState<number | null>(initialFromParsed.hour);
  const [startPeriod, setStartPeriod] = useState<string | null>(initialFromParsed.period);
  const [endHour, setEndHour] = useState<number | null>(initialToParsed.hour);
  const [endPeriod, setEndPeriod] = useState<string | null>(initialToParsed.period);

  const isAllSections = sections.length === ALL_SHIPPING_SECTIONS.length;
  const canReadMerchantSettings = useHasPermission(PERMISSION_CODES.MERCHANT_SETTINGS_READ);
  const settingsQuery = useQuery({
    queryKey: ['merchantSettings'],
    queryFn: merchantSettingsApi.getSettings,
    enabled: returnCostEnabled && (isAllSections || canReadMerchantSettings),
  });
  const defaultReturnShippingCost = settingsQuery.data?.defaultReturnShippingCost;
  const { t } = useI18n();
  const switchMissingFieldLabels: Record<ShippingSwitchMissingField, string> = {
    governorate: t('canonical.shipping.governorateLabel'),
    city: t('canonical.shipping.cityLabel'),
    phone: t('canonical.shipping.phoneLabel'),
  };
  const { shippingCompanies, isLoading: loadingShippingCompanies } = useShippingCompanies(isOpen && (companyEnabled || locationEnabled));
  const canReadCanonicalNames = useHasPermission(PERMISSION_CODES.CANONICAL_NAMES_READ);

  const selectedShippingCompanyId = formData.shippingCompanyId ?? null;
  const selectedGovernorateOption = formData.governorateOption || undefined;
  const governoratesQuery = useLocationOptionGovernorates(
    isOpen && locationEnabled ? selectedShippingCompanyId : null,
    orderId
  );
  const citiesQuery = useLocationOptionCities(
    isOpen && locationEnabled ? selectedShippingCompanyId : null,
    selectedGovernorateOption,
    orderId
  );
  const loadingGovernorates = governoratesQuery.isLoading;
  const loadingCities = citiesQuery.isLoading;
  const noGovernorateList = governoratesQuery.data?.sourceHasRows === false;
  const selectedCompanyCode =
    shippingCompanies.find((company) => company.id === selectedShippingCompanyId)?.code ?? null;
  const syncRetry = useLocationSyncRetry(selectedCompanyCode);

  const shippingCompanyOptions = useMemo(
    () => shippingCompanySelectOptionsOf(shippingCompanies),
    [shippingCompanies]
  );

  const shippingCompanyDisplay =
    shippingCompanyOptions.find((option) => option.key === String(selectedShippingCompanyId))
      ?.label ??
    (selectedShippingCompanyId !== null &&
    selectedShippingCompanyId === initialData.shippingCompanyId
      ? initialData.shippingCompanyName
      : undefined);

  const governorateOptions = useMemo(
    () => locationSelectOptionsOf(governoratesQuery.data?.options ?? []),
    [governoratesQuery.data]
  );

  const cityOptions = useMemo(
    () => locationSelectOptionsOf(citiesQuery.data?.options ?? []),
    [citiesQuery.data]
  );

  const governorateDisplay =
    governorateOptions.find((option) => option.key === formData.governorateOption)?.label ??
    (formData.governorateOption && formData.governorateOption === initialData.governorateOption
      ? initialData.governorate
      : undefined);

  const cityDisplay =
    cityOptions.find((option) => option.key === formData.cityOption)?.label ??
    (formData.cityOption && formData.cityOption === initialData.cityOption
      ? initialData.city
      : undefined);

  const storedGovernorateText = initialData.governorateOption
    ? ''
    : initialData.governorate || initialData.externalGovernorate || '';
  const storedCityText = initialData.cityOption ? '' : initialData.city || '';

  const hasChanges = useMemo(() => {
    const timeChanged =
      startHour !== initialFromParsed.hour ||
      startPeriod !== initialFromParsed.period ||
      endHour !== initialToParsed.hour ||
      endPeriod !== initialToParsed.period;

    return (
      (companyEnabled && (formData.shippingCompanyId ?? null) !== (initialData.shippingCompanyId ?? null)) ||
      (locationEnabled &&
        ((formData.governorateOption ?? null) !== (initialData.governorateOption ?? null) ||
          (formData.cityOption ?? null) !== (initialData.cityOption ?? null))) ||
      (addressEnabled && formData.address !== initialData.address) ||
      (returnCostEnabled && (formData.returnShippingCost ?? null) !== (initialData.returnShippingCost ?? null)) ||
      (deliveryWindowEnabled && timeChanged)
    );
  }, [
    formData,
    initialData,
    startHour,
    startPeriod,
    endHour,
    endPeriod,
    initialFromParsed,
    initialToParsed,
    companyEnabled,
    locationEnabled,
    addressEnabled,
    returnCostEnabled,
    deliveryWindowEnabled,
  ]);

  const companyChanged =
    companyEnabled && (formData.shippingCompanyId ?? null) !== (initialData.shippingCompanyId ?? null);
  const isSwitch = companyChanged && formData.shippingCompanyId != null;
  const attestedShipment = isSwitch ? (oldIntegrationShipment ?? null) : null;
  const costLocked = carrierSupportsUpdate === false;
  const attestationMissing = attestedShipment !== null && !oldCancelledByHand;

  const switchMissingFields: ShippingSwitchMissingField[] = [];
  if (isSwitch) {
    if (!formData.governorateOption && !initialData.governorate) switchMissingFields.push('governorate');
    if (!formData.cityOption && !initialData.city) switchMissingFields.push('city');
    if (!customerHasPhone) switchMissingFields.push('phone');
  }

  const wasOpenRef = React.useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const defaultCost =
        initialData.returnShippingCost != null
          ? initialData.returnShippingCost
          : costLocked || !returnCostEnabled
            ? undefined
            : defaultReturnShippingCost ?? undefined;

      setFormData({ ...initialData, returnShippingCost: defaultCost });
      setReturnShippingCostError('');
      setShippingCompanyError('');
      setOldCancelledByHand(false);
      const fromParsed = parseTime(initialData.availableFrom);
      const toParsed = parseTime(initialData.availableTo);
      setStartHour(fromParsed.hour);
      setStartPeriod(fromParsed.period);
      setEndHour(toParsed.hour);
      setEndPeriod(toParsed.period);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialData, defaultReturnShippingCost, costLocked, returnCostEnabled]);

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    if (companyEnabled && requireCompany && formData.shippingCompanyId == null) {
      setShippingCompanyError(SHIPPING_COMPANY_REQUIRED_MESSAGE);
      return;
    }
    setShippingCompanyError('');

    if (attestationMissing) return;

    if (
      returnCostEnabled &&
      !costLocked &&
      (formData.returnShippingCost === undefined || formData.returnShippingCost === null)
    ) {
      setReturnShippingCostError('هذا الحقل مطلوب');
      return;
    } else if (returnCostEnabled && formData.returnShippingCost !== undefined && formData.returnShippingCost < 0) {
      setReturnShippingCostError(RETURN_SHIPPING_COST_NEGATIVE_MESSAGE);
      return;
    } else {
      setReturnShippingCostError('');
    }

    if (switchMissingFields.length > 0) return;

    const dataToSave: ShippingData = { ...formData };
    if (attestedShipment) {
      dataToSave.oldShipmentCancelledByHand = oldCancelledByHand;
    }
    if (returnCostEnabled && costLocked) {
      dataToSave.returnShippingCost = initialData.returnShippingCost;
    }
    if (deliveryWindowEnabled && startHour && startPeriod) {
      dataToSave.availableFrom = `${startHour} ${startPeriod}`;
    }
    if (deliveryWindowEnabled && endHour && endPeriod) {
      dataToSave.availableTo = `${endHour} ${endPeriod}`;
    }

    setIsSaving(true);
    try {
      await onSave(
        isAllSections
          ? dataToSave
          : pickEnabledFields(dataToSave, enabledSections)
      );
      onClose();
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const handleShippingCompanyChange = (key: string) => {
    const shippingCompanyId = shippingCompanyIdOf(key);
    if (shippingCompanyId === (formData.shippingCompanyId ?? null)) return;
    setShippingCompanyError('');
    setFormData({
      ...formData,
      shippingCompanyId,
      governorate: '',
      city: '',
      governorateOption: null,
      cityOption: null,
    });
  };

  const handleGovernorateChange = (value: string) => {
    if (value === formData.governorateOption) return;
    setFormData({
      ...formData,
      governorateOption: value || null,
      cityOption: null,
    });
  };

  const handleCityChange = (value: string) => {
    setFormData({
      ...formData,
      cityOption: value || null,
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onConfirm={handleSave}
      confirmText={isSaving ? 'جاري الحفظ...' : 'حفظ'}
      confirmIcon={<LiaCheckSolid className="w-5 h-5 text-white" />}
      isLoading={isSaving}
      confirmDisabled={!hasChanges || switchMissingFields.length > 0 || attestationMissing}
    >
      <div className="space-y-6">
        {(companyEnabled || locationEnabled) && (
        <div className={clsx('grid grid-cols-1 gap-6', companyEnabled ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
        {companyEnabled && (
          <div className="flex flex-col gap-2">
            <label className="font-bold text-foreground">الشركة</label>
            <SearchableSelect
              value={selectedShippingCompanyId !== null ? String(selectedShippingCompanyId) : ''}
              displayValue={shippingCompanyDisplay}
              onValueChange={handleShippingCompanyChange}
              options={shippingCompanyOptions}
              clearable={!requireCompany}
              error={shippingCompanyError}
              placeholder="اختر الشركة"
              searchPlaceholder="بحث عن شركة..."
              emptyMessage="لا توجد شركات متاحة"
              noResultsMessage="لا توجد نتائج للبحث"
              triggerClassName="w-full border-input rounded-lg h-12"
              searchThreshold={5}
              loading={loadingShippingCompanies}
            />
            {switchMissingFields.length > 0 && (
              <p className="text-sm text-destructive">
                لا يمكن تغيير شركة الشحن قبل إدخال: {switchMissingFields.map((field) => switchMissingFieldLabels[field]).join('، ')}
              </p>
            )}
            {attestedShipment && (
              <label className="flex items-start gap-2 text-sm text-foreground">
                <Checkbox
                  checked={oldCancelledByHand}
                  onCheckedChange={(checked) => setOldCancelledByHand(checked === true)}
                  className="mt-0.5"
                />
                <span>
                  ألغيت الشحنة القديمة {attestedShipment.shippingId} لدى {attestedShipment.carrierName} يدوياً
                </span>
              </label>
            )}
            {attestationMissing && (
              <p className="text-sm text-destructive">
                أكّد إلغاء الشحنة القديمة يدوياً لدى شركة الشحن السابقة لحفظ تغيير الشركة
              </p>
            )}
          </div>
        )}

          {locationEnabled && (<>
          <div className="flex flex-col gap-2">
            <label htmlFor="edit-shipping-governorate" className="font-bold text-foreground">{t('canonical.shipping.governorateLabel')}</label>
            <SearchableSelect
              id="edit-shipping-governorate"
              aria-label={t('canonical.shipping.governorateLabel')}
              value={formData.governorateOption || ''}
              displayValue={governorateDisplay}
              onValueChange={handleGovernorateChange}
              options={governorateOptions}
              placeholder={
                selectedShippingCompanyId === null ? 'اختر الشركة أولاً' : 'اختر المحافظة'
              }
              searchPlaceholder="بحث عن محافظة..."
              emptyMessage={
                selectedShippingCompanyId === null
                  ? 'اختر الشركة أولاً'
                  : noGovernorateList
                    ? 'لا توجد قائمة محافظات لهذه الشركة بعد'
                    : 'لا توجد محافظات متاحة'
              }
              noResultsMessage="لا توجد نتائج للبحث"
              triggerClassName="w-full border-input rounded-lg h-12"
              loading={loadingGovernorates}
              disabled={selectedShippingCompanyId === null || noGovernorateList || governoratesQuery.isError}
              searchThreshold={5}
            />
            {noGovernorateList && (
              <GovernorateSourceEmpty
                canRead={canReadCanonicalNames}
                sync={governoratesQuery.data?.sync}
                retry={syncRetry}
              />
            )}
            {governoratesQuery.isError && (
              <GovernorateListError
                error={governoratesQuery.error}
                onRetry={() => void governoratesQuery.refetch()}
              />
            )}
            {storedGovernorateText && !formData.governorateOption && (
              <p className="text-xs text-muted-foreground">
                المحفوظ حاليا: {storedGovernorateText}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="edit-shipping-city" className="font-bold text-foreground">{t('canonical.shipping.cityLabel')}</label>
            <SearchableSelect
              id="edit-shipping-city"
              aria-label={t('canonical.shipping.cityLabel')}
              value={formData.cityOption || ''}
              displayValue={cityDisplay}
              onValueChange={handleCityChange}
              options={cityOptions}
              placeholder={
                selectedShippingCompanyId === null
                  ? 'اختر الشركة أولاً'
                  : !selectedGovernorateOption
                    ? 'اختر المحافظة أولاً'
                    : t('canonical.shipping.cityPlaceholder')
              }
              searchPlaceholder={t('canonical.shipping.citySearch')}
              emptyMessage={
                selectedShippingCompanyId === null
                  ? 'اختر الشركة أولاً'
                  : !selectedGovernorateOption
                    ? 'اختر المحافظة أولاً'
                    : t('canonical.shipping.cityEmpty')
              }
              noResultsMessage="لا توجد نتائج للبحث"
              triggerClassName="w-full border-input rounded-lg h-12"
              loading={loadingCities}
              disabled={selectedShippingCompanyId === null || !selectedGovernorateOption}
              searchThreshold={5}
            />
            {citiesQuery.isError && (
              <p className="text-sm text-destructive">
                {locationOptionsErrorTextOf(citiesQuery.error, t('canonical.shipping.cityLoadError'))}
              </p>
            )}
            {storedCityText && !formData.cityOption && (
              <p className="text-xs text-muted-foreground">المحفوظ حاليا: {storedCityText}</p>
            )}
          </div>
          </>)}
        </div>
        )}

        {addressEnabled && (
        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">العنوان بالتفصيل</label>
          <textarea
            value={formData.address || ''}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full border border-input rounded-lg p-3 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="أدخل العنوان بالتفصيل..."
          />
        </div>
        )}

        {returnCostEnabled && (
        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">{isAllSections ? 'مبلغ الإلغاء في حالة عدم الاستلام' : 'تكلفة المرتجع'} <span className="text-destructive">*</span></label>
          <Input
            type="number"
            className='bg-card'
            value={formData.returnShippingCost ?? ''}
            onChange={(e) => {
              setReturnShippingCostError('');
              setFormData({
                ...formData,
                returnShippingCost: e.target.value ? Number(e.target.value) : undefined,
              });
            }}
            placeholder={isAllSections ? 'أدخل مبلغ الإلغاء في حالة عدم الاستلام...' : 'أدخل تكلفة المرتجع...'}
            min={0}
            disabled={costLocked}
            error={returnShippingCostError}
          />
          {costLocked && (
            <p className="text-sm text-destructive">{CARRIER_UPDATE_NOT_SUPPORTED_MESSAGE}</p>
          )}
        </div>
        )}

        {deliveryWindowEnabled && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LiaClockSolid className="w-5 h-5 text-primary" />
            <label className="font-bold text-foreground">وقت التوصيل</label>
          </div>
          <div className="bg-muted/50 rounded-xl border border-border p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <InlineTimePicker
                label="من"
                hour={startHour}
                period={startPeriod}
                onHourChange={(h) => { setStartHour(h); }}
                onPeriodChange={(p) => { setStartPeriod(p); }}
              />
              <div className="hidden md:flex items-center pt-6">
                <div className="w-px h-full bg-border" />
              </div>
              <InlineTimePicker
                label="إلى"
                hour={endHour}
                period={endPeriod}
                onHourChange={(h) => { setEndHour(h); }}
                onPeriodChange={(p) => { setEndPeriod(p); }}
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
        </div>
        )}
      </div>
    </BaseModal>
  );
}
