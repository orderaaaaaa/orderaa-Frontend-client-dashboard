import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { useShippingConfig } from '../hooks/useShippingConfig';
import { If, Then } from 'react-if';
import { LogoUploadField } from './LogoUploadField';
import { URLField } from './URLField';
import { LanguageSelectionField } from './LanguageSelectionField';
import { CancellationReasonsField } from './CancellationReasonsField';
import { PostShippingReasonsField } from './PostShippingReasonsField';
import { ShippingCancellationReasonsField } from './ShippingCancellationReasonsField';
import { LogisticsSettingsSection } from './LogisticsSettingsSection';
import { UtmSourcesField } from './UtmSourcesField';
import { PageNamesField } from './PageNamesField';
import { AutoCancelField } from './AutoCancelField';
import { ShippingSection } from './ShippingSection';
import { GroupSection } from './SectionHeader';
import { ReservationSettingsSection } from './ReservationSettingsSection';

interface Props {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
}

export default function OrderSettingsFields({
  register,
  errors,
  watch,
  setValue,
}: Props) {
  const { hasShippingConfig } = useShippingConfig();

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 w-full" dir="rtl">
      <div className="space-y-6 sm:space-y-8">
        {/* 1. الملف الشخصي / Profile */}
        <GroupSection title="الملف الشخصي">
          <LogoUploadField watch={watch} setValue={setValue} errors={errors} />
          <URLField register={register} errors={errors} />
        </GroupSection>

        {/* 2. اللغة والتوطين / Language */}
        <GroupSection title="اللغة والتوطين">
          <LanguageSelectionField register={register} />
        </GroupSection>

        {/* 3. أسباب الإلغاء والمرتجعات / Cancellation & Returns */}
        <GroupSection title="أسباب الإلغاء والمرتجعات">
          <CancellationReasonsField
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
          <PostShippingReasonsField />
          <ShippingCancellationReasonsField />
        </GroupSection>

        {/* 4. اللوجستيات والشحن / Logistics & Shipping */}
        <GroupSection title="اللوجستيات والشحن">
          <LogisticsSettingsSection />
          <If condition={hasShippingConfig}>
            <Then>
              <ShippingSection
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            </Then>
          </If>
        </GroupSection>

        {/* 5. التسويق / Marketing */}
        <GroupSection title="التسويق">
          <UtmSourcesField
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
          <PageNamesField
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
        </GroupSection>

        {/* 6. الإعدادات التلقائية / Automation */}
        <GroupSection title="الإعدادات التلقائية">
          <AutoCancelField register={register} errors={errors} />
        </GroupSection>

        {/* 7. الجرد والحجز / Inventory & Reservation */}
        <GroupSection title="الجرد والحجز">
          <ReservationSettingsSection
            register={register}
            errors={errors}
            // `!== false`, not `!!`: the value is legitimately false (forbid)
            // and is undefined while the form hydrates — treating undefined as
            // false would flash "forbid" at every merchant.
            allowConfirmOutOfStock={watch('allowConfirmOutOfStock') !== false}
            onAllowConfirmOutOfStockChange={(checked) =>
              setValue('allowConfirmOutOfStock', checked, {
                shouldDirty: true,
              })
            }
          />
        </GroupSection>
      </div>
    </div>
  );
}
