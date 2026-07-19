import { LiaWarehouseSolid } from 'react-icons/lia';
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { FormSwitch } from '@/components/ui/form-switch';
import Input from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface ReservationSettingsSectionProps {
  register: UseFormRegister<OrderSettingsFormData>;
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

export function ReservationSettingsSection({
  register,
  watch,
  setValue,
  errors,
}: ReservationSettingsSectionProps) {
  const reservationType = watch('reservationType');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LiaWarehouseSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            إعدادات الحجز والمخزون
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            تحديد نوع الحجز وحدود المخزون
          </p>
        </div>
      </div>

      {/* Reservation Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          نوع الحجز
        </label>
        <Select
          value={reservationType ?? 'ON_CONFIRMED'}
          onValueChange={(value: 'ON_CREATION' | 'ON_CONFIRMED') =>
            setValue('reservationType', value)
          }
        >
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="اختر نوع الحجز" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ON_CREATION">عند الإنشاء</SelectItem>
            <SelectItem value="ON_CONFIRMED">عند التأكيد</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          حدد متى يتم حجز المنتجات من المخزون
        </p>
      </div>

      <Separator />

      {/* Allow Negative Reservation */}
      <div className="flex items-start justify-between gap-4 relative">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
              السماح بحجز المخزون بالسالب
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              هل تريد السماح بحجز المنتجات حتى لو لم يتوفر مخزون كافٍ؟
            </p>
          </div>
        </div>
        <FormSwitch
          checked={!!watch('allowNegativeReservation')}
          onCheckedChange={(checked) =>
            setValue('allowNegativeReservation', checked)
          }
        />
      </div>

      <Separator />

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
    </div>
  );
}
