import { useMemo } from 'react';
import type { IconType } from 'react-icons';
import {
  LiaWarehouseSolid,
  LiaLockOpenSolid,
  LiaLockSolid,
  LiaRandomSolid,
} from 'react-icons/lia';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { useI18n } from '@/i18n/I18nProvider';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { CONFIRM_MODES, type ConfirmMode } from '@/lib/api/warehouses';
import {
  confirmModeToStoreValue,
  isConfirmMode,
  storeValueToConfirmMode,
  type StoreConfirmOutOfStock,
} from '@/utils/storeConfirmMode';
import { Separator } from '@/components/ui/separator';

interface ReservationSettingsSectionProps {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
  allowConfirmOutOfStock: StoreConfirmOutOfStock;
  onAllowConfirmOutOfStockChange: (value: StoreConfirmOutOfStock) => void;
}

const MODE_ICONS: Record<ConfirmMode, IconType> = {
  [CONFIRM_MODES.FOLLOW_WORKFLOW]: LiaRandomSolid,
  [CONFIRM_MODES.ALLOW]: LiaLockOpenSolid,
  [CONFIRM_MODES.FORBID]: LiaLockSolid,
};

const MODE_LABEL_KEYS = {
  [CONFIRM_MODES.FOLLOW_WORKFLOW]: 'storeSettings.confirmOutOfStock.followWorkflow',
  [CONFIRM_MODES.ALLOW]: 'storeSettings.confirmOutOfStock.allowNegative',
  [CONFIRM_MODES.FORBID]: 'storeSettings.confirmOutOfStock.forbid',
} as const;

const MODE_DESCRIPTION_KEYS = {
  [CONFIRM_MODES.FOLLOW_WORKFLOW]:
    'storeSettings.confirmOutOfStock.followWorkflowDescription',
  [CONFIRM_MODES.ALLOW]: 'storeSettings.confirmOutOfStock.allowNegativeDescription',
  [CONFIRM_MODES.FORBID]: 'storeSettings.confirmOutOfStock.forbidDescription',
} as const;

const MODE_ORDER: ConfirmMode[] = [
  CONFIRM_MODES.FOLLOW_WORKFLOW,
  CONFIRM_MODES.ALLOW,
  CONFIRM_MODES.FORBID,
];

export function ReservationSettingsSection({
  register,
  errors,
  allowConfirmOutOfStock,
  onAllowConfirmOutOfStockChange,
}: ReservationSettingsSectionProps) {
  // Only the confirm-out-of-stock block below is on the catalogue; the min/max
  // stock copy above it belongs to the un-migrated bulk of the dashboard.
  const { t } = useI18n();
  const mode = storeValueToConfirmMode(allowConfirmOutOfStock);
  const ModeIcon = MODE_ICONS[mode];
  const options = useMemo(
    () =>
      MODE_ORDER.map((key) => ({ key, value: t(MODE_LABEL_KEYS[key]) })),
    [t]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LiaWarehouseSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            حدود المخزون
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            تنبيهات الحد الأدنى والأقصى للمخزون
          </p>
        </div>
      </div>

      {/* Min Stock Level */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          الحد الأدنى للمخزون
        </label>
        <Input
          name="minStockLevel"
          type="number"
          min={0}
          placeholder="0"
          className="w-full max-w-sm"
          register={register}
          registerOptions={{
            setValueAs: (v: string | number | null) => {
              if (v === '' || v === null || v === undefined) return null;
              const num = parseInt(String(v), 10);
              if (isNaN(num)) return null;
              return num < 0 ? 0 : num;
            },
          }}
          error={errors.minStockLevel?.message}
        />
        <p className="text-xs text-gray-500">
          تنبيه عند انخفاض المخزون عن هذا الحد
        </p>
      </div>

      <Separator />

      {/* Max Stock Level */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          الحد الأقصى للمخزون
        </label>
        <Input
          name="maxStockLevel"
          type="number"
          min={0}
          placeholder="0"
          className="w-full max-w-sm"
          register={register}
          registerOptions={{
            setValueAs: (v: string | number | null) => {
              if (v === '' || v === null || v === undefined) return null;
              const num = parseInt(String(v), 10);
              if (isNaN(num)) return null;
              return num < 0 ? 0 : num;
            },
          }}
          error={errors.maxStockLevel?.message}
        />
        <p className="text-xs text-gray-500">
          تنبيه عند تجاوز المخزون هذا الحد
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <ModeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-700">
              {t('storeSettings.confirmOutOfStock.title')}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {t(MODE_DESCRIPTION_KEYS[mode])}
            </p>
          </div>
        </div>
        <SearchableSelect
          value={mode}
          options={options}
          widthClass="w-full sm:w-56"
          searchThreshold={10}
          onChange={(key) => {
            if (isConfirmMode(key)) {
              onAllowConfirmOutOfStockChange(confirmModeToStoreValue(key));
            }
          }}
        />
      </div>
    </div>
  );
}
