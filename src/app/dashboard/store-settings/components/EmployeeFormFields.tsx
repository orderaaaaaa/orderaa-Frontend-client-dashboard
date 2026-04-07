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
import { LogisticsSettingsSection } from './LogisticsSettingsSection';
import { UtmSourcesField } from './UtmSourcesField';
import { AutoCancelField } from './AutoCancelField';
import { ShippingSection } from './ShippingSection';
import { SectionHeader } from './SectionHeader';
import { Separator } from '@/components/ui/separator';

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
        <LogoUploadField watch={watch} setValue={setValue} errors={errors} />

        <Separator />

        <URLField register={register} errors={errors} />

        <Separator />

        <LanguageSelectionField register={register} />

        <Separator />

        <CancellationReasonsField
          watch={watch}
          setValue={setValue}
          errors={errors}
        />

        <Separator />

        <PostShippingReasonsField />

        <Separator />

        <LogisticsSettingsSection />

        <Separator />

        <UtmSourcesField
          watch={watch}
          setValue={setValue}
          errors={errors}
        />

        <Separator />

        <AutoCancelField register={register} errors={errors} />

        <If condition={hasShippingConfig}>
          <Then>
            <SectionHeader />
            <ShippingSection
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          </Then>
        </If>
      </div>
    </div>
  );
}
