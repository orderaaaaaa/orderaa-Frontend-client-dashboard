import {
  LiaWarehouseSolid,
  LiaLockOpenSolid,
  LiaLockSolid,
} from 'react-icons/lia';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import Input from '@/components/ui/Input';
import { FormSwitch } from '@/components/ui/form-switch';
import { Separator } from '@/components/ui/separator';

interface ReservationSettingsSectionProps {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
  /**
   * T27 — passed as a plain value and setter rather than the form's `watch` /
   * `setValue`: this section needs one boolean, not the whole form API.
   */
  allowConfirmOutOfStock: boolean;
  onAllowConfirmOutOfStockChange: (value: boolean) => void;
}

export function ReservationSettingsSection({
  register,
  errors,
  allowConfirmOutOfStock,
  onAllowConfirmOutOfStockChange,
}: ReservationSettingsSectionProps) {
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

      {/* T27 — the store-level confirmation rule. A product can override it. */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* The icon tracks the switch: an open padlock when confirming
              out-of-stock is permitted, a closed one when it is blocked. A
              static warning triangle described neither state and read as if
              the setting itself were dangerous. */}
          {allowConfirmOutOfStock ? (
            <LiaLockOpenSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
          ) : (
            <LiaLockSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-700">
              السماح بتأكيد الطلبات غير المتوفرة بالمخزون
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {allowConfirmOutOfStock
                ? 'يمكن لموظف خدمة العملاء تأكيد الطلب حتى لو كان المنتج غير متوفر. يمكن منع ذلك لمنتج بعينه من صفحة المنتجات.'
                : 'لن يتمكن الموظف من تأكيد طلب يحتوي على منتج غير متوفر — سيُطلب منه اختيار منتج آخر. يمكن استثناء منتج بعينه من صفحة المنتجات.'}
            </p>
          </div>
        </div>
        <FormSwitch
          checked={allowConfirmOutOfStock}
          onCheckedChange={onAllowConfirmOutOfStockChange}
        />
      </div>
    </div>
  );
}
